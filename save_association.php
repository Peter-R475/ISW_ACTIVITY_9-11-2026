<?php
include('connect.php');
session_start();
$Staff_Email = $_POST['staff_email'] ?? '';
$Associated_Email = $_POST['associated_email'] ?? '';

// 1. Prepare and execute the SELECT query safely
$stmt = $conn->prepare("SELECT Name FROM isw_activity_allowance WHERE Email = ?");
$stmt->bind_param("s", $Staff_Email);
$stmt->execute();
$result = $stmt->get_result();

// 2. Validate that a record was returned
if ($row = $result->fetch_assoc()) {
    $name = $row['Name'];
    $_SESSION['user_name'] = $name;
    // 3. Prepare and execute the INSERT query safely
    $insertStmt = $conn->prepare("INSERT INTO isw_activity_allowance (Name, Email, assc) VALUES (?, ?, ?)");
    $insertStmt->bind_param("sss", $name, $Associated_Email, $Staff_Email);

    if (!$insertStmt->execute()) {
        die("Insert query failed: " . $conn->error);
    }

    echo "<script>
    alert('Association created successfully!');
    window.location.href = 'staff.php';
    </script>";
    exit();
} else {
    // 4. Handle missing record error explicitly
    die("Error: No record found matching email: " . htmlspecialchars($Staff_Email));
}
?>