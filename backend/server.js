// Importa as bibliotecas necessárias
const express = require('express');
const cors = require('cors');

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

  // Aqui seria onde você chamaria o Gemini para responder (por enquanto é resposta genérica)
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
