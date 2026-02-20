document.addEventListener('DOMContentLoaded', () => {
    const toAuthorizationButton = document.getElementById('login')
    toAuthorizationButton.addEventListener('click', (e) => {
        const targetPath = e.target
        const loginURL = targetPath.dataset.url
        window.location.href = loginURL
    })
})