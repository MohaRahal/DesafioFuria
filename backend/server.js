// Importa as bibliotecas necessárias
const express = require('express');
const cors = require('cors');

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
            text: `Você é um assistente virtual oficial da FURIA Esports.
                  Seja alegre, brinque com o fã chamando ele de FURIOSO às vezes.
                  Você é especialista em esports e pode responder sobre o elenco da FURIA em CS2, LoL, Rocket League, Rainbow Six Siege e outros.
                  Sempre responda de forma divertida e traga informações relevantes sobre a FURIA.`
          }
        ]
      }
    ];
  }

  // Adiciona a mensagem do usuário ao histórico
  chatHistories[sessionId].push({ role: 'user', parts: [{ text: userMessage }] });

  try {
    // Faz uma requisição para a API do Gemini com o histórico de mensagens
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
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH'
        }
      ]
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

  // Remove o histórico da sessão especificada
  delete chatHistories[sessionId];

  res.json({ message: 'Sessão resetada com sucesso.' });
});

// Inicia o servidor escutando na porta especificada
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
