document.addEventListener('DOMContentLoaded', function() {
    // Pega os elementos do DOM que vamos manipular
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const streamersBtn = document.getElementById('streamers-btn');

    // Função para adicionar mensagem no chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

        const senderDiv = document.createElement('div');
        senderDiv.className = 'sender';
        senderDiv.textContent = isUser ? 'Você' : 'FURIA Bot';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content; // aceita HTML para links

        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Envia mensagem ao backend e retorna resposta
    async function processMessage(msg) {
        // indicador typing
        const typing = document.createElement('div');
        typing.className = 'message bot typing';
        typing.innerHTML = ` 
          <div class="sender">FURIA Bot</div>
          <div class="message-content">
            <div class="typing-indicator"><span></span><span></span><span></span></div>
          </div>`;
        chatMessages.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const res = await fetch('https://desafiofuria-production.up.railway.app/api/chat', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message: msg })
            });
            chatMessages.removeChild(typing);
            if (!res.ok) throw new Error('Erro na comunicação');
            const data = await res.json();
            return data.message;
        } catch (e) {
            chatMessages.removeChild(typing);
            console.error(e);
            return 'Desculpe, ocorreu um erro.';
        }
    }

    // Envia mensagem do usuário
    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;
        addMessage(text, true);
        messageInput.value = '';
        const reply = await processMessage(text);
        addMessage(reply, false);
    }

    // Função para buscar e mostrar apenas streamers da Team FURIA ao vivo
    async function getStreamersLive() {
        addMessage('Buscando streamers da Team FURIA ao vivo...', false);
    
        const clientId = process.env.TWITCH_CLIENT_ID; // Insira seu Client ID aqui
        const accessToken = await getTwitchAccessToken(clientId); // Função que vai obter o token de acesso da Twitch
    
        if (!accessToken) {
            console.error("Token de acesso não obtido.");
            addMessage("Erro ao obter token de acesso da Twitch.", false);
            return;
        }
    
        // Lista de streamers da Team FURIA
        const teamFuriaStreamers = ['xarola_']; // Adicione os nomes de streamers aqui
    
        try {
            // Verificar se os streamers estão ao vivo na API Kraken
            const streams = await Promise.all(
                teamFuriaStreamers.map(streamer => {
                    return fetch(`https://api.twitch.tv/kraken/streams/${streamer}`, {
                        method: 'GET',
                        headers: {
                            'Client-ID': clientId,
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                    .then(res => {
                        console.log(`Status da requisição para ${streamer}: ${res.status}`);  // Log do status da requisição
                        if (!res.ok) {
                            throw new Error(`Erro ao buscar dados para o streamer ${streamer}: ${res.statusText}`);
                        }
                        return res.json();
                    })
                    .then(data => {
                        return { streamer, data };
                    })
                    .catch(err => {
                        console.error(`Erro ao buscar dados de ${streamer}:`, err);
                        return { streamer, error: err.message }; // Retorna erro para o streamer
                    });
                })
            );
    
            let message = '';
            streams.forEach(({ streamer, data, error }) => {
                if (error) {
                    message += `Erro ao buscar dados de ${streamer}: ${error}<br>`;
                } else if (data.stream) {
                    message += `${streamer} está ao vivo jogando ${data.stream.game} - ${data.stream.channel.status}: <a href="https://twitch.tv/${streamer}" target="_blank">${streamer}</a><br>`;
                }
            });
    
            if (!message) {
                message = 'Nenhum streamer da Team FURIA está ao vivo no momento.';
            }
    
            addMessage(message, false);
        } catch (err) {
            console.error("Erro geral:", err);
            addMessage('Erro ao buscar streamers da Team FURIA.', false);
        }
    }
    
    
    // Função para obter o token de acesso da Twitch (Client Credentials)
    async function getTwitchAccessToken(clientId) {
        const clientSecret = process.env.TWITCH_CLIENT_SECRET; // Insira seu Client Secret aqui
        try {
            const resp = await fetch('https://id.twitch.tv/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'client_credentials'
                })
            });
            const data = await resp.json();
            return data.access_token;
        } catch (error) {
            console.error('Erro ao obter o token da Twitch:', error);
            throw new Error('Falha na autenticação com a Twitch');
        }
    }

    // Evento do botão para mostrar streamers ao vivo
    streamersBtn.addEventListener('click', getStreamersLive);

    // Eventos
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
});
