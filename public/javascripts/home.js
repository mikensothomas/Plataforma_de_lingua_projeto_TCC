document.addEventListener('DOMContentLoaded', () => {
    const mensagemSucessosLogin = localStorage.getItem('cadastroMensagem');
    if (mensagemSucessosLogin) {
        const mensagemSucessoDiv = document.querySelector('.mensagemSucessosLogin');
        mensagemSucessoDiv.textContent = mensagemSucessosLogin;
        mensagemSucessoDiv.style.opacity = '1';
        setTimeout(() => {
            mensagemSucessoDiv.style.opacity = '0';
        }, 5000);

        localStorage.removeItem('cadastroMensagem');
    }
});
document.querySelector('.hamburger').addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('active');
});
