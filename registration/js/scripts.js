document.addEventListener('DOMContentLoaded', () => {
    const toAuthorizationButton = document.getElementById('to-authorization');
    toAuthorizationButton.addEventListener('click', () => {
        window.location.href = 'http://localhost:5500/authorization/'
    })
});