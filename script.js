document.addEventListener('DOMContentLoaded', function() {
    // ------- Elementos para abas de chat e streamers -------
    const chatTab = document.getElementById('chat-tab');
    const streamersTab = document.getElementById('streamers-tab');
    const chatContent = document.getElementById('chat-content');
    const streamersContent = document.getElementById('streamers-content');
    const streamersContainer = document.getElementById('streamers-container');
    const loadingElement = document.getElementById('streamers-loading');
    let streamersLoaded = false;
  
    // ------- Elementos para o chat -------
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const quickActions = document.querySelectorAll('.action-button');  // Caso utilize ações rápidas
  
    // Função para alternar entre abas
    function switchTab(tab) {
      document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
      document.querySelectorAll('.content-container').forEach(content => content.classList.remove('active'));
      tab.classList.add('active');
      if (tab === chatTab) {
        chatContent.classList.add('active');
      } else if (tab === streamersTab) {
        streamersContent.classList.add('active');
        if (!streamersLoaded) {
          loadStreamers();
          streamersLoaded = true;
        }
      }
    }
  
    // Evento de clique nas abas
    chatTab.addEventListener('click', () => switchTab(chatTab));
    streamersTab.addEventListener('click', () => switchTab(streamersTab));
  
    // Função para formatar número de espectadores
    function formatViewerCount(count) {
      if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
      if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
      return count;
    }
  
    // Carrega streamers via API
    async function loadStreamers() {
      try {
        loadingElement.style.display = 'block';
        streamersContainer.innerHTML = '';
  
        const response = await fetch('/api/furia-streamers');
        if (!response.ok) throw new Error('Falha ao buscar os streamers');
        const data = await response.json();
  
        loadingElement.style.display = 'none';
        if (!data.streamers || data.streamers.length === 0) {
          streamersContainer.innerHTML = '<div class="no-streamers">Nenhum streamer da FURIA está ao vivo no momento.</div>';
          return;
        }
  
        data.streamers.forEach(streamer => {
          const card = document.createElement('div');
          card.className = 'streamer-card';
          const viewers = formatViewerCount(streamer.viewerCount);
          card.innerHTML = `
            <div class="thumbnail-container">
              <img src="${streamer.thumbnailUrl}" alt="${streamer.displayName}" class="thumbnail">
              <div class="live-indicator">LIVE</div>
              <div class="viewers">${viewers} espectadores</div>
            </div>
            <div class="streamer-info">
              <div class="streamer-name">
                <img src="${streamer.profileImage}" alt="" class="streamer-avatar">
                ${streamer.displayName}
              </div>
              <div class="stream-title">${streamer.title}</div>
              <div class="game-name">${streamer.gameName}</div>
            </div>
          `;
          card.addEventListener('click', () => window.open(`https://twitch.tv/${streamer.login}`, '_blank'));
          streamersContainer.appendChild(card);
        });
  
      } catch (err) {
        console.error('Erro ao carregar streamers:', err);
        loadingElement.style.display = 'none';
        streamersContainer.innerHTML = '<div class="no-streamers">Não foi possível carregar os streamers. Tente novamente mais tarde.</div>';
      }
    }
  
    // Função para adicionar mensagem no chat
    function addMessage(content, isUser = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `message ${isUser ? 'user' : 'bot'}`;
      msgDiv.innerHTML = `
        <div class="sender">${isUser ? 'Você' : 'FURIA Bot'}</div>
        <div class="message-content">${content}</div>
      `;
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  
    // Envia mensagem ao backend e retorna resposta
    async function processMessage(msg) {
      try {
        const typing = document.createElement('div');
        typing.className = 'message bot typing';
        typing.innerHTML = `
          <div class="sender">FURIA Bot</div>
          <div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>
        `;
        chatMessages.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;
  
        const res = await fetch('https://desafiofuria-production.up.railway.app/api/chat', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ message: msg })
        });
  
        chatMessages.removeChild(typing);
        if (!res.ok) throw new Error('Erro na comunicação');
        const data = await res.json();
        return data.message;
      } catch (e) {
        console.error('Erro processMessage:', e);
        return 'Desculpe, tive um problema ao processar sua mensagem.';
      }
    }
  
    // Lê input e envia mensagem
    async function sendMessage() {
      const text = messageInput.value.trim();
      if (!text) return;
      addMessage(text, true);
      messageInput.value = '';
      const reply = await processMessage(text);
      addMessage(reply, false);
    }
  
    // Eventos de chat
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  
  });
  