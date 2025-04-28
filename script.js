document.addEventListener('DOMContentLoaded', function() {
    // Pega os elementos do DOM que vamos manipular
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const streamersBtn = document.getElementById('streamers-btn');
    const chatBtn = document.getElementById('chat-btn'); // Novo botão do Chat
    const liveStreamersContainer = document.getElementById('live-streamers-container');
    const streamersList = document.getElementById('streamers-list');
    const chatContainer = document.querySelector('.chat-container');

    // Configurações da Twitch API
    const TWITCH_CLIENT_ID = 'irqrpftbthlz0yh483m8908gqk9cxo'; // Substitua pelo seu Client ID
    const TWITCH_CLIENT_SECRET = 'mq19phdohb2hj5jvgnwokec5qechdk'; // Substitua pelo seu Client Secret

    // Lista de streamers da FURIA que você deseja monitorar
    const FURIA_STREAMERS = [
        'mount', 'Vaxlon', 'IVDmaluco', 'FURIAtv', 'gabssf', 'yuurih', 'kaah', 'guerri',
        'izaa', 'paulanobre', 'daaygamer_', 'yanxnz_', 'MaestroPierre', 'MurilloMelloBR',
        'raf1nhafps', 'sofiaespanha', 'oManelzin_', 'mwzera', 'Dezorganizada', 'gafallen',
    ];
    chatButton.addEventListener('click', () => {
        chatContainer.style.display = 'flex';
        streamersContainer.style.display = 'none';
        
        chatButton.classList.add('active');
        streamersButton.classList.remove('active');
      });
    
      streamersButton.addEventListener('click', () => {
        chatContainer.style.display = 'none';
        streamersContainer.style.display = 'block';
        
        streamersButton.classList.add('active');
        chatButton.classList.remove('active');
      });

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
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
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

    // Eventos de envio de mensagem
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });

    // ===== INTEGRAÇÃO COM API DA TWITCH =====

    // Botão Streamers Ao Vivo
    streamersBtn.addEventListener('click', function() {
        if (liveStreamersContainer.style.display === 'none') {
            liveStreamersContainer.style.display = 'block';
            chatContainer.style.display = 'none';
            checkLiveStreamers();
        } else {
            liveStreamersContainer.style.display = 'none';
            chatContainer.style.display = 'flex';
        }
    });

    // Novo: Botão Chat
    chatBtn.addEventListener('click', function() {
        chatContainer.style.display = 'flex';          // Mostra o chat
        liveStreamersContainer.style.display = 'none'; // Esconde os streamers
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
        streamersList.innerHTML = '<p>Carregando streamers...</p>';

        try {
            const accessToken = await getTwitchAccessToken();
            if (!accessToken) {
                streamersList.innerHTML = '<p>Erro ao conectar com a Twitch. Tente novamente mais tarde.</p>';
                return;
            }

            const userLogins = FURIA_STREAMERS.map(streamer => `user_login=${streamer}`).join('&');

            const response = await fetch(`https://api.twitch.tv/helix/streams?${userLogins}`, {
                headers: {
                    'Client-ID': TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            displayLiveStreamers(data.data);

        } catch (error) {
            console.error('Erro ao verificar streamers ao vivo:', error);
            streamersList.innerHTML = '<p>Erro ao buscar informações dos streamers. Tente novamente mais tarde.</p>';
        }
    }

    // Função para exibir os streamers ao vivo
    function displayLiveStreamers(liveStreams) {
        streamersList.innerHTML = '';

        if (liveStreams.length === 0) {
            streamersList.innerHTML = '<p>Nenhum streamer da FURIA está ao vivo no momento.</p>';
            return;
        }

        const streamersHeader = document.createElement('h2');
        streamersHeader.textContent = 'Streamers ao vivo:';
        streamersList.appendChild(streamersHeader);

        const streamersGrid = document.createElement('div');
        streamersGrid.className = 'streamers-grid';

        liveStreams.forEach(stream => {
            const streamerCard = document.createElement('div');
            streamerCard.className = 'streamer-card';

            const thumbnail = stream.thumbnail_url
                .replace('{width}', '320')
                .replace('{height}', '180');

            streamerCard.innerHTML = `
                <div class="streamer-thumbnail">
                    <img src="${thumbnail}" alt="${stream.user_name} stream thumbnail">
                    <div class="live-badge">AO VIVO</div>
                </div>
                <div class="streamer-info">
                    <h3>${stream.user_name}</h3>
                    <p>${stream.title}</p>
                    <p>${stream.viewer_count} espectadores</p>
                    <a href="https://twitch.tv/${stream.user_login}" target="_blank" class="watch-button">Assistir</a>
                </div>
            `;

            streamersGrid.appendChild(streamerCard);
        });

        streamersList.appendChild(streamersGrid);
    }
});
