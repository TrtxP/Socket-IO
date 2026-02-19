document.addEventListener('DOMContentLoaded', () => {

    // const googleLoginButton = document.getElementById('google-login');
    // googleLoginButton.addEventListener('click', () => {
    //     window.location.href = 'https://accounts.google.com/v3/signin/identifier?authuser=0&continue=https%3A%2F%2Fmyaccount.google.com%2F&ec=GAlAwAE&hl=ru&service=accountsettings&flowName=GlifWebSignIn&flowEntry=AddSession&dsh=S-2112924128%3A1736940200697582&ddm=1';
    // });

    const registrationButton = document.getElementById('register');
    registrationButton.addEventListener('click', () => {
        window.location.href = 'http://localhost:5500/register';
    });

    // const otherLoginButton = document.getElementById('other-login');
    // otherLoginButton.addEventListener('click', () => {
    //     alert('Другие способы входа будут добавлены позже!');
    // });
});