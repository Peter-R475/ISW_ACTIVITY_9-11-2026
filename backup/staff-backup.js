let customFieldCount = 1;
let globalStudentData = [];
let globalActivityID = [];
let Graph_selected_rows = [];


// Default Form Template
const defaultFormHTML = `
    <div id="ratings-container"></div>
    <div class="form-group" id="Overall-rating">
        <div class="field-header">
            <label for="satisfaction" class="label-text">Satisfaction:</label>
            <div class="controls">
                <button type="button" class= "btn-select active" onclick="OverallSatisfactionField(this)">Overall Satisfaction</button>
                <button type="button" class="btn-required" onclick="toggleRequired(this)">Required</button>
                <button type="button" onclick="moveUp(this)">▲</button>
                <button type="button" onclick="moveDown(this)">▼</button>
                <button type="button" class="btn-delete" onclick="deleteField(this)">✕</button>
            </div>
        </div>

        <div class="rating">
            <label class="rating-item">
                <input type="radio" name="satisfaction" value="1" class="visually-hidden">
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#FF1A1A" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <path d="M 30 70 Q 50 50 70 70 Z" fill="#000" />
                </svg>
                <span class="rating-text">Most Dissatisfied<br>1</span>
            </label>

            <label class="rating-item">
                <input type="radio" name="satisfaction" value="2" class="visually-hidden">
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#FF8C32" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <path d="M 30 68 Q 50 52 70 68" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round" />
                </svg>
                <span class="rating-text">Dissatisfied<br>2</span>
            </label>

            <label class="rating-item">
                <input type="radio" name="satisfaction" value="3" class="visually-hidden">
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#FFC83B" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <line x1="30" y1="62" x2="70" y2="62" stroke="#000" stroke-width="6" stroke-linecap="round" />
                </svg>
                <span class="rating-text">Neutral<br>3</span>
            </label>

            <label class="rating-item">
                <input type="radio" name="satisfaction" value="4" class="visually-hidden">
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#8CE63B" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <path d="M 30 58 Q 50 75 70 58" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round" />
                </svg>
                <span class="rating-text">Satisfied<br>4</span>
            </label>

            <label class="rating-item">
                <input type="radio" name="satisfaction" value="5" class="visually-hidden">
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#00A838" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <path d="M 30 55 Q 50 78 70 55 Z" fill="#000" />
                </svg>
                <span class="rating-text">Most Satisfied<br>5</span>
            </label>
        </div>
    </div>

    <div class="form-group">
        <div class="field-header">
            <label for="comment" class="label-text">Comment:</label>
            <div class="controls">
                <button type="button" class="btn-required" onclick="toggleRequired(this)">Required</button>
                <button type="button" onclick="moveUp(this)">▲</button>
                <button type="button" onclick="moveDown(this)">▼</button>
                <button type="button" class="btn-delete" onclick="deleteField(this)">✕</button>
            </div>
        </div>
        <textarea id="comment" name="comment"></textarea>
    </div>
`;

// Toggle submit button visibility based on whether form-groups exist
function toggleSubmitBtnVisibility() {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;
    const hasFields = document.querySelectorAll('.form-group').length > 0;
    submitBtn.style.display = hasFields ? 'block' : 'none';
}

// 1. Load Default Form
document.getElementById('loadDefaultBtn')?.addEventListener('click', function () {
    const container = document.getElementById('fieldsContainer');
    if (!container) return;

    container.hidden = false;

    // Append default HTML to the end of the container
    container.insertAdjacentHTML('beforeend', defaultFormHTML);

    // Make newly appended labels editable
    container.querySelectorAll('.label-text').forEach(makeLabelEditable);
    toggleSubmitBtnVisibility();
});

// 2. Add Dynamic Field
function addCustomField() {
    const container = document.getElementById('fieldsContainer');
    if (!container) return;

    container.hidden = false;

    let fieldId = `field ${customFieldCount}`;
    let labelText = `label_Field ${customFieldCount}`;

    const groupDiv = document.createElement('div');
    groupDiv.className = 'form-group';

    groupDiv.innerHTML = `
        <div class="field-header">
            <label for="${fieldId}" class="label-text">${labelText}:</label>
            <div class="controls">
                <button type="button" class="btn-required" onclick="toggleRequired(this)">Required</button>
                <button type="button" onclick="moveUp(this)">▲</button>
                <button type="button" onclick="moveDown(this)">▼</button>
                <button type="button" class="btn-delete" onclick="deleteField(this)">✕</button>
            </div>
        </div>
        <input type="text" id="${fieldId}" name="custom_field[${customFieldCount}]">
    `;

    container.appendChild(groupDiv);

    const newLabel = groupDiv.querySelector('.label-text');
    makeLabelEditable(newLabel, fieldId, labelText);

    customFieldCount++;
    toggleSubmitBtnVisibility();
}

// 3. Double-Click Editable Label
function makeLabelEditable(labelElement, fieldId, labelText) {
    labelElement.addEventListener('dblclick', function () {
        const currentText = this.textContent.replace(':', '').trim();
        const parent = this.parentNode;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-label-input';
        input.style.width = 'auto';
        input.style.padding = '2px 4px';
        input.style.margin = '0';
        input.style.fontSize = '1rem';

        parent.replaceChild(input, this);
        input.focus();

        let isSaved = false;

        const saveEdit = () => {
            if (isSaved) return;
            isSaved = true;

            const newText = input.value.trim() || currentText;
            this.textContent = `${newText}:`;
            // Update the labelText reference if needed
            labelText = `label[${newText}]`;

            // Optional: Update target element attributes (e.g. input id or label 'for')
            const targetInput = document.getElementById(fieldId);
            if (targetInput) {
                targetInput.name = newText;
            }

            if (input.parentNode === parent) {
                parent.replaceChild(this, input);
            }

        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            }
        });
    });

}

// 4. Order Controls
function moveUp(button) {
    const group = button.closest('.form-group');
    const previousGroup = group.previousElementSibling;
    if (previousGroup) {
        group.parentNode.insertBefore(group, previousGroup);
    }
}

// popup for export and full view
function showPopup(activityTitle) {
    // 1. Filter matching activity Title
    const filteredData = globalStudentData.filter(student => student.Title === activityTitle);

    // 2. Create a hidden form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'Show_panel_export.php';

    // 3. Create input for activityTitle
    const titleInput = document.createElement('input');
    titleInput.type = 'hidden';
    titleInput.name = 'activityTitle';
    titleInput.value = activityTitle;
    form.appendChild(titleInput);

    // 4. Create input for filteredData (serialized to JSON)
    const dataInput = document.createElement('input');
    dataInput.type = 'hidden';
    dataInput.name = 'filteredData';
    dataInput.value = JSON.stringify(filteredData);
    form.appendChild(dataInput);

    // 5. Append form to body and submit (causes page redirection)
    document.body.appendChild(form);
    form.submit();
}

function showResponsePopup(title, responseText) {
    // Remove existing modal instance
    const existingModal = document.getElementById('responseModal');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'responseModal';
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
        <div class="modal-card" style="max-width: 500px; width: 90%; background: #fff; padding: 20px; border-radius: 6px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 1000;">
            <h3 style="margin-top: 0;">Response Summary</h3>
            <p><strong>Activity:</strong> ${title}</p>
            <div style="padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; margin-bottom: 15px; word-break: break-word;">
                ${responseText}
            </div>
            <button type="button" onclick="document.getElementById('responseModal').remove()" style="padding: 6px 16px; cursor: pointer;">Close</button>
        </div>
    `;

    document.body.appendChild(overlay);
}

function generateDynamicLink(title) {
    // Scramble/encode the dynamic title
    const obfuscatedTitle = btoa(title);
    return `http://localhost/ISW_activity/index.php?Page=${encodeURIComponent(obfuscatedTitle)}`;
}

async function loadActivityData() {
    const container = document.getElementById('activityTableContainer');
    if (!container) return;

    container.innerHTML = '<p>Loading activities...</p>';

    try {
        const response = await fetch('fetch_dashboard.php', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (result.status !== 'success') {
            container.innerHTML = `<p>Error: ${escapeHtml(result.message)}</p>`;
            return;
        }

        if (!result.all_data || result.all_data.length === 0) {
            container.innerHTML = '<p>No activity records found.</p>';
            return;
        }

        // Store result.student_data globally
        globalStudentData = result.student_data || [];
        globalActivityID = result.all_data || [];
        let tableHTML = `
            <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; border: 1px solid #ccc;">ID</th>
                        <th style="padding: 8px; border: 1px solid #ccc;">Activity's name</th>
                        <th style="padding: 8px; border: 1px solid #ccc;">Link</th>
                        <th style="padding: 8px; border: 1px solid #ccc;">Response</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const response_count = result.response_count;

        const satisfactionDict = {};
        const commentDict = {};

        response_count.forEach(item => {
            const title = item.Title;
            const value = item.satisfaction_value;
            const comment = item.comment;
            if (item.satisfaction_value) {
                satisfactionDict[title] = satisfactionDict[title] || {};
                satisfactionDict[title][value] = (satisfactionDict[title][value] || 0) + 1;
            }
            if (item.comment) {
                commentDict[title] = commentDict[title] || {};
                commentDict[title][comment] = (commentDict[title][comment] || 0) + 1;
            }
        });

        const ratingLabels = {
            "1": "Very Bad",
            "2": "Bad",
            "3": "Average",
            "4": "Good",
            "5": "Excellent"
        };

        result.all_data.forEach(row => {
            const titleEscaped = escapeHtml(row.Title || '');

            const scores = satisfactionDict[row.Title] || {};
            const formattedScores = ['1', '2', '3', '4', '5']
                .map(level => {
                    const count = scores[level] || 0;
                    const label = ratingLabels[level];
                    return `${label}: ${count}`;
                })
                .join(' | ');

            const commentsObj = commentDict[row.Title] || {};
            const formattedComments = Object.entries(commentsObj)
                .map(([comment, count]) => `Comment : ${count}`)
                .join(' | ');

            const combinedResult = formattedComments
                ? `${formattedScores} <br> ${formattedComments}`
                : formattedScores;
            // Construct the target URL with query parameters
            console.log(combinedResult);
            const generatedLink = generateDynamicLink(row.Title);

            tableHTML += `
                            <tr id=${escapeHtml(String(row.ID || ''))}>
                                <td style="padding: 8px; border: 1px solid #ccc;">
                                    <a href="#" onclick="selectedRow('${row.ID}'); return false;" style="display: block; padding: 8px; color: inherit; text-decoration: none;">
                                        ${escapeHtml(String(row.ID || ''))}
                                    </a>
                                </td>
                                <td style="padding: 8px; border: 1px solid #ccc;">
                                    <a href="javascript:void(0)" onclick="showPopup('${titleEscaped.replace(/'/g, "\\'")}')" style="color: #4CAF50; text-decoration: underline; cursor: pointer;">
                                        ${titleEscaped}
                                    </a>
                                </td>
                                <td style="padding: 8px; border: 1px solid #ccc;">
                                    <a href="${generatedLink}" target="_blank" style="color: #2196F3; text-decoration: underline;">
                                        Open Form
                                    </a>
                                </td>
                                <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">
                                    <button type="button" 
                                            onclick="showResponsePopup('${escapeHtml(row.Title || '').replace(/'/g, "\\'")}', '${escapeHtml(combinedResult).replace(/'/g, "\\'")}')"
                                            style="padding: 4px 12px; cursor: pointer;">
                                        See
                                    </button>
                                </td>
                            </tr>
                        `;

        });

        tableHTML += `
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;

    } catch (error) {
        console.error("Activity Fetch Error:", error);
        container.innerHTML = `<p>Failed to fetch activity data: ${escapeHtml(error.message)}</p>`;
    }
}

function moveDown(button) {
    const group = button.closest('.form-group');
    const nextGroup = group.nextElementSibling;
    if (nextGroup) {
        group.parentNode.insertBefore(nextGroup, group);
    }
}

// 5. Delete Field
function deleteField(button) {
    const group = button.closest('.form-group');
    if (group) {
        group.remove();
        toggleSubmitBtnVisibility();
    }
}

// 6. Save Cleaned HTML Structure to Hidden Input
function prepareHTML() {
    const formElement = document.getElementById('surveyForm');
    if (!formElement) return;

    const clone = formElement.cloneNode(true);
    clone.querySelectorAll('.controls, #submitBtn, #htmlContent, #Title-container').forEach(el => el.remove());

    const hiddenInput = document.getElementById('htmlContent');
    if (hiddenInput) {
        hiddenInput.value = clone.innerHTML.trim();
    }
}

// 7. Generate JSON Structure and Write to Hidden Input
function prepareJson() {
    const container = document.getElementById('fieldsContainer');
    if (!container) return;
    const formGroups = container.querySelectorAll('.form-group');
    const formStructure = [];

    formGroups.forEach((group) => {
        const labelText = group.querySelector('.field-header .label-text')?.innerText.replace(':', '').trim() || '';
        const inputElement = group.querySelector('input:not([type="radio"]), textarea');

        // Match exact casing used when assigning the ID
        const OverallSatis = group.id === 'Overall-rating' || group.id === 'overall-rating';
        const ratingContainer = group.querySelector('.rating');

        // Detect if required by checking data attributes OR button state
        const isGroupRequired = group.dataset.required === 'true';
        const isButtonActive = group.querySelector('.btn-required')?.classList.contains('active') || false;
        const isInputRequired = inputElement ? inputElement.dataset.fieldRequired === 'true' || inputElement.hasAttribute('required') : false;

        const isRequired = isGroupRequired || isButtonActive || isInputRequired;

        let fieldData = {
            label: labelText,
            name: '',
            type: '',
            required: isRequired
        };

        if (inputElement) {
            fieldData.name = inputElement.name || '';
            fieldData.type = inputElement.type || inputElement.tagName.toLowerCase();

        } else if (ratingContainer) {
            const firstRadio = ratingContainer.querySelector('input[type="radio"]');

            // Set name based on whether it is an overall rating field
            if (OverallSatis) {
                fieldData.name = 'overall-satisfaction';
                fieldData.type = 'rating';
            } else {
                fieldData.name = firstRadio ? firstRadio.name : 'satisfaction';
                fieldData.type = 'rating';
            }

            fieldData.options = [];
            ratingContainer.querySelectorAll('.rating-item').forEach((item) => {
                const radio = item.querySelector('input[type="radio"]');
                const text = item.querySelector('.rating-text')?.innerText.trim() || '';
                fieldData.options.push({
                    value: radio ? radio.value : '',
                    text: text
                });
            });
        }

        formStructure.push(fieldData);
    });

    const hiddenInput = document.getElementById('jsonContent');

    if (hiddenInput) {
        hiddenInput.value = JSON.stringify(formStructure);
    }
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function loadDashboardData() {
    const container = document.getElementById('dashboardContainer');
    if (!container) return;

    container.innerHTML = '<h2>Dashboard</h2><p>Loading...</p>';

    try {
        const response = await fetch('fetch_dashboard.php', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status !== 'success') {
            container.innerHTML = `<h2>Dashboard</h2><p>Error: ${escapeHtml(result.message)}</p>`;
            return;
        }

        const totalEvent = Array.isArray(result.all_data)
            ? result.all_data.length
            : 0;
        // Container wrapper forced to left text alignment
        let html = `
                        <h2>Dashboard</h2>
                        <div class="dashboard-content">
                            <div class="dashboard-left">
                                <div class="event-summary-card">
                                    <p><strong>Total Existing Events:</strong> ${totalEvent}</p>
                                </div>
                            </div>
                    `;
        if (!result.recent_data || result.recent_data.length === 0) {
            html += '<p style="text-align: left;">No records found for this user.</p>';
        } else {
            html += `
                            <div class="dashboard-right">
                                <h3>Recent Events</h3>
                                <div class="dashboard-records">`;
            result.recent_data.forEach(item => {
                html += `
                    <div class="record-card" style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; text-align: left;">
                        <h3>${escapeHtml(item.Title)}</h3>
                        <p><strong>Count:</strong> ${escapeHtml(String(item.Finished))}</p>
                    </div>
                `;
            });
            html += '</div>';
        }
        html += '</div>';
        container.innerHTML = html;

    } catch (error) {
        console.error("Fetch Error Detail:", error);
        container.innerHTML = `<h2>Dashboard</h2><p>Failed to fetch data from server: ${escapeHtml(error.message)}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const toggleDashboardBtn = document.getElementById("toggleDashboardBtn");
    const surveyContainer = document.getElementById("surveyContainer");
    const dashboardContainer = document.getElementById("dashboardContainer");

    if (toggleDashboardBtn && surveyContainer && dashboardContainer) {
        toggleDashboardBtn.addEventListener("click", function () {
            const isDashboardHidden = dashboardContainer.classList.contains("hidden");

            if (isDashboardHidden) {
                surveyContainer.classList.add("hidden");
                dashboardContainer.classList.remove("hidden");
                toggleDashboardBtn.textContent = "Show Form";
                loadDashboardData();
            } else {
                dashboardContainer.classList.add("hidden");
                surveyContainer.classList.remove("hidden");
                toggleDashboardBtn.textContent = "Show Dashboard";
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const navFormBtn = document.getElementById("navFormBtn");
    const navDashboardBtn = document.getElementById("navDashboardBtn");
    const toggleDashboardBtn = document.getElementById("toggleDashboardBtn");

    const surveyContainer = document.getElementById("surveyContainer");
    const dashboardContainer = document.getElementById("dashboardContainer");

    function showForm() {
        surveyContainer?.classList.remove("hidden");
        dashboardContainer?.classList.add("hidden");

        navFormBtn?.classList.add("active");
        navDashboardBtn?.classList.remove("active");

        if (toggleDashboardBtn) {
            toggleDashboardBtn.textContent = "Show Dashboard";
        }
    }

    function showDashboard() {
        surveyContainer?.classList.add("hidden");
        dashboardContainer?.classList.remove("hidden");

        navDashboardBtn?.classList.add("active");
        navFormBtn?.classList.remove("active");

        if (toggleDashboardBtn) {
            toggleDashboardBtn.textContent = "Show Form";
        }

        // Fetch dashboard data
        loadDashboardData();
    }

    // Navigation bar click listeners
    navFormBtn?.addEventListener("click", showForm);
    navDashboardBtn?.addEventListener("click", showDashboard);

    // Floating action button toggle listener
    toggleDashboardBtn?.addEventListener("click", function () {
        const isDashboardHidden = dashboardContainer?.classList.contains("hidden");
        if (isDashboardHidden) {
            showDashboard();
        } else {
            showForm();
        }
    });

    // Default initialization: show dashboard first
    showDashboard();
});

document.addEventListener("DOMContentLoaded", function () {
    const addInputBtn = document.getElementById("addInputBtn");
    const fabMenu = document.getElementById("fabMenu");
    const loadDefaultBtn = document.getElementById("loadDefaultBtn");

    // Toggle speed dial popup animation
    if (addInputBtn && fabMenu) {
        addInputBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            const isOpen = fabMenu.classList.contains("show");

            if (isOpen) {
                fabMenu.classList.remove("show");
                addInputBtn.classList.remove("active");
            } else {
                fabMenu.classList.add("show");
                addInputBtn.classList.add("active");
            }
        });

        // Close popup when clicking outside
        document.addEventListener("click", function (e) {
            if (!fabMenu.contains(e.target) && !addInputBtn.contains(e.target)) {
                fabMenu.classList.remove("show");
                addInputBtn.classList.remove("active");
            }
        });
    }

    // Close menu when Default Form button is clicked
    if (loadDefaultBtn) {
        loadDefaultBtn.addEventListener("click", function () {
            fabMenu?.classList.remove("show");
            addInputBtn?.classList.remove("active");
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const addFieldBtn = document.getElementById('addFieldBtn');
    const fabMenu = document.getElementById('fabMenu');
    const addInputBtn = document.getElementById('addInputBtn');

    // Trigger field addition from the popup option and close menu
    addFieldBtn?.addEventListener('click', function () {
        addCustomField();
        fabMenu?.classList.remove('show');
        addInputBtn?.classList.remove('active');
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const navFormBtn = document.getElementById("navFormBtn");
    const navDashboardBtn = document.getElementById("navDashboardBtn");
    const navActivityBtn = document.getElementById("navActivityBtn");

    const surveyContainer = document.getElementById("surveyContainer");
    const dashboardContainer = document.getElementById("dashboardContainer");
    const activityContainer = document.getElementById("activityContainer");

    function clearActiveState() {
        surveyContainer?.classList.add("hidden");
        dashboardContainer?.classList.add("hidden");
        activityContainer?.classList.add("hidden");

        navFormBtn?.classList.remove("active");
        navDashboardBtn?.classList.remove("active");
        navActivityBtn?.classList.remove("active");
    }

    function showForm() {
        clearActiveState();
        surveyContainer?.classList.remove("hidden");
        navFormBtn?.classList.add("active");
    }

    function showDashboard() {
        clearActiveState();
        dashboardContainer?.classList.remove("hidden");
        navDashboardBtn?.classList.add("active");
        loadDashboardData();
    }

    function showActivity() {
        clearActiveState();
        activityContainer?.classList.remove("hidden");
        navActivityBtn?.classList.add("active");
        loadActivityData();
    }

    // Navigation bar event listeners
    navFormBtn?.addEventListener("click", showForm);
    navDashboardBtn?.addEventListener("click", showDashboard);
    navActivityBtn?.addEventListener("click", showActivity);

    // Initial state
    showDashboard();
});

// Add rating field
document.getElementById('add-rating').addEventListener('click', function () {
    const container = document.getElementById('fieldsContainer');
    if (!container) return;

    container.hidden = false;

    const name = `rating${customFieldCount}`;

    const groupDiv = document.createElement('div');
    groupDiv.className = 'form-group';
    groupDiv.id = "regular-rating";

    groupDiv.innerHTML = `
        <div class="field-header">
            <label for="${name}" class="label-text">rating:</label>
            <div class="controls">
                <button type="button" class= "btn-select" onclick="OverallSatisfactionField(this)">Overall Satisfaction</button>
                <button type="button" class="btn-required" onclick="toggleRequired(this)">Required</button>
                <button type="button" onclick="moveUp(this)">▲</button>
                <button type="button" onclick="moveDown(this)">▼</button>
                <button type="button" class="btn-delete" onclick="deleteField(this)">✕</button>
            </div>
        </div>

        <div class="rating">
            <label class="rating-item">
                <input type="radio" name="${name}" value="1" hidden>
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#FF1A1A" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <path d="M 30 70 Q 50 50 70 70 Z" fill="#000" />
                </svg>
                <span class="rating-text">Most Dissatisfied<br>1</span>
            </label>

            <label class="rating-item">
                <input type="radio" name="${name}" value="2" hidden>
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#FF8C32" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <path d="M 30 68 Q 50 52 70 68" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round" />
                </svg>
                <span class="rating-text">Dissatisfied<br>2</span>
            </label>

            <label class="rating-item">
                <input type="radio" name="${name}" value="3" hidden>
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#FFC83B" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <line x1="30" y1="62" x2="70" y2="62" stroke="#000" stroke-width="6" stroke-linecap="round" />
                </svg>
                <span class="rating-text">Neutral<br>3</span>
            </label>

            <label class="rating-item">
                <input type="radio" name="${name}" value="4" hidden>
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#8CE63B" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <path d="M 30 58 Q 50 75 70 58" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round" />
                </svg>
                <span class="rating-text">Satisfied<br>4</span>
            </label>

            <label class="rating-item">
                <input type="radio" name="${name}" value="5" hidden>
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#00A838" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <path d="M 30 55 Q 50 78 70 55 Z" fill="#000" />
                </svg>
                <span class="rating-text">Most Satisfied<br>5</span>
            </label>
        </div>
    `;
    const newLabel = groupDiv.querySelector('.label-text');
    container.appendChild(groupDiv);

    makeLabelEditable(newLabel, name, 'Satisfaction');
    customFieldCount++;
});

// Add overall-field 
function OverallSatisfactionField(button) {
    const formGroup = button.closest('.form-group');
    if (!formGroup) return;

    const fieldsContainer = document.getElementById('fieldsContainer');
    const overallCount = fieldsContainer
        ? fieldsContainer.querySelectorAll('[id="Overall-rating"]').length
        : 0;

    const isCurrentlyOverall = formGroup.id === 'Overall-rating';

    if (isCurrentlyOverall || overallCount >= 1) {
        formGroup.id = 'regular-rating';
        button.classList.remove('active');
        console.log("error");
    } else {
        formGroup.id = 'Overall-rating';
        button.classList.add('active');
    }
}

// make sure the overall-button is active when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Find all buttons inside a form group that starts as 'Overall-rating'
    const initialOverallButtons = document.querySelectorAll('#Overall-rating .btn-select');

    initialOverallButtons.forEach(button => {
        button.classList.add('active');
    });
});




document.addEventListener("DOMContentLoaded", function () {
    const navFormBtn = document.getElementById("navFormBtn");
    const navDashboardBtn = document.getElementById("navDashboardBtn");
    const navActivityBtn = document.getElementById("navActivityBtn");

    const surveyContainer = document.getElementById("surveyContainer");
    const dashboardContainer = document.getElementById("dashboardContainer");
    const activityContainer = document.getElementById("activityContainer");

    // Target the FAB container
    const fabContainer = document.querySelector(".fab-container");

    // Helper function to update FAB visibility based on surveyContainer status
    function updateFabVisibility() {
        if (!surveyContainer || !fabContainer) return;

        // If surveyContainer does NOT have the 'hidden' class, show FAB container
        if (!surveyContainer.classList.contains("hidden")) {
            fabContainer.classList.remove("hidden"); // Or: fabContainer.style.display = "block";
        } else {
            fabContainer.classList.add("hidden");    // Or: fabContainer.style.display = "none";
        }
    }

    function clearActiveState() {
        surveyContainer?.classList.add("hidden");
        dashboardContainer?.classList.add("hidden");
        activityContainer?.classList.add("hidden");

        navFormBtn?.classList.remove("active");
        navDashboardBtn?.classList.remove("active");
        navActivityBtn?.classList.remove("active");
    }

    function showForm() {
        clearActiveState();
        surveyContainer?.classList.remove("hidden");
        navFormBtn?.classList.add("active");

        updateFabVisibility(); // Sync FAB state
    }

    function showDashboard() {
        clearActiveState();
        dashboardContainer?.classList.remove("hidden");
        navDashboardBtn?.classList.add("active");

        updateFabVisibility(); // Sync FAB state
        loadDashboardData();
    }

    function showActivity() {
        clearActiveState();
        activityContainer?.classList.remove("hidden");
        navActivityBtn?.classList.add("active");

        updateFabVisibility(); // Sync FAB state
        loadActivityData();
    }

    // Navigation event listeners
    navFormBtn?.addEventListener("click", showForm);
    navDashboardBtn?.addEventListener("click", showDashboard);
    navActivityBtn?.addEventListener("click", showActivity);

    // Initial state setup
    showDashboard();
});

function showFeedback(message, statusClass) {
    let popup = document.getElementById('feedback-popup');

    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'feedback-popup';
        popup.className = 'popup-overlay';

        popup.innerHTML = `
            <div class="popup-content">
                <button class="popup-close-btn">&times;</button>
                <span class="popup-message"></span>
            </div>
        `;

        document.body.appendChild(popup);

        // Close on background click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.remove('active');
            }
        });
    }

    const contentBox = popup.querySelector('.popup-content');
    const messageSpan = popup.querySelector('.popup-message');

    // Ensure close button exists if static HTML was used
    let closeBtn = popup.querySelector('.popup-close-btn');
    if (!closeBtn) {
        closeBtn = document.createElement('button');
        closeBtn.className = 'popup-close-btn';
        closeBtn.innerHTML = '&times;';
        contentBox.insertBefore(closeBtn, contentBox.firstChild);
    }

    // Attach click handler to close button
    closeBtn.onclick = () => {
        popup.classList.remove('active');
    };

    contentBox.className = `popup-content ${statusClass}`;
    messageSpan.textContent = message;

    popup.classList.add('active');
}

function toggleRequired(button) {
    const formGroup = button.closest('.form-group');
    const radioInputs = formGroup.querySelectorAll('input[type="radio"]');
    const otherInputs = formGroup.querySelectorAll('input:not([type="radio"]), textarea, select');

    if (radioInputs.length > 0) {
        // For radio groups, only toggling the first input is required for group validation
        const firstRadio = radioInputs[0];
        const isRequired = firstRadio.hasAttribute('required');

        if (isRequired) {
            firstRadio.removeAttribute('required');
        } else {
            firstRadio.setAttribute('required', 'required');
        }

        button.classList.toggle('active', !isRequired);
    } else if (otherInputs.length > 0) {
        // For standard input/textarea controls
        const isRequired = otherInputs[0].hasAttribute('required');

        otherInputs.forEach(input => {
            if (isRequired) {
                input.removeAttribute('required');
            } else {
                input.setAttribute('required', 'required');
            }
        });

        button.classList.toggle('active', !isRequired);
    }
}

function selectedRow(ID) {
    const row = document.getElementById(ID);

    // Find item in globalActivityID matching the ID parameter
    const targetItem = globalActivityID.find(item => String(item.ID) === String(ID));

    if (!targetItem) {
        console.warn("Item not found in global data for ID:", ID);
        return;
    }

    if (row) {
        // Toggle highlight and update selection array
        if (row.style.backgroundColor) {
            row.style.backgroundColor = "";
            Graph_selected_rows = Graph_selected_rows.filter(
                item => item !== targetItem
            );
        } else {
            Graph_selected_rows.push(targetItem);
            row.style.backgroundColor = "#ffcdd2";
        }
    }

    const selectedDiv = document.getElementById("selected-activity");
    const selectBtn = document.getElementById("select-btn");

    if (!selectedDiv || !selectBtn) return;

    const selectedCount = Graph_selected_rows.length;

    if (selectedCount > 0) {
        const titles = Graph_selected_rows.map(item => item.Title).join(", ");
        selectedDiv.textContent = `Selected (${selectedCount}): ${titles}`;

        selectedDiv.removeAttribute("hidden");
        selectBtn.removeAttribute("hidden");
    } else {
        selectedDiv.textContent = "Selected: ";

        selectedDiv.setAttribute("hidden", "true");
        selectBtn.setAttribute("hidden", "true");
    }


}

async function exportSelectedRows() {
    if (Graph_selected_rows.length === 0) {
        alert("Please select at least one row.");
        return;
    }

    try {
        const titles = Graph_selected_rows.map(item => item.Title);

        const params = new URLSearchParams();
        params.append('selected_title', JSON.stringify(titles));

        const response = await fetch('fetch_dashboard.php', {
            method: 'POST',
            body: params // Headers set automatically
        });

        if (!response.ok) {
            throw new Error('Server returned non-OK status: ' + response.status);
        }

        const data = await response.json();
        const result = data;

        const form = document.createElement('form');
        form.method = 'GET';
        form.action = 'Show_panel_export.php    ';

        const activities = result.selected_activity || [];

        activities.forEach(item => {
            const titleInput = document.createElement('input');
            titleInput.type = 'hidden';
            titleInput.name = 'selected_activity[]';
            titleInput.value = JSON.stringify(item);
            form.appendChild(titleInput);

        });

        document.body.appendChild(form);
        form.submit();

    } catch (error) {
        console.error('Error:', error);
    }

}
