<?php
session_start();
if (isset($_SESSION['user_name'])) {
    session_destroy();
    header("Location: staff_login.php");
    exit();
}

$clientID = '738045118016-d6sui128qf0iqmp8iqqoni1j6hol4mqa.apps.googleusercontent.com';
$redirectUri = 'http://localhost/ISW_activity/callback.php';

// Google OAuth 2.0 Authorization Endpoint
$googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
    'client_id' => $clientID,
    'redirect_uri' => $redirectUri,
    'response_type' => 'code',
    'scope' => 'openid email profile',
    'access_type' => 'online'
]);
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Login</title>
    <link rel="stylesheet" href="styles/login.css">
</head>

<body>
    <div class="login-card">
        <h2>Staff Login</h2>

        <a class="login-btn" href="<?php echo htmlspecialchars($googleAuthUrl); ?>">Log in with Google</a>
    </div>
</body>

</html>