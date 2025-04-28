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

// Array fixo de logins oficiais da Team FURIA (manutenção mínima)
const TEAM_MEMBERS = [
  'xarola_',
  'mwzera',
  'paulanobre',
  'ivdmaluco',
  'furiatv',
  // Adicione aqui outros logins oficiais da equipe
];

// Rota principal para o chat
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const userMessage = req.body.message;
  const sessionId = req.body.sessionId || 'default';

  // Inicializa o histórico de chat se não existir para a sessão
  if (!chatHistories[sessionId]) {
    chatHistories[sessionId] = [
      {
        role: 'user',
        parts: [
          {
            text: `Você é um assistente virtual oficial da FURIA Esports.\n` +
                  `Seja alegre, brinque com o fã chamando ele de FURIOSO às vezes.\n` +
                  `Você é especialista em esports e pode responder sobre o elenco da FURIA em CS2, LoL, Rocket League, Rainbow Six Siege e outros.\n` +
                  `Sempre responda de forma divertida e traga informações relevantes sobre a FURIA.`
          }
        ]
      }
    ];
  }

  // Adiciona a mensagem do usuário ao histórico
  chatHistories[sessionId].push({ role: 'user', parts: [{ text: userMessage }] });

  try {
    // Verifica se a mensagem contém "streamers ao vivo"
    if (userMessage.toLowerCase().includes('streamers ao vivo')) {
      const streamers = await getStreamersLive();
      res.json({ message: `Os seguintes streamers da Team FURIA estão ao vivo: ${streamers}` });
    } else {
      // Lógica padrão do bot Gemini
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
      const requestBody = {
        contents: chatHistories[sessionId],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500, topP: 0.9 },
        safetySettings: [{ category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' }]
      };

      const response = await axios.post(apiUrl, requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });

      const botReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Não consegui gerar uma resposta no momento. Pergunte algo sobre o elenco da FURIA!';

      chatHistories[sessionId].push({ role: 'model', parts: [{ text: botReply }] });
      res.json({ message: botReply });
    }

  } catch (error) {
    console.error('Erro detalhado:', error.response?.data || error.message);
    res.status(500).json({ message: 'Erro interno no servidor da FURIA.', error: error.message });
  }
});

// Função para obter o token de acesso da Twitch (Client Credentials)
async function getTwitchAccessToken() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  try {
    const resp = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: { 
        client_id: clientId, 
        client_secret: clientSecret, 
        grant_type: 'client_credentials' 
      }
    });
    return resp.data.access_token;
  } catch (error) {
    console.error('Erro ao obter token de acesso da Twitch:', error.message);
    throw new Error('Falha na autenticação com a Twitch');
  }
}

// Função para pegar os streamers ao vivo da Team FURIA usando TEAM_MEMBERS
async function getStreamersLive() {
  try {
    // Verifica se o login foi fornecido
    if (!streamerLogin) {
      return 'Por favor, forneça um nome de streamer.';
    }

    // Obter token de acesso
    const token = await getTwitchAccessToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    // Fazer requisição à API da Twitch para verificar o streamer específico
    const streamsResp = await axios.get('https://api.twitch.tv/helix/streams', {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`
      },
      params: { 'user_login': streamerLogin }
    });

    const live = streamsResp.data.data;

    // Verificar se o streamer está ao vivo
    if (live.length > 0) {
      const stream = live[0];
      return `${stream.user_name} está ao vivo jogando ${stream.game_name}: https://twitch.tv/${stream.user_login}`;
    } else {
      return `${streamerLogin} não está ao vivo no momento.`;
    }

  } catch (err) {
    console.error('Erro ao buscar status do streamer:', err);
    return 'Erro ao buscar status do streamer. Tente novamente mais tarde.';
  }
}

// Rota para resetar o histórico de uma sessão específica
app.post('/api/reset', (req, res) => {
  const sessionId = req.body.sessionId || 'default';
  delete chatHistories[sessionId];
  res.json({ message: 'Sessão resetada com sucesso.' });
});

// Inicia o servidor escutando na porta especificada
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
