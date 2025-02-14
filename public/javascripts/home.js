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

document.addEventListener('DOMContentLoaded', function () {
    const langToggle = document.querySelector('.lang-toggle');
    const langMenu = document.querySelector('.lang-menu');

    langToggle.addEventListener('click', function () {
        langMenu.style.display = langMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', function (event) {
        if (!langToggle.contains(event.target) && !langMenu.contains(event.target)) {
            langMenu.style.display = 'none';
        }
    });
});

document.querySelector('.hamburger').addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('active');
});