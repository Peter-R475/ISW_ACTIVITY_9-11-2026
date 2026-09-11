<?php
include('popup_handle.php');
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>show export panel</title>
    <link rel="stylesheet" href="/ISW_activity/styles/export.css">
</head>

<body>
    <div class="activity-container">
        <h3>Activity Data:
            <?php echo htmlspecialchars($activityTitle, ENT_QUOTES, 'UTF-8'); ?>

        </h3>

        <a class="btn" href="<?php echo htmlspecialchars($exportUrl, ENT_QUOTES, 'UTF-8'); ?>">
            Export Data
        </a>

        <div id="activityTableContainer">
            <table>
                <thead>
                    <tr>
                        <?php echo $tableHeadersHTML; ?>
                    </tr>
                </thead>
                <tbody>
                    <?php echo $tableRowsHTML; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>

</html>