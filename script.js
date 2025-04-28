document.addEventListener('DOMContentLoaded', function() {
    // Pega os elementos do DOM que vamos manipular
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const streamersBtn = document.getElementById('streamers-btn');
    const chatBtn = document.getElementById('chat-btn');
    const liveStreamersContainer = document.getElementById('live-streamers-container');
    const streamersList = document.getElementById('streamers-list');
    const chatContainer = document.querySelector('.chat-container');

    // Configurações da API da Twitch
    const TWITCH_CLIENT_ID = 'irqrpftbthlz0yh483m8908gqk9cxo';
    const TWITCH_CLIENT_SECRET = 'mq19phdohb2hj5jvgnwokec5qechdk';

    // Lista de streamers da FURIA que queremos monitorar
    const FURIA_STREAMERS = [
        'mount', 'Vaxlon', 'IVDmaluco', 'FURIAtv', 'gabssf', 'yuurih', 'kaah', 'guerri',
        'izaa', 'paulanobre', 'daaygamer_', 'yanxnz_', 'MaestroPierre', 'MurilloMelloBR',
        'raf1nhafps', 'sofiaespanha', 'oManelzin_', 'mwzera', 'Dezorganizada', 'gafallen',
        'siddecs','Jxmo','OsukaXD','havocfps1','noooobzim','losttrl','ImMadness','kheyze7',
        'herdszz','igoorctg','XAROLA_','brino','crisguedes','chelok1ng','desire18k','lossvir',
        '1Aboveee','skzvlr1','drufinhorl','ayulol1'
    ];

    // Função que adiciona uma nova mensagem no chat (do usuário ou do bot)
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

        const senderDiv = document.createElement('div');
        senderDiv.className = 'sender';
        senderDiv.textContent = isUser ? 'Você' : 'FURIA Bot';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content; // Permite HTML para links

        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Função que envia a mensagem para o backend e retorna a resposta do bot
    async function processMessage(msg) {
        // Mostra indicador de "digitando..."
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });
            chatMessages.removeChild(typing); // Remove indicador ao receber resposta

            if (!res.ok) throw new Error('Erro na comunicação');
            const data = await res.json();
            return data.message;
        } catch (e) {
            chatMessages.removeChild(typing);
            console.error(e);
            return 'Desculpe, ocorreu um erro.';
        }
    }

    // Função que trata o envio da mensagem pelo usuário
    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;
        addMessage(text, true);      // Adiciona a mensagem do usuário no chat
        messageInput.value = '';     // Limpa o input
        const reply = await processMessage(text); // Envia para o backend e pega a resposta
        addMessage(reply, false);    // Adiciona a resposta do bot no chat
    }

    // Evento de clique no botão de enviar mensagem
    sendButton.addEventListener('click', sendMessage);

    // Evento de pressionar Enter no campo de mensagem
    messageInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });

    // Evento de clique no botão "Streamers Ao Vivo"
    streamersBtn.addEventListener('click', function() {
        if (liveStreamersContainer.style.display === 'none') {
            liveStreamersContainer.style.display = 'block'; // Mostra lista de streamers
            chatContainer.style.display = 'none';           // Esconde o chat
            checkLiveStreamers();                           // Verifica quem está ao vivo
        } else {
            liveStreamersContainer.style.display = 'none';
            chatContainer.style.display = 'flex';
        }
    });

    // Evento de clique no botão "Chat"
    chatBtn.addEventListener('click', function() {
        chatContainer.style.display = 'flex';          // Mostra o chat
        liveStreamersContainer.style.display = 'none'; // Esconde os streamers
    });

    // Função que obtém o token de acesso da Twitch
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

    // Função que verifica quais streamers da FURIA estão ao vivo
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
            displayLiveStreamers(data.data); // Exibe os streamers ao vivo

        } catch (error) {
            console.error('Erro ao verificar streamers ao vivo:', error);
            streamersList.innerHTML = '<p>Erro ao buscar informações dos streamers. Tente novamente mais tarde.</p>';
        }
    }

    // Função que exibe os streamers que estão ao vivo
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

        // Cria um card para cada streamer ao vivo
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
