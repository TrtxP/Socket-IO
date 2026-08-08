document.addEventListener('DOMContentLoaded', () => {

    // Handle register form submission via fetch/JSON
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const repeatPass = document.getElementById('repeat-pass').value;

        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, repeatPass }),
            });

            if (response.redirected) {
                window.location.href = response.url;
                return;
            }

            if (response.ok) {
                window.location.href = '/';
            } else {
                const text = await response.text();
                alert(text || 'Registration failed');
            }
        } catch (err) {
            alert('Network error');
        }
    });

    const toAuthorizationButton = document.getElementById('login');
    toAuthorizationButton.addEventListener('click', (e) => {
        const targetPath = e.target;
        const loginURL = targetPath.dataset.url;
        window.location.href = loginURL;
    });
});