document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#surveyForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const studentId = (formData.get('student_id') || '').trim();
        const studentName = (formData.get('student_name') || 'N/A').trim();
        const title = (formData.get('title') || '').trim();

        // 1. Validation for Student ID
        if (!studentId) {
            Swal.fire('Error', 'Please enter your Student ID.', 'error');
            return;
        }

        const groupedResults = {};

        // 2. Determine fields source: window.surveyTemplateFields OR read directly from DOM data-group-key
        const referenceJson = window.surveyTemplateFields;

        if (referenceJson && Object.keys(referenceJson).length > 0) {
            // Method A: Built from dynamic JS reference template
            for (const [groupName, questions] of Object.entries(referenceJson)) {
                groupedResults[groupName] = [];

                for (const q of questions) {
                    const fieldName = q.name;
                    if (fieldName === 'student_id' || fieldName === 'student_name') continue;

                    if (q.type === 'rating' && fieldName !== 'Overall_satisfaction') {
                        groupedResults[groupName].push({
                            name: fieldName,
                            label: q.label || '',
                            value_before: formData.get(fieldName + '_before') || null,
                            value_after: formData.get(fieldName + '_after') || null
                        });
                    } else {
                        groupedResults[groupName].push({
                            name: fieldName,
                            label: q.label || '',
                            value: formData.get(fieldName) || null
                        });
                    }
                }
            }
        } else {
            // Method B: Fallback - Read directly from the rendered HTML DOM attributes
            const formGroups = form.querySelectorAll('.form-group[data-group-key]');

            formGroups.forEach(groupEl => {
                const groupKey = groupEl.getAttribute('data-group-key') || 'General';
                if (!groupedResults[groupKey]) {
                    groupedResults[groupKey] = [];
                }

                // Check for input/textarea elements within this wrapper
                const primaryInput = groupEl.querySelector('input[name], textarea[name]');
                if (!primaryInput) return;

                let rawName = primaryInput.getAttribute('name');
                // Strip _before / _after suffixes for phase rating blocks
                let baseName = rawName.replace(/(_before|_after)$/, '');

                if (baseName === 'student_id' || baseName === 'student_name') return;

                // Avoid duplicating already-processed group questions
                const alreadyAdded = groupedResults[groupKey].some(item => item.name === baseName);
                if (alreadyAdded) return;

                const labelEl = groupEl.querySelector('.question-title');
                const labelText = labelEl ? labelEl.innerText.trim() : '';

                const isBeforeAfter = groupEl.querySelector('.before-after-container') !== null;

                if (isBeforeAfter) {
                    groupedResults[groupKey].push({
                        name: baseName,
                        label: labelText,
                        value_before: formData.get(baseName + '_before') || null,
                        value_after: formData.get(baseName + '_after') || null
                    });
                } else {
                    groupedResults[groupKey].push({
                        name: baseName,
                        label: labelText,
                        value: formData.get(baseName) || null
                    });
                }
            });
        }

        // 3. Prepare payload
        const payload = new URLSearchParams();
        payload.append('student_id', studentId);
        payload.append('student_name', studentName);
        payload.append('title', title);
        payload.append('survey_result', JSON.stringify(groupedResults));

        // 4. Send the request
        try {
            const response = await fetch(form.action || 'stud_insert.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: payload.toString()
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Swal.fire('Success', 'Form submitted successfully!', 'success');
                form.reset();
                document.querySelectorAll('.question-container').forEach(c => c.classList.remove('answered'));
                window.location.href = data.redirect || 'thankyou.php';
            } else {
                Swal.fire('Error', data.message || 'Submission failed.', 'error');
                location.reload();
            }
        } catch (error) {
            console.error("Fetch error:", error);
            Swal.fire('Error', 'An error occurred during submission.', 'error');
        }
    });
});

function initFeedbackPopup() {
    let popup = document.getElementById('feedback-popup');
    if (!popup) return;

    const content = popup.querySelector('.popup-content');
    if (content && !content.querySelector('.popup-close-btn')) {
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'popup-close-btn';
        closeBtn.innerHTML = '&times;';
        content.prepend(closeBtn);
    }

    popup.addEventListener('click', (e) => {
        if (e.target === popup || e.target.classList.contains('popup-close-btn')) {
            popup.classList.remove('active');
        }
    });
}

function showFeedback(message, statusClass) {
    const popup = document.getElementById('feedback-popup');
    if (!popup) {
        alert(message);
        return;
    }

    const contentBox = popup.querySelector('.popup-content');
    const messageSpan = popup.querySelector('.popup-message');

    if (contentBox) contentBox.className = `popup-content ${statusClass}`;
    if (messageSpan) messageSpan.textContent = message;

    popup.classList.add('active');
}