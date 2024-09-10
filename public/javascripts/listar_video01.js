document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/aulas_nivel01');
        if (!response.ok) {
            throw new Error('Erro na rede ao tentar obter os vídeos');
        }
        const videos = await response.json();
        const videoList = document.getElementById('videoList');
        
        videos.forEach(video => {
            const videoDiv = document.createElement('div');
            const videoTitle = document.createElement('h2');
            videoTitle.textContent = video.titulo01;
            
            const videoDescription = document.createElement('p');
            videoDescription.textContent = video.descricao01;

            const videoLink = document.createElement('a');
            videoLink.href = `/cadastra_videos01/${video.id}`;
            videoLink.textContent = 'Assistir vídeo';
            videoLink.target = '_blank'; // Abrir em uma nova aba

            videoDiv.appendChild(videoTitle);
            videoDiv.appendChild(videoDescription);
            videoDiv.appendChild(videoLink);

            videoList.appendChild(videoDiv);
        });
    } catch (error) {
        console.error('Erro ao carregar vídeos:', error);
    }
});
