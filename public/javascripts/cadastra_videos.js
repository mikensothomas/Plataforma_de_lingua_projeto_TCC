document.getElementById('videosForm01').addEventListener('submit', async function(event) {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const link = document.getElementById('link').value;
    const nivel = document.querySelector('input[name="nivel"]:checked');
    const mensagemSucessosCadastroVideo = document.getElementById('mensagemSucessosCadastroVideo');
    const mensagemErroCadastroVideo = document.getElementById('mensagemErroCadastroVideo');

    function exibirMensagemErro(mensagemErro) {
        mensagemErroCadastroVideo.textContent = mensagemErro;
        mensagemErroCadastroVideo.style.opacity = '1';
        setTimeout(() => {
            mensagemErroCadastroVideo.style.opacity = '0';
        }, 5000);
    }

    function exibirMensagemSucesso(mensagemSucesso) {
        mensagemSucessosCadastroVideo.textContent = mensagemSucesso;
        mensagemSucessosCadastroVideo.style.opacity = '1';
        setTimeout(() => {
            mensagemSucessosCadastroVideo.style.opacity = '0';
        }, 5000);
    }

    if (!titulo || !descricao || !link || !nivel) {
        exibirMensagemErro("Todos os campos são necessários");
        return;
    }

    const formData = {
        titulo: titulo,
        descricao: descricao,
        link: link,
        nivel: nivel.value
    };

    try {
        const response = await fetch('/videos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Vídeo cadastrado com sucesso:', result);
            exibirMensagemSucesso("Vídeo cadastrado com sucesso");
            document.getElementById('videosForm01').reset();
        } else {
            const errorMessage = await response.text();
            alert(errorMessage);
        }
    } catch (error) {
        console.error("Erro ao enviar dados:", error);
    }
});

document.querySelector('.hamburger').addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('active');
});