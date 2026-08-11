document.addEventListener('DOMContentLoaded', () => {

    // Handle login form submission via fetch/JSON
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.redirected) {
                window.location.href = response.url;
                return;
            }

            if (response.ok) {
                window.location.href = '/';
            } else {
                const text = await response.text();
                alert(text || 'Login failed');
            }
        } catch (err) {
            alert('Network error');
        }
    });

    const registrationButton = document.getElementById('register');
    registrationButton.addEventListener('click', (e) => {
        const targetPath = e.target;
        const registerURL = targetPath.dataset.url;
        window.location.href = registerURL;
    });

    const resetPassButton = document.getElementById('resetPass');
    resetPassButton.addEventListener('click', (e) => {
        const targetPath = e.target;
        const resetURL = targetPath.dataset.url;
        window.location.href = resetURL;
    });
});