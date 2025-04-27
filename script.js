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
        try {
            const res = await fetch('https://desafiofuria-production.up.railway.app/api/chat', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message: 'streamers ao vivo' })
            });
            const data = await res.json();
            let message = data.message;

            // Extrai nomes
            let names = [];
            if (message.includes(':')) {
                names = message.split(':')[1].split(',').map(n => n.trim());
            }
            // Filtra apenas logins que contenham 'furia'
            const furiaOnly = names.filter(n => n.toLowerCase().includes('furia'));

            if (furiaOnly.length) {
                const links = furiaOnly.map(n => `<a href=\"https://twitch.tv/${n}\" target=\"_blank\">${n}</a>`).join(', ');
                addMessage(`Streamers da Team FURIA ao vivo: ${links}`, false);
            } else {
                addMessage('Nenhum streamer da Team FURIA está ao vivo no momento.', false);
            }
        } catch (err) {
            console.error(err);
            addMessage('Erro ao buscar streamers da Team FURIA.', false);
        }
    }

    // Eventos
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
    streamersBtn.addEventListener('click', getStreamersLive);
});
