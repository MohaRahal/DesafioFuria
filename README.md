# FURIA Chatbot

Este projeto é um chatbot interativo desenvolvido para fãs da **FURIA Esports**. O bot responde a perguntas sobre o elenco da FURIA nos jogos **CS2**, **LoL**, **Rocket League**, **Rainbow Six Siege**, e outros, utilizando uma **API generativa de linguagem** para criar respostas dinâmicas e personalizadas.

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **API de Geração de Conteúdo**: Google Gemini , Twitch
- **Hospedagem Backend**: Railway
- **Hospedagem Frontend**: Vercel

## Funcionalidades

- Responde a perguntas sobre o elenco da FURIA Esports de forma divertida e engajante.
- Links para Loja oficial da Furia Esports , próximos Jogos , streamers online  e suporte retornando para meu github.
- Mantém o contexto das conversas, utilizando o histórico de mensagens.
- Interage com os fãs de maneira personalizada, chamando-os de "FURIOSO" e trazendo informações relevantes sobre os jogadores.
- Implementa uma API generativa de linguagem para fornecer respostas dinâmicas.

## Links do Projeto
- Página do app: https://desafio-furia.vercel.app/
- Backend rodando : desafiofuria-production.up.railway.app

## 📁 Estrutura de Arquivos

```
DESAFIO-FURIA/
│
├── assets/
│   └── favicon.ico          # Ícone da aba do navegador
│
├── backend/
│   ├── node_modules/         # Módulos instalados pelo npm
│   ├── package-lock.json     # Controle das versões exatas dos módulos
│   ├── package.json          # Informações do projeto backend e dependências
│   └── server.js             # Código do servidor Express
│
├── Index.html               # Página principal do site (HTML)
├── script.js                # Código JavaScript do frontend
└── style.css                # Estilo visual da página (CSS)

```

## Como Rodar o Projeto Localmente

### 1. Clonar o Repositório

Clone o repositório para o seu computador:

```bash
git clone https://github.com/MohaRahal/DesafioFuria.git
cd desafiofuria
```
### 2.Instalar Dependências
```bash
npm install
```

### 3. Mudanças no Código
- Dentro do arquivo script.js
```bash
const response = await fetch('SEULOCALHOSTCOMSEUBACKEND', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message }) // Envia a mensagem no formato JSON
          });
```

- Dentro do arquivo server.js
```bash
const apiKey = SUA_API_KEY;
```

Após isso bastar rodar em seu terminal o comando 
```bash
npm start
```
ou
```bash
cd /backend
node server.js
```
