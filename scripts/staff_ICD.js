let customFieldCount = 1;
let questionCounter = 0;
let FieldCount = 0;
let globalStudentData = [];
let globalActivityID = [];
let Graph_selected_rows = [];

const indicators = [
    { name: "GLO 1-1", max: 5 },
    { name: "GLO 1-2", max: 5 },
    { name: "GLO 2-1", max: 5 },
    { name: "GLO 2-2", max: 5 },
    { name: "GLO 3-1", max: 5 },
    { name: "GLO 3-2", max: 5 },
    { name: "GLO 4-1", max: 5 },
    { name: "GLO 4-2", max: 5 }
];

// Toggle submit button visibility based on whether form-groups exist
function toggleSubmitBtnVisibility() {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;
    const hasFields = document.querySelectorAll('.form-group').length > 0;
    submitBtn.style.display = hasFields ? 'block' : 'none';
}

//ISW
document.getElementById('loadDefaultBtn')?.addEventListener('click', function () {
    const container = document.getElementById('fieldsContainer');
    if (!container) return;

    container.hidden = false;

    // Generate the dropdown options dynamically from the array
    const indicatorDropdown = `
        <select onchange="this.closest('.form-group').setAttribute('name', this.value)" class="indicator-dropdown" required>
            <option value="" disabled selected>Select GLO</option>
            ${indicators.map(ind => `<option value="${ind.name}">${ind.name}</option>`).join('')}
        </select>
    `;

    // Added name="" to the form-group div to be updated by the dropdown
    const defaultFormHTML = `
    <!-- ==================== Question ${questionCounter} ==================== -->
    <div class="form-group" id="question${questionCounter}" name="">
        <div class="field-header">
            <label class="label-text">
                label00
            </label>
            <div class="controls">
                ${indicatorDropdown}
                <button type="button" class="btn-required active" onclick="toggleRequired(this)">Required</button>
                <button type="button" onclick="moveUp(this)">▲</button>
                <button type="button" onclick="moveDown(this)">▼</button>
                <button type="button" class="btn-delete" onclick="deleteField(this)">✕</button>
            </div>
        </div>
        <div class="rating">
            <label class="rating-item" for="q${questionCounter}_5">
                <input type="radio" id="q${questionCounter}_5" name="q${questionCounter}" value="5" class="visually-hidden rating-input">
            </label>
            <label class="rating-item" for="q${questionCounter}_4">
                <input type="radio" id="q${questionCounter}_4" name="q${questionCounter}" value="4" class="visually-hidden rating-input">
            </label>
            <label class="rating-item" for="q${questionCounter}_3">
                <input type="radio" id="q${questionCounter}_3" name="q${questionCounter}" value="3" class="visually-hidden rating-input">
            </label>
            <label class="rating-item" for="q${questionCounter}_2">
                <input type="radio" id="q${questionCounter}_2" name="q${questionCounter}" value="2" class="visually-hidden rating-input">
            </label>
            <label class="rating-item" for="q${questionCounter}_1">
                <input type="radio" id="q${questionCounter}_1" name="q${questionCounter}" value="1" class="visually-hidden rating-input">
            </label>
        </div>
    </div>
    `;

    container.insertAdjacentHTML('beforeend', defaultFormHTML);

    container.querySelectorAll('.label-text').forEach(makeLabelEditable);

    if (typeof toggleSubmitBtnVisibility === 'function') {
        toggleSubmitBtnVisibility();
    }

    questionCounter += 1;
});

//ICD
document.getElementById('loadDefaultBtn_ICD')?.addEventListener('click', function () {
    const defaultFormHTML = `
    <div id="ratings-container"></div>
    <div class="form-group" id="regular-rating">
        <div class="field-header">
            <label for="satisfaction" class="label-text">Satisfaction:</label>
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
                <input type="radio" name="rating" value="1" class="visually-hidden">
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#FF1A1A" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <path d="M 30 70 Q 50 50 70 70 Z" fill="#000" />
                </svg>
                <span class="rating-text">Most Dissatisfied<br>1</span>
            </label>

            <label class="rating-item">
                <input type="radio" name="rating" value="2" class="visually-hidden">
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#FF8C32" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <path d="M 30 68 Q 50 52 70 68" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round" />
                </svg>
                <span class="rating-text">Dissatisfied<br>2</span>
            </label>

            <label class="rating-item">
                <input type="radio" name="rating" value="3" class="visually-hidden">
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#FFC83B" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <line x1="30" y1="62" x2="70" y2="62" stroke="#000" stroke-width="6" stroke-linecap="round" />
                </svg>
                <span class="rating-text">Neutral<br>3</span>
            </label>

            <label class="rating-item">
                <input type="radio" name="rating" value="4" class="visually-hidden">
                <svg class="emotion" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#8CE63B" />
                    <circle cx="35" cy="38" r="5" fill="#000" />
                    <circle cx="65" cy="38" r="5" fill="#000" />
                    <path d="M 30 58 Q 50 75 70 58" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round" />
                </svg>
                <span class="rating-text">Satisfied<br>4</span>
            </label>

            <label class="rating-item">
                <input type="radio" name="rating" value="5" class="visually-hidden">
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
    const container = document.getElementById('fieldsContainer');
    if (!container) return;

    container.hidden = false;

    // Append the default form elements (Satisfaction rating + Comment field)
    container.insertAdjacentHTML('beforeend', defaultFormHTML);

    // Apply editable label logic to newly inserted fields
    container.querySelectorAll('.label-text').forEach(makeLabelEditable);

    // Update submit button visibility if handler exists
    if (typeof toggleSubmitBtnVisibility === 'function') {
        toggleSubmitBtnVisibility();
    }
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
function makeLabelEditable(labelElement, fieldId, defaultTh = '', defaultEn = '') {
    if (!labelElement.dataset.th) labelElement.dataset.th = defaultTh;
    if (!labelElement.dataset.en) labelElement.dataset.en = defaultEn;

    labelElement.addEventListener('dblclick', function () {
        // Prevent creating duplicate popups if already open
        if (document.querySelector('.label-modal-backdrop')) return;

        // 1. Create Modal Elements
        const backdrop = document.createElement('div');
        backdrop.className = 'label-modal-backdrop';

        const modal = document.createElement('div');
        modal.className = 'label-modal-content';

        modal.innerHTML = `
            <h4 style="margin: 0 0 12px 0;text-align: center;">Edit Label</h4>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                <label style="display: flex; flex-direction: column; font-size: 0.85rem; font-weight: bold;">
                    ภาษาไทย:
                    <input type="text" class="modal-input-th" placeholder="ชื่อภาษาไทย" style="padding: 6px; font-size: 1rem; margin-top: 4px;">
                </label>
                <label style="display: flex; flex-direction: column; font-size: 0.85rem; font-weight: bold;">
                    English:
                    <input type="text" class="modal-input-en" placeholder="English name" style="padding: 6px; font-size: 1rem; margin-top: 4px;">
                </label>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 8px;">
                <button type="button" class="btn-modal-cancel" style="padding: 6px 12px; cursor: pointer;">ยกเลิก</button>
                <button type="button" class="btn-modal-save" style="padding: 6px 12px; cursor: pointer;">บันทึก</button>
            </div>
        `;

        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        const inputTh = modal.querySelector('.modal-input-th');
        const inputEn = modal.querySelector('.modal-input-en');
        const btnSave = modal.querySelector('.btn-modal-save');
        const btnCancel = modal.querySelector('.btn-modal-cancel');

        // Populate values
        inputTh.value = '';
        inputEn.value = '';

        // Auto-focus Thai input
        inputTh.focus();
        inputTh.select();

        // 2. Closing / Cleanup Helper
        const closeModal = () => {
            if (backdrop.parentNode) {
                backdrop.remove();
            }
        };

        // 3. Save Function
        const saveEdit = () => {
            const newTh = inputTh.value.trim() || labelElement.dataset.th;
            const newEn = inputEn.value.trim() || labelElement.dataset.en;

            // Update datasets
            labelElement.dataset.th = newTh;
            labelElement.dataset.en = newEn;

            // Render label text with line break
            labelElement.innerHTML = `${newTh}<br>${newEn}`;

            // Update associated form input name
            const targetInput = document.getElementById(fieldId);
            if (targetInput) {
                targetInput.name = newEn;
            }

            closeModal();
        };

        // 4. Event Listeners
        btnSave.addEventListener('click', saveEdit);
        btnCancel.addEventListener('click', closeModal);

        // Click outside modal to cancel
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closeModal();
        });

        // Enter key flow: Thai -> English -> Save
        inputTh.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                inputEn.focus();
                inputEn.select();
            }
        });

        inputEn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            }
        });

        // Escape key to cancel
        window.addEventListener('keydown', function onEsc(e) {
            if (e.key === 'Escape') {
                closeModal();
                window.removeEventListener('keydown', onEsc);
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
    console.log(dataInput);
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

        // Store result globally
        globalStudentData = result.student_data || [];
        globalActivityID = result.all_data || [];

        // Data structures to hold aggregated ratings and comments
        const satisfactionDict = {};
        const commentDict = {};

        // Parse student_data -> Data -> General -> Overall_satisfaction & comment
        globalStudentData.forEach(entry => {
            if (!entry.Title || !entry.Data) return;

            let parsedData;
            try {
                parsedData = typeof entry.Data === 'string' ? JSON.parse(entry.Data) : entry.Data;
            } catch (err) {
                console.error("JSON parse error for entry ID:", entry.ID, err);
                return;
            }

            const generalArray = parsedData.General;
            if (!Array.isArray(generalArray)) return;

            const title = entry.Title;

            generalArray.forEach(field => {
                // Case-insensitive match for Overall_satisfaction
                if (field.name && field.name.toLowerCase() === 'overall_satisfaction' && field.value) {
                    satisfactionDict[title] = satisfactionDict[title] || {};
                    satisfactionDict[title][field.value] = (satisfactionDict[title][field.value] || 0) + 1;
                }

                // Collect comments if present in General
                if (field.name && field.name.toLowerCase() === 'comment' && field.value) {
                    commentDict[title] = commentDict[title] || {};
                    commentDict[title][field.value] = (commentDict[title][field.value] || 0) + 1;
                }
            });
        });

        const ratingLabels = {
            "1": "Very Bad",
            "2": "Bad",
            "3": "Average",
            "4": "Good",
            "5": "Excellent"
        };

        let tableHTML = `
            <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">ID</th>
                        <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Activity's name</th>
                        <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Link</th>
                        <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let fieldCount = 0;

        result.all_data.forEach(row => {
            const titleEscaped = escapeHtml(row.Title || '');

            // Aggregate satisfaction levels (1 to 5)
            const scores = satisfactionDict[row.Title] || {};
            const formattedScores = ['1', '2', '3', '4', '5']
                .map(level => {
                    const count = scores[level] || 0;
                    const label = ratingLabels[level];
                    return `${label}: ${count}`;
                })
                .join(' | ');

            // Format comments summary
            const commentsObj = commentDict[row.Title] || {};
            const formattedComments = Object.entries(commentsObj)
                .map(([comment, count]) => `Comment: ${count}`)
                .join(' | ');

            const combinedResult = formattedComments
                ? `${formattedScores}`
                : formattedScores;

            fieldCount += 1;
            const generatedLink = generateDynamicLink(row.Title);

            tableHTML += `
                <tr id="${escapeHtml(String(row.ID || ''))}">
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">
                        <a href="#" onclick="selectedRow('${row.ID}'); return false;" style="display: block; padding: 8px; color: inherit; text-decoration: none;">
                            ${fieldCount}
                        </a>
                    </td>
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">
                        <a href="javascript:void(0)" onclick="showPopup('${titleEscaped.replace(/'/g, "\\'")}')" style="color: #4CAF50; text-decoration: underline; cursor: pointer;">
                            ${titleEscaped}
                        </a>
                    </td>
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">
                        <a href="${generatedLink}" target="_blank" style="color: #2196F3;">
                            Open Form
                        </a>
                    </td>
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">
                        <button type="button" 
                                onclick="showResponsePopup('${titleEscaped.replace(/'/g, "\\'")}', '${escapeHtml(combinedResult).replace(/'/g, "\\'")}')"
                                style="padding: 4px 12px; cursor: pointer;">
                            Summary
                        </button>
                        <button type="button" 
                                onclick="editForm('${titleEscaped.replace(/'/g, "\\'")}')"
                                style="padding: 4px 12px; cursor: pointer;" id="edit_btn">
                            Edit
                        </button>
                        <button type="button" 
                                onclick="deleteForm('${titleEscaped.replace(/'/g, "\\'")}')"
                                style="padding: 4px 12px; cursor: pointer;">
                            Delete
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

function toggleLoginRequirement(btn) {
    const hiddenInput = document.getElementById('login_required');
    if (hiddenInput.value === "0") {
        hiddenInput.value = "1";
        btn.textContent = "Login Required: ON";
    } else {
        hiddenInput.value = "0";
        btn.textContent = "Login Required: OFF";
    }
    console.log(hiddenInput.value);
}

// 7. Generate JSON Structure and Write to Hidden Input
function prepareJson(e) {
    if (e) e.preventDefault();
    try {
        const container = document.getElementById('fieldsContainer');
        if (!container) return false;

        const hasOverallRating = !!container.querySelector('#Overall-rating, #overall-rating');
        if (!hasOverallRating) {
            alert('Please add an Overall-rating field before proceeding.');
            return false;
        }

        let questionCounter = 1; // 1. Reset per run

        const formGroups = container.querySelectorAll('.form-group');
        const groupedStructure = {};

        for (const group of formGroups) {
            const labelText = group.querySelector('.field-header .label-text')?.innerText.replace(':', '').trim() || '';
            const inputElement = group.querySelector('input:not([type="radio"]), textarea');
            const dropdown = group.querySelector('.indicator-dropdown');

            const gloKey = dropdown && dropdown.value ? dropdown.value : 'General';
            const isOverallSatis = group.id === 'Overall-rating' || group.id === 'overall-rating';
            const ratingContainer = group.querySelector('.rating');

            const isGroupRequired = group.dataset.required === 'true';
            const isButtonActive = group.querySelector('.btn-required')?.classList.contains('active') || false;
            const isInputRequired = inputElement ? (inputElement.dataset.fieldRequired === 'true' || inputElement.hasAttribute('required')) : false;

            const isRequired = isGroupRequired || isButtonActive || isInputRequired;

            let fieldData = {
                label: labelText,
                name: '',
                type: '',
                required: isRequired
            };

            if (ratingContainer) {
                fieldData.type = 'rating';

                if (isOverallSatis) {
                    fieldData.name = 'Overall_satisfaction';
                } else {
                    const firstRadio = ratingContainer.querySelector('input[type="radio"]');

                    // 2. Increment ONLY when fallback is used
                    let rawName = (firstRadio && firstRadio.name)
                        ? firstRadio.name
                        : `question_${questionCounter++}`;

                    rawName = rawName.replace(/_(before|after)(_[0-9]+)?$/, '');
                    fieldData.name = rawName;
                }

                fieldData.options = [];
                ratingContainer.querySelectorAll('.rating-item').forEach((item) => {
                    const radio = item.querySelector('input[type="radio"]');
                    const textNode = item.querySelector('.rating-text');

                    let text = '';
                    if (textNode) {
                        text = textNode.innerHTML.replace(/<br\s*[\/]?>/gi, '\n').replace(/(<([^>]+)>)/gi, "").trim();
                    }

                    fieldData.options.push({
                        value: radio ? radio.value : '',
                        text: text
                    });
                });
            } else if (inputElement) {
                // Same logic here: increment only when inputElement.name is empty
                fieldData.name = inputElement.name || `field_${questionCounter++}`;
                fieldData.type = inputElement.type || inputElement.tagName.toLowerCase();

                if (fieldData.name.toLowerCase() === 'student_id') {
                    fieldData.type = 'number';
                    fieldData.name = 'student_id';
                }
            }

            fieldData.name = fieldData.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

            if (!groupedStructure[gloKey]) {
                groupedStructure[gloKey] = [];
            }

            groupedStructure[gloKey].push(fieldData);
        }

        const hiddenInput = document.getElementById('jsonContent');
        if (hiddenInput) {
            hiddenInput.value = JSON.stringify(groupedStructure);
        }

        return true;

    } catch (error) {
        console.error('Failed to process form structure:', error);
        return false;
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

        // Update total count display
        document.getElementById('total_assc').innerText = "Total assc: " + result.total_assc;

        // Target the table body container
        const emailListContainer = document.getElementById('associatedEmailList');

        // Render rows dynamically
        if (result.associated_email && result.associated_email.length > 0) {
            let rowsHtml = '';

            result.associated_email.forEach((email, index) => {
                rowsHtml += `
            <tr>
                <td>${index + 1}</td>
                <td>${email}</td>
                <td>
                    <button type="button" onclick="deleteAssociation('${email}')">Delete</button>
                </td>
            </tr>
             `;
            });

            emailListContainer.innerHTML = rowsHtml;
        } else {
            emailListContainer.innerHTML = `
            <tr>
                <td colspan="3">No associated emails found.</td>
            </tr>
            `;
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


// Add rating field
document.getElementById('add-rating').addEventListener('click', function () {
    const container = document.getElementById('fieldsContainer');
    if (!container) return;

    container.hidden = false;

    const name = `rating`;

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

    // Select radio inputs scoped ONLY inside this form group
    const inputs = formGroup.querySelectorAll('input[type="radio"]');

    const fieldsContainer = document.getElementById('fieldsContainer');
    const overallCount = fieldsContainer
        ? fieldsContainer.querySelectorAll('#Overall-rating').length
        : 0;

    const isCurrentlyOverall = formGroup.id === 'Overall-rating';

    if (isCurrentlyOverall) {
        // Toggle from Overall back to Regular
        formGroup.id = 'regular-rating';
        inputs.forEach(input => {
            input.name = 'rating';
        });
        button.classList.remove('active');
    } else if (overallCount < 1) {
        // Set to Overall if no other Overall rating exists
        formGroup.id = 'Overall-rating';
        inputs.forEach(input => {
            input.name = 'Overall_satisfaction';
        });
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
    if (!formGroup) return;

    const radioInputs = formGroup.querySelectorAll('input[type="radio"]');
    // Exclude indicator-dropdown from required toggling
    const otherInputs = formGroup.querySelectorAll('input:not([type="radio"]):not([type="hidden"]), textarea, select:not(.indicator-dropdown)');

    if (radioInputs.length > 0) {
        const firstRadio = radioInputs[0];
        const isRequired = firstRadio.hasAttribute('required');

        if (isRequired) {
            firstRadio.removeAttribute('required');
        } else {
            firstRadio.setAttribute('required', 'required');
        }
        button.classList.toggle('active', !isRequired);
    } else if (otherInputs.length > 0) {
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
    let text = '';

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
            body: params
        });

        if (!response.ok) {
            throw new Error('Server returned non-OK status: ' + response.status);
        }

        const result = await response.json();
        const selected_activity = result.selected_activity;
        console.log("selected", selected_activity);

        const satisfactionDict = {};
        const commentDict = {};

        // 1. Process aggregated data
        selected_activity.forEach(item => {
            const title = item.Title;
            const id = item.Student_ID;
            const value = item.overall_satisfaction;
            const comment = item.comment;

            if (value) {
                satisfactionDict[title] = satisfactionDict[title] || {};
                satisfactionDict[title][value] = (satisfactionDict[title][value] || 0) + 1;
            }
            if (comment) {
                commentDict[title] = commentDict[title] || {};
                commentDict[title][comment] = (commentDict[title][comment] || 0) + 1;
            }
        });
        console.log('satisfac:', satisfactionDict);

        const ratingLabels = {
            "1": "Very Bad",
            "2": "Bad",
            "3": "Average",
            "4": "Good",
            "5": "Excellent"
        };

        // 2. Iterate over unique titles to construct text
        const uniqueTitles = [...new Set(selected_activity.map(item => item.Title))];

        const textArray = uniqueTitles.map(title => {
            // Find the matching item to retrieve ID and Name safely
            const item = selected_activity.find(i => i.Title === title) || {};
            const id = item.Student_ID || '';

            const scores = satisfactionDict[title] || {};

            // 1. Format individual level counts
            const formattedScores = ['1', '2', '3', '4', '5']
                .map(level => `${ratingLabels[level]}: ${scores[level] || 0}`)
                .join(' | ');

            // 2. Calculate average score
            let totalScoreSum = 0;
            let totalResponses = 0;

            ['1', '2', '3', '4', '5'].forEach(level => {
                const count = Number(scores[level]) || 0;
                totalScoreSum += Number(level) * count;
                totalResponses += count;
            });

            const avgScore = totalResponses > 0
                ? (totalScoreSum / totalResponses).toFixed(2)

                : '0.00';
            console.log("avg", avgScore);
            console.log("Total", totalScoreSum / totalResponses)
            const commentsObj = commentDict[title] || {};
            const formattedComments = Object.entries(commentsObj)
                .map(([comment, count]) => `${comment}: ${count}`)
                .join(' | ');

            return `Title: ${title}\nScores: ${formattedScores}\nAverage: ${avgScore}\nComments: ${formattedComments}`;
        });

        // Combined result as string
        text = textArray.join('\n\n');

        // 3. Pass text to form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'Show_panel_export.php';

        const textInput = document.createElement('input');
        textInput.type = 'hidden';
        textInput.name = 'export_text';
        textInput.value = text;
        form.appendChild(textInput);
        console.log("input:", textInput);

        document.body.appendChild(form);
        form.submit();

    } catch (error) {
        console.error('Error:', error);
    }
}

function deleteForm(title) {
    // Prompt user for confirmation
    const confirmed = confirm(`Are you sure you want to delete "${title}"?`);

    // If user clicks "Cancel", terminate function execution
    if (!confirmed) {
        return;
    }

    try {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'delete.php';

        const titleInput = document.createElement('input');
        titleInput.type = 'hidden';
        titleInput.name = 'delete_title';
        titleInput.value = title;
        form.appendChild(titleInput);

        document.body.appendChild(form);
        form.submit();

    } catch (error) {
        console.error('Error:', error);
    }
}

function deleteAssociation(emailToDelete) {
    if (!confirm(`Are you sure you want to delete ${emailToDelete}?`)) {
        return;
    }

    fetch('delete_assc.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ associated_email: emailToDelete })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message || 'Association deleted successfully!');
                location.reload();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred.');
        });
}


function initDashboard() {
    const navFormBtn = document.getElementById("navFormBtn");
    const navDashboardBtn = document.getElementById("navDashboardBtn");
    const navActivityBtn = document.getElementById("navActivityBtn");
    const allowanceBtn = document.getElementById("allowanceBtn");

    const surveyContainer = document.getElementById("surveyContainer");
    const dashboardContainer = document.getElementById("dashboardContainer");
    const activityContainer = document.getElementById("activityContainer");
    const editFormContainer = document.getElementById("editFormContainer");
    const associationContainer = document.getElementById("associationContainer");
    const fabContainer = document.querySelector(".fab-container");

    function updateFabVisibility() {
        if (!fabContainer) return;
        const isSurveyVisible = surveyContainer && !surveyContainer.classList.contains("hidden");
        const isAssociationVisible = associationContainer && !associationContainer.classList.contains("hidden");
        fabContainer.classList.toggle("hidden", isAssociationVisible || !isSurveyVisible);
    }

    function clearActiveState() {
        surveyContainer?.classList.add("hidden");
        dashboardContainer?.classList.add("hidden");
        activityContainer?.classList.add("hidden");
        editFormContainer?.classList.add("hidden");
        associationContainer?.classList.add("hidden");

        navFormBtn?.classList.remove("active");
        navDashboardBtn?.classList.remove("active");
        navActivityBtn?.classList.remove("active");
        allowanceBtn?.classList.remove("active");
    }

    function showForm() {
        clearActiveState();
        surveyContainer?.classList.remove("hidden");
        navFormBtn?.classList.add("active");
        updateFabVisibility();
    }

    function showDashboard() {
        clearActiveState();
        dashboardContainer?.classList.remove("hidden");
        navDashboardBtn?.classList.add("active");
        updateFabVisibility();
        if (typeof loadDashboardData === "function") loadDashboardData();
    }

    function showActivity() {
        clearActiveState();
        activityContainer?.classList.remove("hidden");
        navActivityBtn?.classList.add("active");
        updateFabVisibility();
        if (typeof loadActivityData === "function") loadActivityData();
    }

    function showAssociation() {
        clearActiveState();
        associationContainer?.classList.remove("hidden");
        allowanceBtn?.classList.add("active");
        updateFabVisibility();
    }

    async function editForm(title) {
        showForm();
        try {
            const url = "fetch_dashboard.php?edit_title=" + encodeURIComponent(title);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            populateForm(result.selected_edit_data);
        } catch (error) {
            console.error('Error fetching edit form data:', error);
        }
    }

    window.editForm = editForm;

    navFormBtn?.addEventListener("click", showForm);
    navDashboardBtn?.addEventListener("click", showDashboard);
    navActivityBtn?.addEventListener("click", showActivity);
    allowanceBtn?.addEventListener("click", showAssociation);

    // Initial load
    showDashboard();
}

function initFabMenu() {
    const addInputBtn = document.getElementById("addInputBtn");
    const fabMenu = document.getElementById("fabMenu");
    const loadDefaultBtn = document.getElementById("loadDefaultBtn");
    const addFieldBtn = document.getElementById("addFieldBtn");

    if (!addInputBtn || !fabMenu) return;

    // Toggle menu visibility
    addInputBtn.onclick = function (e) {
        e.stopPropagation();
        const isOpen = fabMenu.classList.contains("show");
        fabMenu.classList.toggle("show", !isOpen);
        addInputBtn.classList.toggle("active", !isOpen);
    };

    // Close when clicking outside
    document.onclick = function (e) {
        if (!fabMenu.contains(e.target) && !addInputBtn.contains(e.target)) {
            fabMenu.classList.remove("show");
            addInputBtn.classList.remove("active");
        }
    };

    // Close menu when child options are clicked
    if (loadDefaultBtn) {
        loadDefaultBtn.onclick = function () {
            fabMenu.classList.remove("show");
            addInputBtn.classList.remove("active");
        };
    }

    if (addFieldBtn) {
        addFieldBtn.onclick = function () {
            if (typeof addCustomField === "function") addCustomField();
            fabMenu.classList.remove("show");
            addInputBtn.classList.remove("active");
        };
    }
}

// Check whether DOM is already ready:
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboard);
} else {
    // If injected dynamically after page parse, run immediately
    initDashboard();
    initFabMenu();
}

// auto fill after user clicked edit button on activity export panel
/**
 * Populates the HTML form using the database object structure.
 * @param {Object} data - Database record object containing Title and stringified Field array.
 */
function populateForm(data) {

    // 1. Panel Visibility Switch
    document.getElementById('activityContainer').classList.add('hidden');
    document.getElementById('surveyContainer').classList.remove('hidden');

    // 2. Set Main Title
    if (data.Title) {
        document.getElementById('title').value = data.Title;
    }

    // 3. Parse JSON stringified field definition
    let fields = [];
    try {
        let parsed = typeof data.Field === 'string' ? JSON.parse(data.Field) : (data.Field || []);
        // Flatten grouped object values into a single array if needed
        fields = Array.isArray(parsed) ? parsed : Object.values(parsed).flat();
    } catch (e) {
        console.error("Invalid JSON format in Field column:", e);
        return;
    }
    console.log(fields);
    // 4. Clear Current Form Nodes
    const container = document.getElementById('fieldsContainer');
    container.innerHTML = '';

    // 5. Render Dynamic Field Group
    fields.forEach(field => {
        const group = document.createElement('div');
        group.className = 'form-group';


        // Header Container
        const header = document.createElement('div');
        header.className = 'field-header';

        const label = document.createElement('label');
        label.className = 'label-text';
        label.textContent = field.label.endsWith(':') ? field.label : `${field.label}:`;

        const controls = document.createElement('div');
        controls.className = 'controls';
        controls.innerHTML = `
            <button type="button" class="btn-required ${field.required ? 'active' : ''}" onclick="toggleRequired(this)">Required</button>
            <button type="button" onclick="moveUp(this)">▲</button>
            <button type="button" onclick="moveDown(this)">▼</button>
            <button type="button" class="btn-delete" onclick="deleteField(this)">✕</button>
        `;

        // prepare for overall rating
        if (field.name == "Overall_satisfaction") {
            group.id = "Overall-rating";
            controls.innerHTML = `
            <button type="button" class="btn-select ${field.name == "Overall_satisfaction" ? 'active' : ''}" onclick="OverallSatisfactionField(this)">Overall Satisfaction</button>
            <button type="button" class="btn-required ${field.required ? 'active' : ''}" onclick="toggleRequired(this)">Required</button>
            <button type="button" onclick="moveUp(this)">▲</button>
            <button type="button" onclick="moveDown(this)">▼</button>
            <button type="button" class="btn-delete" onclick="deleteField(this)">✕</button>
        `;
        } else if (field.name == "rating") {
            group.id = "regular-rating";
            controls.innerHTML = `
            <button type="button" class= "btn-select ${field.name == "Overall_satisfaction" ? 'active' : ''}" onclick="OverallSatisfactionField(this)">Overall Satisfaction</button>
            <button type="button" class="btn-required ${field.required ? 'active' : ''}" onclick="toggleRequired(this)">Required</button>
            <button type="button" onclick="moveUp(this)">▲</button>
            <button type="button" onclick="moveDown(this)">▼</button>
            <button type="button" class="btn-delete" onclick="deleteField(this)">✕</button>
        `;
        }

        header.appendChild(label);
        header.appendChild(controls);
        group.appendChild(header);

        // Input Component Generation Based on Type
        let inputEl;

        switch (field.type) {
            case 'textarea':
                inputEl = document.createElement('textarea');
                inputEl.id = field.name;
                inputEl.name = field.name;
                makeLabelEditable(label, field.name, field.label);
                break;

            case 'rating': {
                inputEl = document.createElement('div');
                inputEl.className = 'rating';
                makeLabelEditable(label, field.name, field.label);
                // SVG icon mapping corresponding to rating values 1 through 5
                const ratingIcons = {
                    '1': `<svg class="emotion" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#FF1A1A"></circle><circle cx="35" cy="38" r="5" fill="#000"></circle><circle cx="65" cy="38" r="5" fill="#000"></circle><path d="M 30 70 Q 50 50 70 70 Z" fill="#000"></path></svg>`,
                    '2': `<svg class="emotion" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#FF8C32"></circle><circle cx="35" cy="38" r="5" fill="#000"></circle><circle cx="65" cy="38" r="5" fill="#000"></circle><path d="M 30 68 Q 50 52 70 68" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round"></path></svg>`,
                    '3': `<svg class="emotion" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#FFC83B"></circle><circle cx="35" cy="38" r="5" fill="#000"></circle><circle cx="65" cy="38" r="5" fill="#000"></circle><line x1="30" y1="62" x2="70" y2="62" stroke="#000" stroke-width="6" stroke-linecap="round"></line></svg>`,
                    '4': `<svg class="emotion" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#8CE63B"></circle><circle cx="35" cy="38" r="5" fill="#000"></circle><circle cx="65" cy="38" r="5" fill="#000"></circle><path d="M 30 58 Q 50 75 70 58" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round"></path></svg>`,
                    '5': `<svg class="emotion" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#00A838"></circle><circle cx="35" cy="38" r="5" fill="#000"></circle><circle cx="65" cy="38" r="5" fill="#000"></circle><path d="M 30 55 Q 50 78 70 55 Z" fill="#000"></path></svg>`
                };

                if (Array.isArray(field.options)) {
                    field.options.forEach((opt, index) => {
                        const optLabel = document.createElement('label');
                        optLabel.className = 'rating-item';

                        // 1. Radio Input
                        const radio = document.createElement('input');
                        radio.type = 'radio';
                        radio.name = field.name;
                        radio.value = opt.value;
                        radio.id = `${field.name}_${index}`;
                        radio.hidden = true;

                        if (field.required) {
                            radio.required = true;
                        }

                        optLabel.appendChild(radio);

                        // 2. SVG Icon Insertion
                        const svgMarkup = opt.svg || opt.icon || ratingIcons[opt.value];
                        if (svgMarkup) {
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = svgMarkup.trim();
                            if (tempDiv.firstElementChild) {
                                optLabel.appendChild(tempDiv.firstElementChild);
                            }
                        }

                        // 3. Rating Text Span
                        const textContainer = document.createElement('span');
                        textContainer.className = 'rating-text';

                        const formattedText = opt.text.includes('\n')
                            ? opt.text.replace(/\n/g, '<br>')
                            : `${opt.text}<br>${opt.value}`;

                        textContainer.innerHTML = formattedText;
                        optLabel.appendChild(textContainer);

                        inputEl.appendChild(optLabel);
                    });
                }
                break;
            }

            case 'number':
            case 'text':
            default:
                inputEl = document.createElement('input');
                inputEl.type = field.type || 'text';
                inputEl.id = field.name;
                inputEl.name = field.name;
                makeLabelEditable(label, field.name, field.label);
                break;
        }

        if (field.type !== 'rating' && field.required) {
            inputEl.required = true;
        }

        group.appendChild(inputEl);
        container.appendChild(group);
    });
}