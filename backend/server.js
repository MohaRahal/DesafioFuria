const { exec } = require('child_process');

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  const sessionId = req.body.sessionId || 'default';

  if (!chatHistories[sessionId]) {
    chatHistories[sessionId] = [{
      role: "user",
      parts: [{
        text: `Você é um assistente virtual oficial da FURIA Esports. Seja alegre, brinque com o fã chamando ele de FURIOSO às vezes.`
      }]
    }];
  }

  if (userMessage.toLowerCase().includes("line-up") || 
      userMessage.toLowerCase().includes("jogadores") || 
      userMessage.toLowerCase().includes("escalação") || 
      userMessage.toLowerCase().includes("elenco")) {
    exec('python3 get_lineup.py', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.json({ message: "Erro ao consultar a line-up da FURIA!" });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.json({ message: "Erro ao consultar a line-up da FURIA!" });
      }

      const result = JSON.parse(stdout);
      const players = result.lineup ? result.lineup.join(', ') : 'Erro ao pegar a line-up!';
      chatHistories[sessionId].push({
        role: "model",
        parts: [{ text: `A line-up atual da FURIA é: ${players}` }]
      });

      res.json({ message: `A line-up atual da FURIA é: ${players}` });
    });
  } else {
    res.json({ message: "Não entendi muito bem, FURIOSO! Pergunte sobre a FURIA!" });
  }
});
