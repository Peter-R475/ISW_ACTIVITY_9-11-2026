<?php
session_start();
include('connect.php');
if (!isset($_SESSION['user_name'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit();
}

// Include your database connection file
require_once 'connect.php';


if (!empty($_POST['delete_title'])) {
    $stmt6 = $conn->prepare("DELETE FROM isw_activity_staff WHERE Title = ?");
    $stmt6->bind_param("s", $_POST['delete_title']);
    $stmt6->execute();
    $stmt6->close();

    header('Location: staff.php?page=dashboard');
    exit();
}

if (!empty($_POST['id'])) {
    $id = $_POST['id'];
    $title = '';

    // 1. Fetch Title before deletion
    $stmt1 = $conn->prepare("SELECT Title FROM isw_activity_data WHERE ID = ?");
    $stmt1->bind_param("i", $id);
    $stmt1->execute();
    $result1 = $stmt1->get_result();

    if ($row = $result1->fetch_assoc()) {
        $title = $row['Title'];
    }
    $stmt1->close();

    // 3. Fetch remaining rows matching Title & store in Session
    if (!empty($title)) {
        $stmt_select = $conn->prepare("SELECT * FROM isw_activity_data WHERE Title = ?");
        $stmt_select->bind_param("s", $title);
        $stmt_select->execute();
        $result = $stmt_select->get_result();

        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        $stmt_select->close();

        // Save updated data to session so show_panel_export.php can read it after redirect
        $_SESSION['activityTitle'] = $title;
        $_SESSION['filteredData'] = json_encode($rows);

        header('Location: show_panel_export.php?title=' . urlencode($title));
    } else {
        header('Location: show_panel_export.php');
    }
    exit();
}



?>