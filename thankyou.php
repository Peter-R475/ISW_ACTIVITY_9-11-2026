<?php
session_start();
$_SESSION['submission_success'] = "OK";
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You</title>
    <!-- Imported Poppins font used by the CSS -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles/index.css">
</head>

<body>
    <header class="header">
        <h1>Thank You for Your Response</h1>
    </header>

    <main>
        <div class="question-container" style="max-width: 600px; margin: 2rem auto;">
            <p class="question-title">Your response has been submitted successfully.</p>
        </div>
    </main>
</body>

</html>