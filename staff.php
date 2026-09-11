<?php
session_start();
include("connect.php");

// Redirect to login if not authenticated
if (!isset($_SESSION['user_name'])) {
    header("Location: staff_login.php");
    exit();
}

if (isset($_SESSION['notification'])) {
    echo "<script>alert('Data saved successfully!');</script>";
    unset($_SESSION['notification']);
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Form</title>
    <link rel="stylesheet" href="styles\staff.css">

</head>

<body>
    <!-- Navigation Bar -->
    <nav class="navbar">
        <h1>
            <?php echo $_SESSION['user_name']; ?>
            <br>
            dept: <?php echo $_SESSION['Dept']; ?>
        </h1>
        <button type="button" class="nav-btn" id="navDashboardBtn">Home</button>
        <button type="button" class="nav-btn" id="navActivityBtn">Activity</button>
        <button type="button" class="nav-btn active" id="navFormBtn">Staff Form</button>
        <button type="button" class="nav-btn" id="allowanceBtn">Staff Assc</button>
        <button type="button" class="nav-btn" id="logoutbtn"
            onclick="window.location.href='logout.php';">Logout</button>
    </nav>
    <!-- Survey Container -->
    <div class="survey-container hidden" id="surveyContainer">
        <h2>Staff Form</h2>
        <form action="insert.php" method="POST" id="surveyForm" onsubmit="return prepareJson();">
            <div class="form-group" name="Title" id="Title-container">
                <div class="field-header">
                    <label for="title" class="label-text">Title:</label>
                </div>
                <input type="text" id="title" name="title" required>
            </div>
            <input type="hidden" name="login_required" id="login_required" value="0">
            <button type="button" class="btn-login-toggle" onclick="toggleLoginRequirement(this)">
                Login Required: OFF
            </button>
            <div id="fieldsContainer">
                <div class="form-group">
                    <div class="field-header">
                        <label for="student_id" class="label-text">Student ID:</label>
                        <div class="controls">
                            <button type="button" class="btn-required" onclick="toggleRequired(this)">Required</button>
                            <button type="button" onclick="moveUp(this)">▲</button>
                            <button type="button" onclick="moveDown(this)">▼</button>
                            <button type="button" class="btn-delete" onclick="deleteField(this)">✕</button>
                        </div>
                    </div>
                    <input type="number" id="student_id" name="student_id" inputmode="numeric"
                        oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10)">
                </div>

                <div class="form-group">
                    <div class="field-header">
                        <label for="student_name" class="label-text">Student Name:</label>
                        <div class="controls">
                            <button type="button" class="btn-required" onclick="toggleRequired(this)">Required</button>
                            <button type="button" onclick="moveUp(this)">▲</button>
                            <button type="button" onclick="moveDown(this)">▼</button>
                            <button type="button" class="btn-delete" onclick="deleteField(this)">✕</button>
                        </div>
                    </div>
                    <input type="text" id="student_name" name="student_name">
                </div>
            </div>

            <!-- Stores clean HTML structure -->
            <input type="hidden" name="content_html" id="htmlContent">

            <!-- Stores JSON structure -->
            <input type="hidden" name="content_json" id="jsonContent">

            <button type="submit" id="submitBtn">Save Form Template</button>
        </form>
    </div>

    <!-- Email Association Container -->
    <div class="Association-container hidden" id="associationContainer">
        <h2>Email Association</h2>
        <div id="total_assc">
            Total assc: 0
        </div>

        <div id="assc_list">
            <!-- list of associated emails -->
            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Associated Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="associatedEmailList">
                    <!-- JavaScript will inject rows here -->
                </tbody>
            </table>
        </div>
        <p><b>Binding Association Form</b></p>
        <form action="save_association.php" method="POST" id="associationForm">
            <div class="form-group">
                <div class="field-header">
                    <label for="staff_email" class="label-text">Staff Email:</label>
                </div>
                <input type="email" id="staff_email" name="staff_email" value="<?php echo $_SESSION['staff_email']; ?>"
                    readonly>
            </div>

            <div class=" form-group">
                <div class="field-header">
                    <label for="associated_email" class="label-text">Associated Email:</label>
                </div>
                <input type="email" id="associated_email" name="associated_email" required>
            </div>


            <button type="submit" id="submitBtn">Create Association</button>
        </form>
    </div>

    <!-- Activity Container -->
    <div class="activity-container hidden" id="activityContainer">
        <h2>Activity Export Panel</h2>
        <div class="export-bar" id="exportBar">
            <div id="selected-activity" hidden>Selected: 0</div>
            <button type="button" id="select-btn" hidden onclick="exportSelectedRows()">Export Selected</button>
        </div>
        <div id="activityTableContainer"></div>
    </div>

    <!-- Dashboard Container -->
    <div class="dashboard-container" id="dashboardContainer">
        <h2>Dashboard</h2>
        <p>Dashboard content goes here.</p>
    </div>

    <!-- Floating Action Buttons -->
    <div class="fab-container">
        <div class="fab-menu" id="fabMenu">
            <button type="button" class="fab-menu-btn" id="loadDefaultBtn">Question Field (ICD)</button>
            <button type="button" class="fab-menu-btn" id="loadDefaultBtn_ICD">Default Form (ISW)</button>
            <button type="button" class="fab-menu-btn" id="addFieldBtn">Comment Field</button>
            <button type="button" class="fab-menu-btn" id="add-rating">Add Rating</button>
        </div>
        <button type="button" class="fab fab-btn" id="addInputBtn">
            <span style="display: inline-block; transform: translateY(-1px);">+</span>
        </button>
    </div>
    <div id="feedback-popup" class="popup-overlay">
        <div class="popup-content">
            <span class="popup-message"></span>
        </div>
    </div>

    <dialog id="errorModal">
        <p id="modalText"></p>
        <button onclick="document.getElementById('errorModal').close()">OK</button>
    </dialog>

    <script src="scripts\staff_ICD.js"></script>
</body>

</html>