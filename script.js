async function processMessage(message) {
    try {
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
  
      const response = await fetch('https://desafiofuria-production.up.railway.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });
  
      chatMessages.removeChild(typingIndicator);
  
      if (!response.ok) {
        throw new Error('Erro na comunicação com o servidor');
      }
  
      const data = await response.json();
  
      // Se a resposta for sobre streamers ao vivo
      if (data.message.includes("streamers da FURIA")) {
        addMessage(data.message); // Exibe a lista de streamers ao vivo
      } else {
        addMessage(data.message); // Exibe a resposta normal do bot
      }
  
    } catch (error) {
      console.error('Erro:', error);
      addMessage('Desculpe, tive um problema ao processar sua mensagem. Tente novamente mais tarde.');
    }
  }
  