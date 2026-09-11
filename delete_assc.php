<?php
session_start();

header('Content-Type: application/json');
include("connect.php");

// Auth check
if (!isset($_SESSION['user_name']) || !isset($_SESSION['staff_email'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit();
}

// Read JSON input body
$input = json_decode(file_get_contents('php://input'), true);
$email_to_delete = $input['associated_email'] ?? '';
$user_email = $_SESSION['staff_email'];

if (empty($email_to_delete)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing email parameter']);
    exit();
}

try {
    // Delete record matching both current user and target associated email
    $stmt = $conn->prepare("
        DELETE FROM isw_activity_allowance 
        WHERE Email = ? AND assc = ?
    ");
    $stmt->bind_param("ss", $email_to_delete, $user_email);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Association deleted']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Please delete Association with your main account or already deleted']);
    }

    $stmt->close();
} catch (Throwable $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}


?>