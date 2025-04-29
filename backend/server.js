// Importa as bibliotecas necessárias
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio'); // Adicionado para parsear HTML da Liquipedia

// Cria uma instância do aplicativo Express
const app = express();

// Define a porta que o servidor irá usar
const port = process.env.PORT || 3000;

// Permite que o servidor aceite requisições de outros domínios (CORS)
app.use(cors());

// Faz o servidor entender dados no formato JSON
app.use(express.json());

// Objeto para armazenar o histórico de mensagens para cada sessão
const chatHistories = {}; // { sessionId: [mensagens anteriores] }

// Função para obter a lineup da FURIA no CS2 a partir da Liquipedia
async function getFuriaLineupFromLiquipedia() {
  const url = 'https://liquipedia.net/counterstrike/FURIA';

  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(data);
    const lineup = [];

    $('.fo-nttax-infobox .team-members a').each((i, el) => {
      const playerName = $(el).text().trim();
      if (playerName) lineup.push(playerName);
    });

    return lineup;
  } catch (error) {
    console.error('Erro ao buscar lineup:', error.message);
    return null;
  }
}

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

  // Verifica se o usuário está perguntando sobre a lineup ou jogadores
  const keywords = ['line', 'lineup', 'line-up', 'jogadores', 'elenco', 'escalação'];
  const lowerMessage = userMessage.toLowerCase();

  if (keywords.some(k => lowerMessage.includes(k))) {
    const lineup = await getFuriaLineupFromLiquipedia();
    if (lineup && lineup.length > 0) {
      const lineupText = `A lineup atual da FURIA no CS2 é:\n\n${lineup.join(', ')}.`;
      // Injeta essa informação como mensagem anterior no histórico para o Gemini usar como contexto
      chatHistories[sessionId].push({ role: 'model', parts: [{ text: lineupText }] });
    }
  }

  try {
    // Faz uma requisição para a API do Gemini com o histórico de mensagens
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
    const requestBody = {
      contents: chatHistories[sessionId],
      generationConfig: { temperature: 0.7, maxOutputTokens: 500, topP: 0.9 },
      safetySettings: [{ category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' }]
    };

    const response = await axios.post(apiUrl, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Captura a resposta gerada pelo Gemini
    const botReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Não consegui gerar uma resposta no momento. Pergunte algo sobre o elenco da FURIA!';

    // Adiciona a resposta do bot ao histórico
    chatHistories[sessionId].push({ role: 'model', parts: [{ text: botReply }] });

    // Envia a resposta de volta ao cliente
    res.json({ message: botReply });

  } catch (error) {
    console.error('Erro detalhado:', error.response?.data || error.message);
    res.status(500).json({ message: 'Erro interno no servidor da FURIA.', error: error.message });
  }
});

// Rota para resetar o histórico de uma sessão específica
app.post('/api/reset', (req, res) => {
  const sessionId = req.body.sessionId || 'default';
  delete chatHistories[sessionId];
  res.json({ message: 'Sessão resetada com sucesso.' });
});

// Inicia o servidor escutando na porta especificada
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
