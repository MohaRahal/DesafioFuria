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

// Define a rota principal para o chat
app.post('/api/chat', async (req, res) => {
  // Chave da API do Google Gemini
  const apiKey = process.env.GEMINI_API_KEY;

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

  // Adiciona a nova mensagem do usuário ao histórico da sessão
  chatHistories[sessionId].push({
    role: "user",
    parts: [{ text: userMessage }]
  });

  try {
    // URL da API do Gemini com a chave de API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;

    // Corpo da requisição que será enviado para o Gemini
    const requestBody = {
      contents: chatHistories[sessionId], // Histórico de mensagens
      generationConfig: {
        temperature: 0.7, // Grau de criatividade da resposta
        maxOutputTokens: 500, // Quantidade máxima de tokens (palavras/frases)
        topP: 0.9 // Controle de diversidade das respostas
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_ONLY_HIGH" // Bloqueia apenas assédio grave
        }
      ]
    };

    // Faz a requisição POST para o Gemini
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extrai a resposta do bot da resposta recebida
    const botReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
      "Não consegui gerar uma resposta no momento. Pergunte algo sobre o elenco da FURIA!";

    // Adiciona a resposta do bot no histórico da sessão
    chatHistories[sessionId].push({
      role: "model",
      parts: [{ text: botReply }]
    });

    // Retorna a resposta do bot para o front-end
    res.json({ message: botReply });

  } catch (error) {
    // Se houver erro, loga informações detalhadas no console
    console.error('Erro detalhado:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Retorna erro amigável para o front-end
    res.status(500).json({
      message: "Deu ruim aqui no servidor da FURIA, FURIOSO! Tenta de novo em instantes!",
      error: error.message
    });
  }
});

// Variáveis para armazenar as credenciais e o token da Twitch
let twitchAccessToken = null;
let twitchTokenExpiry = null;

// Função para obter ou renovar o token da Twitch
async function getTwitchAccessToken() {
  // Verifica se o token ainda é válido
  if (twitchAccessToken && twitchTokenExpiry > Date.now()) {
    return twitchAccessToken;
  }

  try {
    // Credenciais da Twitch (idealmente armazenadas como variáveis de ambiente)
    const clientId = irqrpftbthlz0yh483m8908gqk9cxo;
    const clientSecret = mq19phdohb2hj5jvgnwokec5qechdk;

    if (!clientId || !clientSecret) {
      throw new Error('Credenciais da Twitch não configuradas');
    }

    // Faz a requisição para obter o token
    const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`);
    
    twitchAccessToken = response.data.access_token;
    // Define a expiração do token (normalmente 60 dias, mas vamos usar um valor conservador)
    twitchTokenExpiry = Date.now() + (response.data.expires_in * 1000) - 300000; // 5 minutos antes de expirar

    return twitchAccessToken;
  } catch (error) {
    console.error('Erro ao obter token da Twitch:', error.message);
    throw new Error('Não foi possível autenticar com a Twitch');
  }
}

// Nova rota para buscar streamers da FURIA que estão ao vivo
app.get('/api/furia-streamers', async (req, res) => {
  try {
    // Obtém o token de acesso da Twitch
    const accessToken = await getTwitchAccessToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    // Primeiro, busca informações sobre o time FURIA
    const teamResponse = await axios.get('https://api.twitch.tv/helix/teams?name=furia', {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Verifica se há dados do time
    if (!teamResponse.data.data || teamResponse.data.data.length === 0) {
      return res.json({ streamers: [] });
    }

    const teamData = teamResponse.data.data[0];
    
    // Extrai os IDs dos usuários do time
    const userIds = teamData.users.map(user => user.user_id);
    
    // Obtém informações sobre quais streamers estão ao vivo
    const streamsQuery = userIds.map(id => `user_id=${id}`).join('&');
    const streamsResponse = await axios.get(`https://api.twitch.tv/helix/streams?${streamsQuery}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Se não houver streamers online, retorna array vazio
    if (!streamsResponse.data.data || streamsResponse.data.data.length === 0) {
      return res.json({ streamers: [] });
    }

    // Coleta os IDs dos usuários que estão streamando para buscar mais informações
    const liveUserIds = streamsResponse.data.data.map(stream => stream.user_id);
    const usersQuery = liveUserIds.map(id => `id=${id}`).join('&');
    
    // Busca informações detalhadas dos usuários
    const usersResponse = await axios.get(`https://api.twitch.tv/helix/users?${usersQuery}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Combina as informações das streams com os detalhes dos usuários
    const liveStreams = streamsResponse.data.data;
    const usersData = usersResponse.data.data;

    // Cria um mapa de IDs para facilitar a busca
    const usersMap = {};
    usersData.forEach(user => {
      usersMap[user.id] = user;
    });

    // Formata os dados para enviar ao frontend
    const streamers = liveStreams.map(stream => {
      const user = usersMap[stream.user_id] || {};
      
      return {
        id: stream.user_id,
        login: stream.user_login,
        username: stream.user_name,
        displayName: user.display_name || stream.user_name,
        profileImage: user.profile_image_url,
        title: stream.title,
        gameName: stream.game_name,
        viewerCount: stream.viewer_count,
        startedAt: stream.started_at,
        thumbnailUrl: stream.thumbnail_url
          .replace('{width}', '320')
          .replace('{height}', '180')
      };
    });

    res.json({ streamers });
  } catch (error) {
    console.error('Erro ao buscar streamers da FURIA:', error);
    res.status(500).json({ 
      error: 'Não foi possível obter informações dos streamers',
      message: error.message
    });
  }
});

// Rota para servir o frontend
app.use(express.static('public'));

// Inicia o servidor escutando na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});