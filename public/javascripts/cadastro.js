const toggleSenha = document.getElementById('toggleSenha');
const senha = document.getElementById('senha');
const toggleConSenha = document.getElementById('toggleConSenha');
const conSenha = document.getElementById('con_senha');

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

document.getElementById('cadastroForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const con_senha = document.getElementById('con_senha').value;
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

    if (!nome || !email || !senha || !con_senha) {
        exibirMensagem("Preencha todos os campos");
        hasError = true;
    }

    if (senha.length < 5 || senha.length > 10) {
        exibirMensagem("Digite entre 5 a 10 dígitos para a senha");
        hasError = true;
    }

    if (con_senha !== senha) {
        exibirMensagem("As senhas têm que ser iguais");
        hasError = true;
    }

    if (hasError) {
        if (!nome) document.getElementById('nome').classList.add('error');
        if (!email) document.getElementById('email').classList.add('error');
        if (!senha || senha.length < 5 || senha.length > 10) document.getElementById('senha').classList.add('error');
        if (con_senha !== senha) document.getElementById('con_senha').classList.add('error');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Aguarde a resposta";

    try {
        const response = await fetch('/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Usuário cadastrado com sucesso:', result);
            localStorage.setItem('cadastroMensagem', 'Cadastro realizado com sucesso!');
            window.location.href = "/login";
        } else {
            exibirMensagem("Esse email já exixte no banco de dados");
            submitButton.disabled = false;
            submitButton.textContent = "Salvar";
        }
    } catch (error) {
        console.log("Erro ao enviar dados:", error);
    }
});

document.querySelector('.hamburger').addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('active');
});