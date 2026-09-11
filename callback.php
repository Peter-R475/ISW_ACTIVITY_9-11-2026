<?php
session_start();
include('connect.php');
$clientID = '738045118016-d6sui128qf0iqmp8iqqoni1j6hol4mqa.apps.googleusercontent.com';
$clientSecret = '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';
$redirectUri = 'http://localhost/ISW_activity/callback.php';


if (!isset($_GET['code'])) {
    die('Authorization code not found.');
}

$code = $_GET['code'];

$tokenUrl = 'https://oauth2.googleapis.com/token';
$postData = [
    'code' => $code,
    'client_id' => $clientID,
    'client_secret' => $clientSecret,
    'redirect_uri' => $redirectUri,
    'grant_type' => 'authorization_code'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $tokenUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$tokenResponse = json_decode(curl_exec($ch), true);

if (!isset($tokenResponse['access_token'])) {
    die('Failed to obtain access token.');
}

$accessToken = $tokenResponse['access_token'];

$userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $userInfoUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$userInfo = json_decode(curl_exec($ch), true);

if (!isset($userInfo['name'])) {
    die('Failed to retrieve user info.');
}

// Standardize email to lowercase to prevent case-mismatch errors
$staff_email = strtolower(trim($userInfo['email']));
$userName = $userInfo['name'];

// Query using LOWER() for safe database matching
$sql = "SELECT * FROM `isw_activity_allowance` WHERE LOWER(Email) = '$staff_email' OR LOWER(assc) = '$staff_email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $_SESSION['user_name'] = $row['Name'];
    $_SESSION['staff_email'] = $row['Email']; // Stores the DB formatted email
    $_SESSION['Dept'] = $row['Dept'];

    header("Location: staff.php");
    exit();
} else {
    // Failsafe: if email is not in DB, stop here and alert user.
    echo "<script>
    alert('Unauthorized Email: $staff_email');
    </script>";
    exit();
}
?>