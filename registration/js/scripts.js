document.addEventListener('DOMContentLoaded', () => {
    const toAuthorizationButton = document.getElementById('login');
    toAuthorizationButton.addEventListener('click', () => {
        window.location.href = 'http://localhost:5500/login';
    })
});