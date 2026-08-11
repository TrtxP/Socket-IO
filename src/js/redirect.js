export function redirectTo(path) {
    const button = document.getElementById(path);
    button.addEventListener('click', (e) => {
        const targetPath = e.target;
        const targetURL = targetPath.dataset.url;
        window.location.href = targetURL;
    })
}