document.addEventListener('DOMContentLoaded', () => {
    const avaliacaoDivs = document.querySelectorAll('.avaliacao');
    const mensagemErroAvaliacaoComentarrio = document.getElementById('mensagemErroAvaliacaoComentarrio');
    const mensagemSucessosAvaliacaoComentarrio = document.getElementById('mensagemSucessosAvaliacaoComentarrio');

    function exibirMensagemSucesso(mensagemSucesso) {
        mensagemSucessosAvaliacaoComentarrio.textContent = mensagemSucesso;
        mensagemSucessosAvaliacaoComentarrio.style.opacity = '1';
        setTimeout(() => {
            mensagemSucessosAvaliacaoComentarrio.style.opacity = '0';
        }, 5000);
    }

    function exibirMensagemErro(mensagemErro) {
        mensagemErroAvaliacaoComentarrio.textContent = mensagemErro;
        mensagemErroAvaliacaoComentarrio.style.opacity = '1';
        setTimeout(() => {
            mensagemErroAvaliacaoComentarrio.style.opacity = '0';
        }, 5000);
    }

    avaliacaoDivs.forEach(async (avaliacaoDiv) => {
        const estrelas = avaliacaoDiv.querySelectorAll('input[type="radio"]');

        if (estrelas.length > 0) {
            const videoId = estrelas[0].name.replace('estrela', '');

            try {
                const response = await fetch(`/avaliacao-media?videoId=${videoId}`);
                const data = await response.json();

                if (response.ok && data) {
                    const mediaLabel = avaliacaoDiv.querySelector('.media-label');
                    const totalCliquesLabel = avaliacaoDiv.querySelector('.total-cliques-label');

                    if (mediaLabel) {
                        mediaLabel.textContent = `${data.media}`;
                    }

                    if (totalCliquesLabel) {
                        totalCliquesLabel.textContent = `(${data.total_cliques})`;
                    }

                    const mediaAvaliacao = Math.round(data.media);

                    const estrela = avaliacaoDiv.querySelector(`input[type="radio"][value="${mediaAvaliacao}"]`);
                    if (estrela) {
                        estrela.checked = true;
                    }
                } else {
                    console.warn(`Nenhuma média encontrada para o vídeo ID ${videoId}.`);
                }
            } catch (error) {
                console.error('Erro ao buscar a média das avaliações:', error);
            }

            estrelas.forEach(estrela => {
                estrela.addEventListener('change', async (event) => {
                    const avaliacao = event.target.value;

                    try {
                        const response = await fetch('/avaliar', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                video_id: videoId,
                                avaliacao: avaliacao
                            })
                        });

                        if (response.ok) {
                            exibirMensagemSucesso('Avaliação registrada com sucesso!');
                        } else {
                            exibirMensagemErro('Erro ao registrar a avaliação.');
                        }
                    } catch (error) {
                        console.error('Erro:', error);
                    }
                });
            });
        } else {
            console.error('Nenhum input de rádio encontrado dentro de .avaliacao');
        }
    });
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

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navUl = document.querySelector('header nav ul');

    hamburger.addEventListener('click', function() {
      navUl.classList.toggle('active');
    });
});