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

// Rota principal para o chat
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const userMessage = req.body.message;
  const sessionId = req.body.sessionId || 'default';

  if (!chatHistories[sessionId]) {
    chatHistories[sessionId] = [
      {
        role: "user",
        parts: [
          {
            text: 
            `Você é um assistente virtual oficial da FURIA Esports. 
            Seja alegre, brinque com o fã chamando ele de FURIOSO às vezes.
            Você é especialista em esports e pode responder sobre o elenco da FURIA em CS2, LoL, Rocket League, Rainbow Six Siege e outros.
            Sempre responda de forma divertida e traga informações relevantes sobre a FURIA.`
          }
        ]
      }
    ];
  }

  chatHistories[sessionId].push({
    role: "user",
    parts: [{ text: userMessage }]
  });

  try {
    // Verificar se a mensagem contém "streamers ao vivo" para buscar na Twitch
    if (userMessage.toLowerCase().includes('streamers ao vivo')) {
      const streamers = await getStreamersLive();
      res.json({ message: `Os seguintes streamers da FURIA estão ao vivo: ${streamers}` });
    } else {
      // Se não for sobre streamers ao vivo, continua com a lógica do bot Gemini
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
      const requestBody = {
        contents: chatHistories[sessionId],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.9
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      };

      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const botReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
        "Não consegui gerar uma resposta no momento. Pergunte algo sobre o elenco da FURIA!";

      chatHistories[sessionId].push({
        role: "model",
        parts: [{ text: botReply }]
      });

      res.json({ message: botReply });
    }

  } catch (error) {
    console.error('Erro detalhado:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    res.status(500).json({
      message: "Deu ruim aqui no servidor da FURIA, FURIOSO! Tenta de novo em instantes!",
      error: error.message
    });
  }
});

// Função para pegar os streamers ao vivo da FURIA
async function getStreamersLive() {
  try {
    // Passo 1: Obter membros da equipe FURIA
    const teamResp = await axios.get(
      'https://api.twitch.tv/kraken/teams/furia',
      { headers: { 'Client-ID': process.env.TWITCH_CLIENT_ID, 'Accept': 'application/vnd.twitchtv.v5+json' } }
    );
    const members = teamResp.data.users.map(u => u.name);  // são os logins

    if (members.length === 0) {
      return 'Não encontrei membros cadastrados na Team FURIA.';
    }

    // Passo 2: Verificar quais membros estão online
    const params = new URLSearchParams();
    members.forEach(login => params.append('user_login', login));

    const streamsResp = await axios.get(
      'https://api.twitch.tv/helix/streams',
      { 
        headers: { 
          'Client-ID': process.env.TWITCH_CLIENT_ID, 
          'Authorization': `Bearer ${await getTwitchAccessToken()}` 
        },
        params
      }
    );
    const liveStreams = streamsResp.data.data;

    if (liveStreams.length === 0) {
      return 'Nenhum streamer da Team FURIA está ao vivo no momento.';
    }

    return liveStreams.map(s => s.user_login).join(', ');

  } catch (error) {
    console.error('Erro ao buscar streamers ao vivo:', error);
    return 'Erro ao buscar streamers da FURIA.';
  }
}

// Função para obter o token de acesso da Twitch
async function getTwitchAccessToken() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Erro ao obter o token de acesso da Twitch:', error);
    throw error;
  }
}

// Rota para resetar o histórico de uma sessão específica
app.post('/api/reset', (req, res) => {
  const sessionId = req.body.sessionId || 'default';
  delete chatHistories[sessionId];
  res.json({ message: 'Sessão resetada com sucesso.' });
});

// Inicia o servidor escutando na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
