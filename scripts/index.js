document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        // Prevent default browser page submission
        e.preventDefault();

        // Populate hidden input data
        collectFormData();

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showFeedback('Form submitted successfully!', 'success');
                form.reset();
            } else {
                showFeedback(data.message || 'Submission failed.', 'error');
            }
        } catch (error) {
            showFeedback('An error occurred during submission.', 'error');
        }
    });
});

function collectFormData() {
    const container = document.querySelector('.survey-container');
    if (!container) return;

    const elements = container.querySelectorAll('input, textarea');
    const result = [];

    elements.forEach((element) => {
        if (element.type === 'hidden') return;

        if (element.type === 'radio') {
            if (element.checked) {
                result.push({
                    name: element.name,
                    value: element.value
                });
            }
        } else {
            result.push({
                name: element.name || element.id,
                value: element.value
            });
        }
    });

    const resultInput = document.getElementById('survey_result_input');
    if (resultInput) {
        resultInput.value = JSON.stringify(result);
    }
}

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

        // Close on button click
        popup.querySelector('.popup-close-btn').addEventListener('click', () => {
            popup.classList.remove('active');
        });

        // Close on background click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.remove('active');
            }
        });
    }

    const contentBox = popup.querySelector('.popup-content');
    const messageSpan = popup.querySelector('.popup-message');

    contentBox.className = `popup-content ${statusClass}`;
    messageSpan.textContent = message;

    popup.classList.add('active');
}