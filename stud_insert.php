<?php
session_start();
include("connect.php");

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed. Expected POST.']);
    exit();
}

if (isset($_POST['student_id'])) {
    $_SESSION['student_name'] = 'OK';
}

if (!isset($_SESSION['student_name'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access. Please log in.']);
    exit();
}

$student_id = trim($_POST['student_id'] ?? '');
$student_name = trim($_POST['student_name'] ?? '');
$title = trim($_POST['title'] ?? ($_SESSION['Title'] ?? ''));
$type = trim($_POST['type'] ?? '');

// If student_name was not rendered in HTML, provide default
if (empty($student_name)) {
    $student_name = 'N/A';
}

$result = null;

// 1. Check if the client already sent valid structured JSON
if (!empty($_POST['survey_result'])) {
    $decodedClientJson = json_decode($_POST['survey_result'], true);
    if (json_last_error() === JSON_ERROR_NONE && !empty($decodedClientJson)) {
        $result = json_encode($decodedClientJson, JSON_UNESCAPED_UNICODE);
    }
}

// 2. Server-side fallback: Rebuild using database/session template if client JSON was empty
if (empty($result)) {
    $groupedAnswers = [];
    $templateFields = $_SESSION['fields'] ?? [];

    if (empty($templateFields)) {
        $stmt_tmpl = $conn->prepare("SELECT Data FROM isw_activity WHERE Title = ?");
        if ($stmt_tmpl) {
            $stmt_tmpl->bind_param("s", $title);
            $stmt_tmpl->execute();
            $tmpl_res = $stmt_tmpl->get_result()->fetch_assoc();
            if ($tmpl_res && !empty($tmpl_res['Data'])) {
                $templateFields = json_decode($tmpl_res['Data'], true);
            }
            $stmt_tmpl->close();
        }
    }

    if (!empty($templateFields)) {
        $firstKey = array_key_first($templateFields);
        if (is_int($firstKey) || isset($templateFields[$firstKey]['name'])) {
            $templateFields = ['General' => $templateFields];
        }

        foreach ($templateFields as $groupName => $groupItems) {
            if (!isset($groupedAnswers[$groupName])) {
                $groupedAnswers[$groupName] = [];
            }

            foreach ($groupItems as $field) {
                $fieldName = $field['name'];

                if ($fieldName === 'student_id' || $fieldName === 'student_name') {
                    continue;
                }

                if ($field['type'] === 'rating' && $fieldName !== 'Overall_satisfaction') {
                    $groupedAnswers[$groupName][] = [
                        'name' => $fieldName,
                        'label' => $field['label'] ?? '',
                        'value_before' => $_POST[$fieldName . '_before'] ?? null,
                        'value_after' => $_POST[$fieldName . '_after'] ?? null
                    ];
                } else {
                    $groupedAnswers[$groupName][] = [
                        'name' => $fieldName,
                        'label' => $field['label'] ?? '',
                        'value' => $_POST[$fieldName] ?? null
                    ];
                }
            }
        }
        $result = json_encode($groupedAnswers, JSON_UNESCAPED_UNICODE);
    } else {
        // Flat input catch-all
        $rawAnswers = [];
        foreach ($_POST as $key => $val) {
            if (!in_array($key, ['student_id', 'student_name', 'title', 'survey_result'])) {
                $rawAnswers[$key] = $val;
            }
        }
        $result = json_encode(['General' => $rawAnswers], JSON_UNESCAPED_UNICODE);
    }
}

// 3. Check for missing validation requirements
$missing = [];
if (empty($student_id)) {
    $missing[] = 'student_id';
}
if (empty($title)) {
    $missing[] = 'title';
}
if (empty($result) || $result === '[]' || $result === '{}' || $result === '{"General":[]}') {
    $missing[] = 'survey_result (no answers selected)';
}

if (!empty($missing)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: ' . implode(', ', $missing),
        'received_data' => $result
    ]);
    $_SESSION['submission_success'] = true;
    exit();
}

// 4. Save to database using parameterized query
try {
    $stmt = $conn->prepare("INSERT INTO isw_activity_data (Student_ID, Student_name, Title, Data) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $student_id, $student_name, $title, $result);
    $stmt->execute();
    $stmt->close();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Survey submitted successfully.',
        'redirect' => 'thankyou.php'
    ]);
    exit();
} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred.']);
    exit();
}
?>