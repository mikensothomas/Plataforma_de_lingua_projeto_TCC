document.addEventListener('DOMContentLoaded', function() {
  const comentarioForms = document.querySelectorAll('[id^="formulario_comentario_"]');
  const mensagemErroAvaliacaoComentarrio = document.getElementById('mensagemErroAvaliacaoComentarrio');
  const mensagemSucessosAvaliacaoComentarrio = document.getElementById('mensagemSucessosAvaliacaoComentarrio');

  function exibirMensagemErro(mensagemErro) {
    mensagemErroAvaliacaoComentarrio.textContent = mensagemErro;
    mensagemErroAvaliacaoComentarrio.style.opacity = '1';
    setTimeout(() => {
      mensagemErroAvaliacaoComentarrio.style.opacity = '0';
    }, 5000);
  }

  function exibirMensagemSucesso(mensagemSucesso) {
    mensagemSucessosAvaliacaoComentarrio.textContent = mensagemSucesso;
    mensagemSucessosAvaliacaoComentarrio.style.opacity = '1';
    setTimeout(() => {
      mensagemSucessosAvaliacaoComentarrio.style.opacity = '0';
    }, 5000);
  }

  comentarioForms.forEach(form => {
    const getInput = form.querySelector('[id^="comentario_"]');
    const videoId = form.id.split('_')[2];
    
    form.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      if (getInput.value.trim() === '') {
        exibirMensagemErro("Por favor, insira um comentário antes de enviar.");
        return;
      } else {
        exibirMensagemSucesso("Comentário enviado com sucesso!");
      }
      
      try {
        const response = await axios.post(`/comentarios/${videoId}`, {
          comentario: getInput.value
        });
  
        console.log('Comentário inserido:', response.data);
      } catch (error) {
        console.error('Erro ao enviar requisição:', error.message);
      }
      getInput.value = '';
    });
  });
});