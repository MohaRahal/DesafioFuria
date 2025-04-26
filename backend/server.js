// Importa as bibliotecas necessárias
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process'); // Para executar o script Python

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

// Função para rodar o script Python e obter a line-up da FURIA
const getFuriaLineup = (callback) => {
  exec('python3 get_furia_lineup.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      callback("Erro ao consultar a line-up da FURIA!");
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      callback("Erro ao consultar a line-up da FURIA!");
      return;
    }

    // Parseia a resposta do Python e a envia de volta
    const result = JSON.parse(stdout);
    if (result.lineup) {
      const players = result.lineup.join(', ');
      callback(`A line-up atual da FURIA é: ${players}`);
    } else {
      callback("Erro ao pegar a line-up!");
    }
  });
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

  // Se a mensagem do usuário inclui "line-up" ou "jogadores", chama a função Python para pegar a line-up da FURIA
  if (
    userMessage.toLowerCase().includes("line-up") || 
    userMessage.toLowerCase().includes("jogadores") || 
    userMessage.toLowerCase().includes("escalação") || 
    userMessage.toLowerCase().includes("elenco")
  ) {
    getFuriaLineup((response) => {
      // Adiciona a resposta ao histórico
      chatHistories[sessionId].push({
        role: "model",
        parts: [{ text: response }]
      });

      // Retorna a resposta para o cliente
      res.json({ message: response });
    });
  } else {
    // Se a mensagem não for sobre a line-up, envia uma resposta padrão
    res.json({ message: "Não entendi muito bem, FURIOSO! Pergunte sobre a FURIA!" });
  }
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
