<?php
include('connect.php');
session_start();

// Verify session state instead of querying the database a second time
if (isset($_SESSION['staff_email']) && isset($_SESSION['Dept'])) {
    // Proceed to staff page
    header("Location: staff.php");
    exit();
} else {
    session_destroy();
    echo "<script>
    alert('Invalid authority to access this page');
    window.location.href = 'staff_login.php';
    </script>";
    exit();
}
?>