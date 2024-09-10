document.getElementById('form_recupera_senha').addEventListener('submit', async function(event) {
    event.preventDefault();

    const getemail = document.getElementById('email').value.trim();
    const mensagemErro = document.getElementById('mensagemErro');
    const mensagemSucessos = document.getElementById('mensagemSucessos');

    function exibirMensagemErros(mensagem) {
        mensagemErro.textContent = mensagem;
        mensagemErro.style.opacity = '1';
        setTimeout(() => {
            mensagemErro.style.opacity = '0';
        }, 5000);
    }

    function exibirMensagemSucessos(mensagem) {
        mensagemSucessos.textContent = mensagem;
        mensagemSucessos.style.opacity = '1';
        setTimeout(() =>{
            mensagemSucessos.style.opacity = '0';
        }, 20000);
    }

    if (!getemail) {
        exibirMensagemErros("Preencha o campo de email.");
        document.getElementById('email').classList.add('error');
        return;
    }

    try {
        const response = await fetch('/recupera_senha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: getemail })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Resposta do servidor:', result);
            exibirMensagemSucessos(`Pode fechar esta página, verifique teu email e clique 
                no link que te foi enviado pelo email. 
                Esse link vai te levar para página de redefinição de senha e depois 
                de redefinir a senha você vai cair na página de login de novo 
                se dêr tudo certo. Esse link é válido por 30 minutos`
            );
            document.getElementById('email').value = '';
        } else {
            exibirMensagemErros("Email inválido.");
        }
    } catch (error) {
        console.error("Erro ao enviar dados:", error);
        exibirMensagemErros("Erro ao processar a solicitação.");
    }
});

document.querySelector('.hamburger').addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('active');
});