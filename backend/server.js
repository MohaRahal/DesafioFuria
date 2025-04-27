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

// Inicia o servidor escutando na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

