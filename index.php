<?php

require_once("index_fetch.php"); //[cite: 1]

if (isset($_SESSION['submission_success'])) {
    header("Location: thankyou.php");
    exit();
}

if (isset($_SESSION['Type']) && strtoupper(trim($_SESSION['Type'])) === 'ICD') {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title><?php echo htmlspecialchars($title ?? 'Activity Evaluation - Page 1'); ?></title>
        
        <!-- Reference Stylesheets -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
        
        <!-- Custom Stylesheets -->
        <link rel="stylesheet" href="styles/ICD_style.css">
    </head>

    <body>
        <div class="header">
            <div class="container">
                <h1><?php echo htmlspecialchars($title ?? 'Activity Evaluation'); ?></h1>
            </div>
        </div>

        <div class="container pb-5">
            <?php if (!empty($fields)): ?>
                <form action="stud_insert.php" method="POST" id="surveyForm">
                    <input type="hidden" name="title" value="<?php echo htmlspecialchars($title ?? 'Activity Evaluation'); ?>">
                    
                    <?php 
                    // 1. Normalize array to handle flat JSON if provided
                    if (!empty($fields)) {
                        $firstKey = array_key_first($fields);
                        if (is_int($firstKey) || isset($fields[$firstKey]['name'])) {
                            $fields = ['General' => $fields];
                        }
                    }

                    // 2. Separate into GLO (Page 1) and General (Page 2)
                    $page1Fields = [];
                    $page2Fields = [];

                    if (!empty($fields)) {
                        // Priority 1: student_id and student_name -> Page 1
                        foreach ($fields as $groupName => $groupItems) {
                            foreach ($groupItems as $field) {
                                if ($field['name'] === 'student_id' || $field['name'] === 'student_name') {
                                    $field['group_key'] = $groupName;
                                    $page1Fields[] = $field;
                                }
                            }
                        }

                        // Priority 2: GLO questions (Groups other than 'General') -> Page 1
                        foreach ($fields as $groupName => $groupItems) {
                            if ($groupName !== 'General') {
                                foreach ($groupItems as $field) {
                                    if ($field['name'] !== 'student_id' && $field['name'] !== 'student_name') {
                                        $field['group_key'] = $groupName;
                                        $page1Fields[] = $field;
                                    }
                                }
                            }
                        }

                        // Priority 3: Remaining fields in 'General' -> Page 2
                        if (isset($fields['General'])) {
                            foreach ($fields['General'] as $field) {
                                if ($field['name'] !== 'student_id' && $field['name'] !== 'student_name') {
                                    $field['group_key'] = 'General';
                                    $page2Fields[] = $field;
                                }
                            }
                        }
                    }

                    // Helper renderer to avoid code duplication
                    function renderField($field) {
                        $isRequired = !empty($field['required']) ? 'required' : '';
                        $fieldName  = htmlspecialchars($field['name']);
                        $groupKey   = htmlspecialchars($field['group_key'] ?? '');
                        ?>
                        <?php if ($field['type'] === 'number' && $field['name'] === 'student_id'): ?>
                            <div class="form-group student-id-section mt-4 mb-4" data-group-key="<?php echo $groupKey; ?>">
                                <div class="text-center">
                                    <h3 class="mb-4" style="color: var(--dark-blue);">
                                        <i class="fas fa-id-card me-2"></i><?php echo nl2br(htmlspecialchars($field['label'])); ?>
                                    </h3>
                                    <input type="text"
                                        class="form-control custom-input mx-auto"
                                        style="max-width: 400px;"
                                        id="<?php echo $fieldName; ?>"
                                        name="<?php echo $fieldName; ?>"
                                        inputmode="numeric"
                                        placeholder="Enter your Student ID"
                                        oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10)"
                                        <?php echo $isRequired; ?>>
                                </div>
                            </div>
                        <?php else: ?>
                            <div class="form-group question-container" id="container_<?php echo $fieldName; ?>" data-group-key="<?php echo $groupKey; ?>">
                                <div class="question-title">
                                    <?php echo nl2br(htmlspecialchars($field['label'])); ?>
                                </div>

                                <?php if ($field['type'] === 'textarea'): ?>
                                    <textarea id="<?php echo $fieldName; ?>"
                                            name="<?php echo $fieldName; ?>"
                                            class="form-control custom-input"
                                            rows="4"
                                            placeholder="Please provide your thoughts here..."
                                            <?php echo $isRequired; ?>></textarea>

                                <?php elseif ($field['type'] === 'rating' && isset($field['options'])): ?>
                                    <?php if ($fieldName === 'Overall_satisfaction'): ?>
                                        <div class="rating-section mt-4">
                                            <div class="rating-group">
                                                <?php foreach ($field['options'] as $index => $option): 
                                                    $val     = (int) $option['value'];
                                                    $inputId = $fieldName . '_' . $val;
                                                ?>
                                                    <div class="rating-item">
                                                        <input type="radio" 
                                                            class="rating-input"
                                                            id="<?php echo $inputId; ?>"
                                                            name="<?php echo $fieldName; ?>"
                                                            value="<?php echo htmlspecialchars($option['value']); ?>"
                                                            <?php echo $isRequired; ?>>
                                                        <label class="rating-label" for="<?php echo $inputId; ?>">
                                                            <?php echo htmlspecialchars($option['value']); ?>
                                                        </label>
                                                        <?php if (isset($option['text']) && !empty($option['text'])): ?>
                                                            <span class="rating-text mt-2 text-muted small fw-medium text-center" style="max-width: 80px;">
                                                                <?php echo nl2br(htmlspecialchars($option['text'])); ?>
                                                            </span>
                                                        <?php endif; ?>
                                                    </div>
                                                <?php endforeach; ?>
                                            </div>
                                        </div>
                                    <?php else: ?>
                                        <div class="before-after-container">
                                            <?php 
                                            $phases = [
                                                'before' => ['title' => 'Before joining the activity', 'icon' => 'fa-calendar-minus'],
                                                'after'  => ['title' => 'After joining the activity', 'icon' => 'fa-calendar-plus']
                                            ];
                                            foreach ($phases as $phaseKey => $phaseData): 
                                                $inputName = $fieldName . '_' . $phaseKey;
                                            ?>
                                                <div class="rating-section">
                                                    <h4><i class="fas <?php echo $phaseData['icon']; ?> me-2"></i><?php echo $phaseData['title']; ?></h4>
                                                    <div class="rating-group">
                                                        <?php foreach ($field['options'] as $index => $option): 
                                                            $val     = (int) $option['value'];
                                                            $inputId = $inputName . '_' . $val;
                                                        ?>
                                                            <div class="rating-item">
                                                                <input type="radio" 
                                                                    class="rating-input"
                                                                    id="<?php echo $inputId; ?>"
                                                                    name="<?php echo $inputName; ?>"
                                                                    value="<?php echo htmlspecialchars($option['value']); ?>"
                                                                    <?php echo $isRequired; ?>>
                                                                <label class="rating-label" for="<?php echo $inputId; ?>">
                                                                    <?php echo htmlspecialchars($option['value']); ?>
                                                                </label>
                                                                <?php if (isset($option['text']) && !empty($option['text'])): ?>
                                                                    <span class="rating-text mt-2 text-muted small fw-medium text-center" style="max-width: 80px;">
                                                                        <?php echo nl2br(htmlspecialchars($option['text'])); ?>
                                                                    </span>
                                                                <?php endif; ?>
                                                            </div>
                                                        <?php endforeach; ?>
                                                    </div>
                                                </div>
                                            <?php endforeach; ?>
                                        </div>
                                    <?php endif; ?>
                                <?php else: ?>
                                    <input type="<?php echo htmlspecialchars($field['type']); ?>"
                                        class="form-control custom-input"
                                        id="<?php echo $fieldName; ?>"
                                        name="<?php echo $fieldName; ?>"
                                        <?php echo $isRequired; ?>>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                    <?php } ?>

                    <!-- PAGE 1: GLO Questions -->
                    <div id="page1">
                        <?php foreach ($page1Fields as $field): ?>
                            <?php renderField($field); ?>
                        <?php endforeach; ?>

                        <div class="text-center mt-5 mb-4">
                            <button type="button" class="next-btn" id="nextPageBtn">
                                Next Page <i class="fas fa-arrow-right ms-2"></i>
                            </button>
                        </div>
                    </div>

                    <!-- PAGE 2: General Questions -->
                    <div id="page2" class="d-none">
                        <?php foreach ($page2Fields as $field): ?>
                            <?php renderField($field); ?>
                        <?php endforeach; ?>

                        <div class="text-center mt-5 mb-4">
                            <button type="submit" class="next-btn" id="submitBtn">
                                <i class="fas fa-paper-plane me-2"></i> Submit Evaluation
                            </button>
                        </div>
                    </div>

                    <input type="hidden" name="survey_result" id="survey_result_input">
                </form>
            <?php else: ?>
                <div class="alert alert-warning text-center rounded-4 p-4 shadow-sm">
                    <h4><i class="fas fa-exclamation-triangle"></i> No form template found.</h4>
                </div>
            <?php endif; ?>
        </div>

        <div id="feedback-popup" class="popup-overlay" style="display:none;">
            <div class="popup-content">
                <span class="popup-message"></span>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="scripts/index_ICD.js"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                // Page navigation logic
                const nextPageBtn = document.getElementById('nextPageBtn');
                const page1 = document.getElementById('page1');
                const page2 = document.getElementById('page2');

                if (nextPageBtn) {
                    nextPageBtn.addEventListener('click', function() {
                        const page1Inputs = page1.querySelectorAll('input, select, textarea');
                        let isValid = true;

                        for (const input of page1Inputs) {
                            if (!input.checkValidity()) {
                                input.reportValidity();
                                isValid = false;
                                break;
                            }
                        }

                        if (isValid) {
                            page1.classList.add('d-none');
                            page2.classList.remove('d-none');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    });
                }

                // Auto-scroll logic for ratings
                document.querySelectorAll('.rating-input').forEach(input => {
                    input.addEventListener('change', function() {
                        const container = this.closest('.question-container');
                        if (container) {
                            container.classList.add('answered');
                            
                            setTimeout(() => {
                                const nextContainer = container.nextElementSibling;
                                if (nextContainer && nextContainer.classList.contains('question-container')) {
                                    nextContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }, 500);
                        }
                    });
                });
            });
        </script>
    </body>
    </html>
    
<?php
} else {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activity Evaluation</title>
        
        <!-- Reference Stylesheets -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
        
        <!-- Custom Stylesheets -->
        <link rel="stylesheet" href="styles/index.css">
    </head>

    <body>
        <div class="header">
            <div class="container">
                <h1><?php echo htmlspecialchars($title ?? 'Activity Evaluation'); ?></h1>
            </div>
        </div>

        <div class="container pb-5">
            <form action="stud_insert.php" method="POST" id="surveyForm">
                <input type="hidden" name="title" value="<?php echo htmlspecialchars($title ?? 'Activity Evaluation'); ?>">

                <!-- 1. Student ID -->
                <div class="form-group student-id-section mt-4 mb-4" data-group-key="General">
                    <div class="text-center">
                        <h3 class="mb-4" style="color: var(--dark-blue);">
                            <i class="fas fa-id-card me-2"></i>Student ID
                        </h3>
                        <input type="text"
                            class="form-control custom-input mx-auto"
                            style="max-width: 400px;"
                            id="student_id"
                            name="student_id"
                            inputmode="numeric"
                            placeholder="Enter your Student ID"
                            oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10)">
                    </div>
                </div>

                <!-- 2. Student Name -->
                <div class="form-group question-container mb-4" id="container_student_name" data-group-key="General">
                    <div class="question-title">
                        Student Name
                    </div>
                    <input type="text"
                        class="form-control custom-input"
                        id="student_name"
                        name="student_name">
                </div>

                <!-- 3. Satisfaction -->
                <div class="form-group question-container mb-4" id="container_Overall_satisfaction" data-group-key="General">
                    <div class="question-title">
                        Satisfaction
                    </div>
                    <div class="rating-section mt-4">
                        <div class="rating-group">
                            <div class="rating-item">
                                <input type="radio" class="rating-input" id="Overall_satisfaction_1" name="Overall_satisfaction" value="1">
                                <label class="rating-label" for="Overall_satisfaction_1">1</label>
                                <span class="rating-text mt-2 text-muted small fw-medium text-center" style="max-width: 80px;">
                                    Most Dissatisfied<br />1
                                </span>
                            </div>
                            <div class="rating-item">
                                <input type="radio" class="rating-input" id="Overall_satisfaction_2" name="Overall_satisfaction" value="2">
                                <label class="rating-label" for="Overall_satisfaction_2">2</label>
                                <span class="rating-text mt-2 text-muted small fw-medium text-center" style="max-width: 80px;">
                                    Dissatisfied<br />2
                                </span>
                            </div>
                            <div class="rating-item">
                                <input type="radio" class="rating-input" id="Overall_satisfaction_3" name="Overall_satisfaction" value="3">
                                <label class="rating-label" for="Overall_satisfaction_3">3</label>
                                <span class="rating-text mt-2 text-muted small fw-medium text-center" style="max-width: 80px;">
                                    Neutral<br />3
                                </span>
                            </div>
                            <div class="rating-item">
                                <input type="radio" class="rating-input" id="Overall_satisfaction_4" name="Overall_satisfaction" value="4">
                                <label class="rating-label" for="Overall_satisfaction_4">4</label>
                                <span class="rating-text mt-2 text-muted small fw-medium text-center" style="max-width: 80px;">
                                    Satisfied<br />4
                                </span>
                            </div>
                            <div class="rating-item">
                                <input type="radio" class="rating-input" id="Overall_satisfaction_5" name="Overall_satisfaction" value="5">
                                <label class="rating-label" for="Overall_satisfaction_5">5</label>
                                <span class="rating-text mt-2 text-muted small fw-medium text-center" style="max-width: 80px;">
                                    Most Satisfied<br />5
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. rating -->
                <div class="form-group question-container mb-4" id="container_rating" data-group-key="General">
                    <div class="question-title">
                        rating
                    </div>
                    <div class="rating-section mt-4">
                        <div class="rating-group">
                            <div class="rating-item">
                                <input type="radio" class="rating-input" id="rating_1" name="rating" value="1">
                                <label class="rating-label" for="rating_1">1</label>
                                <span class="rating-text mt-2 text-muted small fw-medium text-center" style="max-width: 80px;">
                                    Most Dissatisfied<br />1
                                </span>
                            </div>
                            <div class="rating-item">
                                <input type="radio" class="rating-input" id="rating_2" name="rating" value="2">
                                <label class="rating-label" for="rating_2">2</label>
                                <span class="rating-text mt-2 text-muted small fw-medium text-center" style="max-width: 80px;">
                                    Dissatisfied<br />2
                                </span>
                            </div>
                            <div class="rating-item">
                                <input type="radio" class="rating-input" id="rating_3" name="rating" value="3">
                                <label class="rating-label" for="rating_3">3</label>
                                <span class="rating-text mt-2 text-muted small fw-medium text-center" style="max-width: 80px;">
                                    Neutral<br />3
                                </span>
                            </div>
                            <div class="rating-item">
                                <input type="radio" class="rating-input" id="rating_4" name="rating" value="4">
                                <label class="rating-label" for="rating_4">4</label>
                                <span class="rating-text mt-2 text-muted small fw-medium text-center" style="max-width: 80px;">
                                    Satisfied<br />4
                                </span>
                            </div>
                            <div class="rating-item">
                                <input type="radio" class="rating-input" id="rating_5" name="rating" value="5">
                                <label class="rating-label" for="rating_5">5</label>
                                <span class="rating-text mt-2 text-muted small fw-medium text-center" style="max-width: 80px;">
                                    Most Satisfied<br />5
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 5. Comment -->
                <div class="form-group question-container mb-4" id="container_comment" data-group-key="General">
                    <div class="question-title">
                        Comment
                    </div>
                    <textarea id="comment"
                            name="comment"
                            class="form-control custom-input"
                            rows="4"
                            placeholder="Please provide your thoughts here..."></textarea>
                </div>

                <!-- Submit Button -->
                <div class="text-center mt-5 mb-4">
                    <button type="submit" class="next-btn" id="submitBtn">
                        <i class="fas fa-paper-plane me-2"></i> Submit Evaluation
                    </button>
                </div>

                <input type="hidden" name="survey_result" id="survey_result_input">
            </form>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="scripts/index_ICD.js"></script>
    </body>
    </html>
    <?php
}
?>