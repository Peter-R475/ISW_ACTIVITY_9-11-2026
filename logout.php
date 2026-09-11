<?php
// Step 1: Initialize session to access session state
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Step 2: Unset all session variables
$_SESSION = array();

// Step 3: Delete the session cookie from the client browser
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// Step 4: Destroy the server-side session data
session_destroy();
header("Location: staff_login.php");
exit;
?>