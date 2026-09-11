<?php
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Strict'
]);
session_start();

header('Content-Type: application/json');
include("connect.php");

// Enable MySQLi exception throwing
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Auth check
if (!isset($_SESSION['user_name'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit();
}

$currentUser = $_SESSION['user_name'];
$isAdmin = (isset($_SESSION['Dept']) && $_SESSION['Dept'] === 'admin');

$selected_title_raw = $_POST['selected_title'] ?? '[]';
$selected_title = json_decode($selected_title_raw, true);

$selected_edit_title = $_GET['edit_title'] ?? '';
$_SESSION['edit_title'] = $selected_edit_title;

$selected_edit_data = null;
$selected_activity = [];
$user_email = $_SESSION['staff_email'] ?? '';

if (!is_array($selected_title)) {
    // Fix: Use raw string variable when json_decode fails
    $selected_title = array_filter(array_map('trim', explode(',', $selected_title_raw)));
}

try {
    # 1. show on recent (home)
    $where_recent = $isAdmin ? "" : "WHERE isw_activity_staff.Staff_name LIKE ?";
    $sql = "SELECT isw_activity_staff.Title, COUNT(isw_activity_data.ID) as Finished 
            FROM isw_activity_staff 
            LEFT JOIN isw_activity_data ON isw_activity_staff.Title = isw_activity_data.Title
            $where_recent
            GROUP BY isw_activity_staff.Title 
            ORDER BY MAX(isw_activity_staff.ID) DESC LIMIT 4";
    $stmt = $conn->prepare($sql);
    if (!$isAdmin) {
        $stmt->bind_param("s", $currentUser);
    }
    $stmt->execute();
    $staff_recent_data = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    # 2. show on all activity (activity tab)
    $where_all = $isAdmin ? "" : "WHERE isw_activity_staff.Staff_name LIKE ?";
    $sql1 = "SELECT isw_activity_staff.ID, isw_activity_staff.Title, COUNT(isw_activity_data.ID) as Finished 
            FROM isw_activity_staff 
            LEFT JOIN isw_activity_data ON isw_activity_staff.Title = isw_activity_data.Title
            $where_all
            GROUP BY isw_activity_staff.ID, isw_activity_staff.Title 
            ORDER BY isw_activity_staff.ID ASC";
    $stmt1 = $conn->prepare($sql1);
    if (!$isAdmin) {
        $stmt1->bind_param("s", $currentUser);
    }
    $stmt1->execute();
    $staff_all_data = $stmt1->get_result()->fetch_all(MYSQLI_ASSOC);

    # 3. show on popup (activity tab)
    $where_popup = $isAdmin ? "" : "WHERE isw_activity_staff.Staff_name LIKE ?";
    $sql2 = "SELECT isw_activity_data.ID, isw_activity_data.Student_ID, isw_activity_data.Title, isw_activity_data.Data, isw_activity_data.Date, 
                    COUNT(JSON_UNQUOTE(JSON_EXTRACT(Data, REPLACE(JSON_UNQUOTE(JSON_SEARCH(Data, 'one', 'satisfaction', NULL, '$[*].name')), '.name', '.value')))) AS satisfaction_value
             FROM isw_activity_staff 
             LEFT JOIN isw_activity_data ON isw_activity_staff.Title = isw_activity_data.Title
             $where_popup
             GROUP BY isw_activity_data.ID, isw_activity_data.Student_ID, isw_activity_data.Title, isw_activity_data.Data, isw_activity_data.Date 
             ORDER BY isw_activity_data.ID ASC";
    $stmt2 = $conn->prepare($sql2);
    if (!$isAdmin) {
        $stmt2->bind_param("s", $currentUser);
    }
    $stmt2->execute();
    $student_data = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);

    # 4. show on response (activity tab)
    $where_response = $isAdmin ? "" : "WHERE isw_activity_staff.Staff_name LIKE ?";
    $sql3 = "SELECT isw_activity_data.Student_ID, 
                    MAX(isw_activity_data.Title) AS Title, 
                    MAX(isw_activity_data.Date) AS Date, 
                    MAX(JSON_UNQUOTE(JSON_EXTRACT(Data, REPLACE(JSON_UNQUOTE(JSON_SEARCH(Data, 'one', 'overall_satisfaction', NULL, '$[*].name')), '.name', '.value')))) AS satisfaction_value, 
                    COUNT(JSON_UNQUOTE(JSON_EXTRACT(Data, REPLACE(JSON_UNQUOTE(JSON_SEARCH(Data, 'one', 'comment', NULL, '$[*].name')), '.name', '.value')))) AS comment 
             FROM isw_activity_staff 
             LEFT JOIN isw_activity_data ON isw_activity_staff.Title = isw_activity_data.Title 
             $where_response
             GROUP BY isw_activity_data.Student_ID 
             ORDER BY MAX(isw_activity_data.ID) ASC";
    $stmt3 = $conn->prepare($sql3);
    if (!$isAdmin) {
        $stmt3->bind_param("s", $currentUser);
    }
    $stmt3->execute();
    $response_count = $stmt3->get_result()->fetch_all(MYSQLI_ASSOC);

    # 5. fetch data for export panel
    if (!empty($selected_title)) {
        $placeholders = implode(',', array_fill(0, count($selected_title), '?'));
        $types = str_repeat('s', count($selected_title));

        $sql4 = "WITH RankedData AS (
                SELECT 
                    d.Student_ID, 
                    d.Title, 
                    d.Date, 
                    JSON_UNQUOTE(
                        JSON_EXTRACT(d.Data, REPLACE(JSON_UNQUOTE(JSON_SEARCH(d.Data, 'one', 'overall_satisfaction', NULL, '$[*].name')), '.name', '.value'))
                    ) AS overall_satisfaction, 
                    JSON_UNQUOTE(
                        JSON_EXTRACT(d.Data, REPLACE(JSON_UNQUOTE(JSON_SEARCH(d.Data, 'one', 'comment', NULL, '$[*].name')), '.name', '.value'))
                    ) AS comment,
                    ROW_NUMBER() OVER (
                        PARTITION BY d.Student_ID 
                        ORDER BY d.Date DESC, d.ID DESC
                    ) AS row_num
                FROM isw_activity_data d
                INNER JOIN (
                    SELECT DISTINCT Title 
                    FROM isw_activity_staff
                ) s ON s.Title = d.Title
                WHERE d.Student_ID IS NOT NULL AND d.Title IN ($placeholders)
            )
            SELECT Student_ID, Title, Date, overall_satisfaction, comment
            FROM RankedData
            WHERE row_num = 1";

        $stmt4 = $conn->prepare($sql4);
        $stmt4->bind_param($types, ...$selected_title);
        $stmt4->execute();

        $selected_activity = $stmt4->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    # 6. edit title data
    if (!empty($selected_edit_title)) {
        if ($isAdmin) {
            $stmt5 = $conn->prepare("SELECT Title, Field FROM isw_activity_staff WHERE Title = ?");
            $stmt5->bind_param("s", $selected_edit_title);
        } else {
            $stmt5 = $conn->prepare("SELECT Title, Field FROM isw_activity_staff WHERE Title = ? AND Staff_name = ?");
            $stmt5->bind_param("ss", $selected_edit_title, $currentUser);
        }
        $stmt5->execute();
        $selected_edit_data = $stmt5->get_result()->fetch_assoc();
    }

    # 7. fetch allowance data
    if ($isAdmin) {
        $stmt6 = $conn->prepare("SELECT Email, assc FROM isw_activity_allowance");
    } else {
        $stmt6 = $conn->prepare("
            SELECT Email, assc 
            FROM isw_activity_allowance 
            WHERE Email = ? OR assc = ?
        ");
        $stmt6->bind_param("ss", $user_email, $user_email);
    }

    $stmt6->execute();
    $rows = $stmt6->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt6->close();

    // Collect associated emails
    $associated_emails = [];
    foreach ($rows as $row) {
        if ($isAdmin) {
            if (!empty($row['Email']))
                $associated_emails[] = $row['Email'];
            if (!empty($row['assc']))
                $associated_emails[] = $row['assc'];
        } else {
            if ($row['Email'] === $user_email && !empty($row['assc'])) {
                $associated_emails[] = $row['assc'];
            } elseif ($row['assc'] === $user_email && !empty($row['Email'])) {
                $associated_emails[] = $row['Email'];
            }
        }
    }

    // Remove duplicates
    $associated_emails = array_values(array_unique($associated_emails));

    // Encode response for JavaScript
    echo json_encode([
        'status' => 'success',
        'recent_data' => $staff_recent_data,
        'all_data' => $staff_all_data,
        'student_data' => $student_data,
        'response_count' => $response_count,
        'selected_activity' => $selected_activity,
        'selected_edit_data' => $selected_edit_data,
        'email' => $user_email,
        'associated_email' => $associated_emails,
        'total_assc' => count($associated_emails)
    ]);

} catch (Throwable $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit();
}
?>