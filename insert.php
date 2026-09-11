<?php
session_start();
include("connect.php");
// Redirect to login if not authenticated
if (!isset($_SESSION['user_name'])) {
    header("Location: staff_login.php");
    exit();
}
// Verify request method and required fields
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo 'ERROR: Invalid request method. Expected POST.';
    exit();
}

if (!isset($_POST['content_html'])) {
    echo 'ERROR: Missing required field "content_html" in POST data.';
    exit();
}

// 1. Process Form Data
$htmlContent = $_POST['content_html'] ?? '';
$jsonContent = $_POST['content_json'] ?? '';
$title = $_POST['title'] ?? '';
$login_required = $_POST['login_required'] ?? '0';

if ($jsonContent === '') {
    header("Location: staff.php");
    exit();
}

if ($jsonContent) {
    $data = json_decode($jsonContent, true);

    if (is_array($data)) {
        // Extract all top-level category keys (e.g. ['General', 'GLO_1', ...])
        $keys = array_keys($data);

        // Filter out empty arrays if a key has no questions inside
        $activeKeys = array_filter($keys, function ($key) use ($data) {
            return !empty($data[$key]);
        });

        // Check: Contains 'General' AND has no other keys besides 'General'
        $hasOnlyGeneral = in_array('General', $activeKeys, true) && count($activeKeys) === 1;

        if ($hasOnlyGeneral) {
            $_SESSION['document_type'] = 'ISW';
        } else {
            $_SESSION['document_type'] = 'ICD';
        }
    }
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// 1. Check existing record count
$stmt_check = $conn->prepare("
    SELECT COUNT(*) 
    FROM isw_activity_staff 
    WHERE Staff_name = ? AND Title = ?
");

$stmt_check->bind_param("ss", $_SESSION['user_name'], $title);
$stmt_check->execute();
$result_check = $stmt_check->get_result();
$row = $result_check->fetch_row();
$count = $row[0]; // Access numeric index 0 to simulate fetchColumn()

// Check if entry exists; if so, update
if ($count > 0) {
    try {
        $stmt = $conn->prepare("UPDATE isw_activity_staff SET Field = ?, Login_required = ?, Type = ? WHERE Staff_name = ? AND Title = ?");
        // Bind types: s = string, i = integer (adjust second type if login_required is string)
        $stmt->bind_param("sisss", $jsonContent, $login_required, $_SESSION['document_type'], $_SESSION['user_name'], $title);
        $stmt->execute();

        $_SESSION['notification'] = "Data updated successfully!";
        header("Location: staff.php");
        exit();

    } catch (mysqli_sql_exception $e) {
        echo 'ERROR: Database error - ' . $e->getMessage();
        exit();
    }
}

// 2. Database Insertion
try {
    $stmt = $conn->prepare("INSERT INTO isw_activity_staff (Staff_name, Login_required, Title, Field, Type) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sisss", $_SESSION['user_name'], $login_required, $title, $jsonContent, $_SESSION['document_type']);
    $stmt->execute();

    $_SESSION['notification'] = "Data saved successfully!";
    header("Location: staff.php");
    exit();
} catch (mysqli_sql_exception $e) {
    $_SESSION['notification'] = 'ERROR: Database error - ' . $e->getMessage();
    exit();
}


?>