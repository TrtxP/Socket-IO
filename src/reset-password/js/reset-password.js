document.addEventListener('DOMContentLoaded', () => {

    const resetForm = document.getElementById('reset-password-form');
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const repeatNewPassword = document.getElementById('repeat-new-password').value;

        if (newPassword !== repeatNewPassword) {
            alert("New passwords don't match");
            return;
        }

        if (currentPassword === newPassword) {
            alert("New password must be different from the current password");
            return;
        }

        try {
            const response = await fetch('/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, currentPassword, newPassword }),
            });

            if (response.ok) {
                alert('Password has been reset successfully!');
                window.location.href = '/login';
            } else {
                const text = await response.text();
                alert(text || 'Password reset failed');
            }
        } catch (err) {
            alert('Network error');
        }
    });

    const toLoginButton = document.getElementById('login');
    toLoginButton.addEventListener('click', (e) => {
        const targetPath = e.target;
        const loginURL = targetPath.dataset.url;
        window.location.href = loginURL;
    });
});
