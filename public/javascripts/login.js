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

document.addEventListener('DOMContentLoaded', () => {
    const mensagemSucesso = localStorage.getItem('cadastroMensagem');
    if (mensagemSucesso) {
        const mensagemSucessoDiv = document.getElementById('mensagemSucesso');
        mensagemSucessoDiv.textContent = mensagemSucesso;
        mensagemSucessoDiv.style.opacity = '1';
        setTimeout(() => {
            mensagemSucessoDiv.style.opacity = '0';
        }, 5000);

        localStorage.removeItem('cadastroMensagem');
    }
});

const toggleSenha = document.getElementById('toggleSenha');
const senha = document.getElementById('senha');

toggleSenha.addEventListener('click', function () {
    const type = senha.getAttribute('type') === 'password' ? 'text' : 'password';
    senha.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const mensagemErro = document.getElementById('mensagemErro');
    const submitButton = document.querySelector('button[type="submit"]');

    function exibirMensagem(mensagem) {
        mensagemErro.textContent = mensagem;
        mensagemErro.style.opacity = '1';
        setTimeout(() => {
            mensagemErro.style.opacity = '0';
        }, 5000);
    }

    const inputs = document.querySelectorAll('#cadastroForm input');
    inputs.forEach(input => input.classList.remove('error'));

    let hasError = false;

    if (!email || !senha) {
        exibirMensagem("Preencha todos os campos");
        hasError = true;
    }

    if (hasError) {
        if (!email) document.getElementById('email').classList.add('error');
        if (!senha || senha.length < 5 || senha.length > 10) document.getElementById('senha').classList.add('error');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Aguarda a resposta";

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                email: email,
                senha: senha
            })
        });

        if (response.ok) {
            localStorage.setItem('cadastroMensagem', 'Login realizado com sucesso!');
            window.location.href = '/home';
        } else {
            exibirMensagem("Email ou senha inválido");
            submitButton.disabled = false;
            submitButton.textContent = "Entrar";
        }
    } catch (error) {
        console.error("Erro ao enviar dados:", error);
    }
});
