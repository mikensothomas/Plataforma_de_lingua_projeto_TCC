const toggleSenha = document.getElementById('toggleSenha');
const senha = document.getElementById('nova_senha');
const toggleConSenha = document.getElementById('toggleConSenha');
const conSenha = document.getElementById('confirma_senha');

toggleSenha.addEventListener('click', function () {
    const type = senha.getAttribute('type') === 'password' ? 'text' : 'password';
    senha.setAttribute('type', type);

    this.classList.toggle('fa-eye-slash');
});

toggleConSenha.addEventListener('click', function () {
    const type = conSenha.getAttribute('type') === 'password' ? 'text' : 'password';
    conSenha.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
});

document.getElementById('form_nova_senha').addEventListener('submit', async function(event) {
    event.preventDefault();

    const novaSenha = document.getElementById('nova_senha').value;
    const confirmaSenha = document.getElementById('confirma_senha').value;
    const mensagemErro = document.getElementById('mensagemErro');
    const submitButton = document.querySelector('button[type="submit"]');

    function exibirMensagem(mensagem) {
        mensagemErro.textContent = mensagem;
        mensagemErro.style.opacity = '1';
        setTimeout(() => {
            mensagemErro.style.opacity = '0';
        }, 5000);
    }

    let hasError = false;

    if (!novaSenha || !confirmaSenha) {
        exibirMensagem("Por favor, preencha ambos os campos de senha.");
        hasError = true;
    } else if (novaSenha.length < 6){
        exibirMensagem("A senha tem que ter pelo menos 6 caracteres.");
        hasError = true;
    } 

    if (novaSenha !== confirmaSenha) {
        exibirMensagem("As senhas não coincidem.");
        hasError = true;
    }

    if (hasError) {
        document.getElementById('nova_senha').classList.add('error');
        document.getElementById('confirma_senha').classList.add('error');
        return;
    }

    const token = new URLSearchParams(window.location.search).get('token');

    submitButton.disabled = true;
    submitButton.textContent = "Aguarda a resposta";

    try {
        const response = await fetch('/atualiza_senha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, novaSenha })
        });

        if (response.ok) {
            localStorage.setItem('cadastroMensagem', 'Atualização feita com sucesso!');
            window.location.href = '/login';
        } else {
            exibirMensagem("Erro ao atualizar a senha.");
            submitButton.disabled = false;
            submitButton.textContent = "Salvar";
        }
    } catch (error) {
        console.error("Erro ao enviar dados:", error);
        exibirMensagem("Erro ao processar a solicitação.");
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
