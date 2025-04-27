document.addEventListener('DOMContentLoaded', function() {
    // Pega os elementos do DOM (HTML) que vamos manipular
    const chatMessages = document.getElementById('chat-messages'); // Área onde aparecem as mensagens
    const messageInput = document.getElementById('message-input'); // Campo de digitar a mensagem
    const sendButton = document.getElementById('send-button');     // Botão de enviar mensagem
    const streamersBtn = document.getElementById('streamers-btn'); // Botão de streamers ao vivo
  
    // Função para adicionar uma mensagem no chat (pode ser do usuário ou do bot)
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div'); // Cria o container da mensagem
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`; // Define a classe (user ou bot)
  
        const senderDiv = document.createElement('div'); // Cria o elemento para o nome de quem enviou
        senderDiv.className = 'sender';
        senderDiv.textContent = isUser ? 'Você' : 'FURIA Bot'; // Define o nome de acordo com quem enviou
  
        const contentDiv = document.createElement('div'); // Cria o elemento para o conteúdo da mensagem
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content; // Coloca o texto da mensagem com HTML (para links)
  
        // Monta a mensagem no chat
        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(contentDiv);
        
        chatMessages.appendChild(messageDiv); // Adiciona no final da área de chat
        chatMessages.scrollTop = chatMessages.scrollHeight; // Faz o chat rolar automaticamente pra baixo
    }

    // Função para buscar e mostrar os streamers ao vivo
    async function getStreamersLive() {
        try {
            addMessage('Buscando streamers ao vivo...', false);

            const response = await fetch('https://desafiofuria-production.up.railway.app/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: 'streamers ao vivo' })
            });
  
            const data = await response.json();
            const message = data.message;
  
            if (message.includes('ao vivo')) {
                const streamers = message.split(': ')[1].split(', ');
                let streamerLinks = 'Streamers ao vivo:\n';
  
                streamers.forEach(streamer => {
                    streamerLinks += `<a href="https://www.twitch.tv/${streamer}" target="_blank">${streamer}</a><br>`;
                });
  
                addMessage(streamerLinks, false);
            } else {
                addMessage(message, false);
            }
        } catch (error) {
            console.error('Erro ao buscar streamers ao vivo:', error);
            addMessage('Erro ao buscar streamers ao vivo.', false);
        }
    }

    // Evento de clique no botão "Streamers ao Vivo"
    streamersBtn.addEventListener('click', getStreamersLive);
    
    // Configura os eventos:
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
