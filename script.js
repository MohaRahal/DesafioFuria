document.addEventListener('DOMContentLoaded', function() {
    // Pega os elementos do DOM que vamos manipular
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const streamersBtn = document.getElementById('streamers-btn');
    const liveStreamersContainer = document.getElementById('live-streamers-container');
    const streamersList = document.getElementById('streamers-list');
    const chatContainer = document.querySelector('.chat-container');

    // Configurações da Twitch API
    const TWITCH_CLIENT_ID = 'irqrpftbthlz0yh483m8908gqk9cxo'; // Substitua pelo seu Client ID
    const TWITCH_CLIENT_SECRET = 'mq19phdohb2hj5jvgnwokec5qechdk'; // Substitua pelo seu Client Secret

    // Lista de streamers da FURIA que você deseja monitorar
    const FURIA_STREAMERS = [
        { name: 'guerri', id: '108979370' },
        { name: 'arT', id: '39175521' },
        { name: 'KSCERATO', id: '181441123' },
        { name: 'drop', id: '54310069' },
        { name: 'yuurih', id: '123506188' },
        { name: 'chelo', id: '43423683' },
        { name: 'FURIA', id: '34936487' } // Canal oficial da FURIA
    ];

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

    // Eventos
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

    // ===== INTEGRAÇÃO COM API DA TWITCH =====

    // Event listener para o botão de streamers
    streamersBtn.addEventListener('click', function() {
        // Alterna a visibilidade do container de streamers
        if (liveStreamersContainer.style.display === 'none') {
            liveStreamersContainer.style.display = 'block';
            chatContainer.style.display = 'none';
            checkLiveStreamers();
        } else {
            liveStreamersContainer.style.display = 'none';
            chatContainer.style.display = 'flex';
        }
    });

    // Função para obter o token de acesso da Twitch
    async function getTwitchAccessToken() {
        try {
            const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, {
                method: 'POST'
            });
            
            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Erro ao obter token de acesso da Twitch:', error);
            return null;
        }
    }

    // Função para verificar quais streamers estão ao vivo
    async function checkLiveStreamers() {
        // Mostra mensagem de carregamento
        streamersList.innerHTML = '<p>Carregando streamers...</p>';
        
        try {
            // Obter token de acesso
            const accessToken = await getTwitchAccessToken();
            
            if (!accessToken) {
                streamersList.innerHTML = '<p>Erro ao conectar com a Twitch. Tente novamente mais tarde.</p>';
                return;
            }
            
            // Criar string com IDs de usuário para a query
            const userIds = FURIA_STREAMERS.map(streamer => `user_id=${streamer.id}`).join('&');
            
            // Fazer requisição para a API da Twitch
            const response = await fetch(`https://api.twitch.tv/helix/streams?${userIds}`, {
                headers: {
                    'Client-ID': TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            const data = await response.json();
            
            // Processar os resultados
            displayLiveStreamers(data.data);
            
        } catch (error) {
            console.error('Erro ao verificar streamers ao vivo:', error);
            streamersList.innerHTML = '<p>Erro ao buscar informações dos streamers. Tente novamente mais tarde.</p>';
        }
    }

    // Função para exibir os streamers ao vivo
    function displayLiveStreamers(liveStreams) {
        // Limpar a lista
        streamersList.innerHTML = '';
        
        if (liveStreams.length === 0) {
            streamersList.innerHTML = '<p>Nenhum streamer da FURIA está ao vivo no momento.</p>';
            return;
        }
        
        // Construir a lista de streamers ao vivo
        const streamersHeader = document.createElement('h2');
        streamersHeader.textContent = 'Streamers ao vivo:';
        streamersList.appendChild(streamersHeader);
        
        // Criar um container para os cards de streamers
        const streamersGrid = document.createElement('div');
        streamersGrid.className = 'streamers-grid';
        
        // Adicionar cada streamer ao vivo à lista
        liveStreams.forEach(stream => {
            // Encontrar o nome do streamer a partir do ID
            const streamer = FURIA_STREAMERS.find(s => s.id === stream.user_id);
            const streamerName = streamer ? streamer.name : stream.user_name;
            
            // Criar card para o streamer
            const streamerCard = document.createElement('div');
            streamerCard.className = 'streamer-card';
            
            // Thumbnail da stream
            const thumbnail = stream.thumbnail_url
                .replace('{width}', '320')
                .replace('{height}', '180');
            
            streamerCard.innerHTML = `
                <div class="streamer-thumbnail">
                    <img src="${thumbnail}" alt="${streamerName} stream thumbnail">
                    <div class="live-badge">AO VIVO</div>
                </div>
                <div class="streamer-info">
                    <h3>${streamerName}</h3>
                    <p>${stream.title}</p>
                    <p>${stream.viewer_count} espectadores</p>
                    <a href="https://twitch.tv/${streamerName}" target="_blank" class="watch-button">Assistir</a>
                </div>
            `;
            
            streamersGrid.appendChild(streamerCard);
        });
        
        streamersList.appendChild(streamersGrid);
    }
});