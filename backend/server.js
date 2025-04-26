// Importa as bibliotecas necessárias
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Cria uma instância do aplicativo Express
const app = express();

// Define a porta que o servidor vai usar
const port = process.env.PORT || 3000;

// Permite que o servidor aceite requisições de outros domínios (CORS)
app.use(cors());

// Faz o servidor entender dados no formato JSON
app.use(express.json());

// Objeto para armazenar o histórico de mensagens para cada sessão
const chatHistories = {}; // { sessionId: [mensagens anteriores] }

// URL da API HLTV
const hltvApiUrl = 'https://hltv-api.vercel.app/api';
const teamId = 8297; // ID da FURIA no HLTV

// Função para pegar os jogadores da FURIA
const getFuriaLineUp = async () => {
  try {
    // Endpoint para pegar informações sobre os jogadores do time
    const response = await axios.get(`${hltvApiUrl}/team/${teamId}/players.json`);
    
    // Processar a resposta para obter os nomes dos jogadores
    const players = response.data.players.map(player => player.name);
    
    return `A line-up atual da FURIA é: ${players.join(', ')}`;
  } catch (error) {
    console.error('Erro ao consultar a line-up da FURIA:', error.message);
    return "Não consegui pegar a line-up da FURIA agora, FURIOSO! Tente novamente mais tarde.";
  }
};

// Define a rota principal para o chat
app.post('/api/chat', async (req, res) => {
  // Recupera a mensagem enviada pelo usuário
  const userMessage = req.body.message;

  // Recupera ou define um sessionId padrão
  const sessionId = req.body.sessionId || 'default';

  // Se for a primeira vez da sessão, inicia o histórico com um prompt inicial
  if (!chatHistories[sessionId]) {
    chatHistories[sessionId] = [
      {
        role: "user",
        parts: [
          {
            text: `Você é um assistente virtual oficial da FURIA Esports. 
            Seja alegre, brinque com o fã chamando ele de FURIOSO às vezes.
            Seja direto também sem mensagens longas.
            Você é especialista em esports e pode responder sobre o elenco da FURIA em CS2, LoL, Rocket League, Rainbow Six Siege e outros.
            Sempre responda de forma divertida e traga informações relevantes sobre a FURIA.`
          }
        ]
      }];
  }

  // Identifica a consulta que o usuário quer fazer sobre a line-up ou jogadores
  if (
    userMessage.toLowerCase().includes("line-up") || 
    userMessage.toLowerCase().includes("jogadores") || 
    userMessage.toLowerCase().includes("escalação") || 
    userMessage.toLowerCase().includes("elenco")
  ) {
    try {
      // Chama a função que pega a line-up da FURIA
      const result = await getFuriaLineUp();

      // Adiciona a resposta no histórico
      chatHistories[sessionId].push({
        role: "model",
        parts: [{ text: result }]
      });

      // Retorna a resposta com os jogadores
      return res.json({ message: result });
    } catch (error) {
      return res.status(500).json({
        message: "Deu ruim aqui no servidor da FURIA, FURIOSO! Tente de novo em instantes!",
        error: error.message
      });
    }
  }

  // Caso contrário, pode usar o Gemini ou outro sistema de respostas
  res.json({ message: "Não entendi muito bem, FURIOSO! Pergunte sobre a FURIA!" });
});

// (Opcional) Rota para resetar o histórico de uma sessão específica
app.post('/api/reset', (req, res) => {
  const sessionId = req.body.sessionId || 'default';
  delete chatHistories[sessionId]; // Deleta o histórico da sessão
  res.json({ message: 'Sessão resetada com sucesso.' });
});

// Inicia o servidor escutando na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
