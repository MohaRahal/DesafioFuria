// Espera o carregamento completo da página antes de rodar o script
document.addEventListener('DOMContentLoaded', function() {
    
    // Pega os elementos do DOM (HTML) que vamos manipular
    const chatMessages = document.getElementById('chat-messages'); // Área onde aparecem as mensagens
    const messageInput = document.getElementById('message-input'); // Campo de digitar a mensagem
    const sendButton = document.getElementById('send-button');     // Botão de enviar mensagem
    const quickActions = document.querySelectorAll('.action-button'); // Botões de ação rápida (não usados nesse trecho)
  
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
  
    // Função para enviar a mensagem para o servidor e receber a resposta
    async function processMessage(message) {
        try {
            // Mostra um indicador de "digitando... do bot"
            // Isso é só uma animação, não tem interação com o servidor
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message bot typing';
            typingIndicator.innerHTML = `
                <div class="sender">FURIA Bot</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>`;
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
  
            // Faz uma requisição POST para o backend (no servidor local)
            const response = await fetch('https://desafiofuria-production.up.railway.app/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }) // Envia a mensagem no formato JSON
            });
  
            // Remove o indicador de "digitando..." após receber a resposta
            chatMessages.removeChild(typingIndicator);
  
            // Se a resposta não for OK (erro no servidor)
            if (!response.ok) {
                throw new Error('Erro na comunicação com o servidor');
            }
  
            const data = await response.json(); // Pega o conteúdo da resposta
            return data.message; // Retorna a mensagem recebida do servidor
  
        } catch (error) {
            // Caso dê erro na comunicação
            console.error('Erro:', error);
            return 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente mais tarde.';
        }
    }
  
    // Função para pegar a mensagem digitada e enviar
    async function sendMessage() {
        const message = messageInput.value.trim(); // Remove espaços antes e depois do texto
        if (message) {
            addMessage(message, true); // Adiciona a mensagem do usuário no chat
            messageInput.value = '';    // Limpa o campo de entrada
  
            const response = await processMessage(message); // Processa a mensagem com o backend
            addMessage(response); // Mostra a resposta do FURIA Bot no chat
        }
    }
  
    // Função para buscar e mostrar os streamers ao vivo
    async function getStreamersLive() {
        try {
            // Mostra um indicador de "digitando..." do bot
            addMessage('Buscando streamers ao vivo...', false);
  
            // Faz uma requisição para o servidor para pegar os streamers ao vivo
            const response = await fetch('https://desafiofuria-production.up.railway.app/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: 'streamers ao vivo' })
            });
  
            const data = await response.json();
            const message = data.message;
  
            // Se houver streamers ao vivo, monta os links
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
    document.getElementById('streamers-btn').addEventListener('click', getStreamersLive);
  
    // Configura os eventos:
    // Quando clicar no botão "enviar"
    sendButton.addEventListener('click', sendMessage);
    
    // Quando pressionar a tecla "Enter" dentro do campo de mensagem
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
  
  });
  