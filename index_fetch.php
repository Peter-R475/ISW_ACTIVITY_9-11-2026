<?php
session_start();
include("connect.php");

$title = "";
$json_data = "";
$data = "";

$row = false;

if (!empty($_GET['Page'])) {
    $activity_Title = trim($_GET['Page']);
} elseif (!empty($_SESSION['redirect_url'])) {
    $activity_Title = $_SESSION['redirect_url'];
} else {
    $activity_Title = "";
}

$activity_Title = base64_decode($activity_Title);


// 2. Fetch by Title if parameter exists and is not empty
if ($activity_Title !== "") {
    $sql = "SELECT Title, Field, Login_required, Type FROM isw_activity_staff WHERE Title = ? LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $activity_Title);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
}


if (!isset($_SESSION['student_name']) && $data['Login_required'] == 1) {
    $_SESSION['redirect_url'] = isset($_GET['Page']) ? trim($_GET['Page']) : "";
    header("Location: student_login.php");
    exit();
}

$title = $data['Title'];
$_SESSION['Title'] = $title;
$json_data = $data['Field'];
$_SESSION['Type'] = $data['Type'];

$fields = json_decode($json_data, true) ?? [];
$_SESSION['LOG1'] = $json_data;
// SVG configuration lookup for rating values 1-5
$svg_data = [
    1 => ['color' => '#FF1A1A', 'path' => '<path d="M 30 70 Q 50 50 70 70 Z" fill="#000" />'],
    2 => ['color' => '#FF8C32', 'path' => '<path d="M 30 68 Q 50 52 70 68" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round" />'],
    3 => ['color' => '#FFC83B', 'path' => '<line x1="30" y1="62" x2="70" y2="62" stroke="#000" stroke-width="6" stroke-linecap="round" />'],
    4 => ['color' => '#8CE63B', 'path' => '<path d="M 30 58 Q 50 75 70 58" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round" />'],
    5 => ['color' => '#00A838', 'path' => '<path d="M 30 55 Q 50 78 70 55 Z" fill="#000" />']
];
?>