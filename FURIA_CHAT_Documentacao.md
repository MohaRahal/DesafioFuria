# 📄 FURIA FAN Chat - Documentação

## 📌 Visão Geral
O **FURIA FAN Chat** é um chatbot temático da organização FURIA de e-sports. Ele simula uma conversa com fãs, com integração a uma API de IA (como Gemini), além de menus com atalhos úteis para próximos jogos, loja e suporte.

---

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

---

## 🚀 Funcionalidades

- Interface escura personalizada com tema da FURIA
- Assistente virtual com IA via API
- Respostas automáticas baseadas em entrada do usuário
- Ícone de digitação com animação
- Links diretos para:
  - Próximos jogos (HLTV)
  - Loja oficial
  - GitHub do desenvolvedor (para suporte)

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** — Estrutura do site
- **CSS3** — Estilo customizado com variáveis e animações
- **JavaScript (Vanilla)** — Lógica de interação e chamadas à API
- **Node.js** - Servidor que se conecta a API do gemini
- **API IA (ex: Gemini, OpenAI)** — Para geração de respostas

---

## 🧠 Como Funciona

1. Usuário digita a mensagem
2. A função `sendMessage()` adiciona a mensagem ao chat e envia para a função `processMessage()`
3. O `processMessage()` faz um `POST` para a API no servidor local (`http://localhost:3000/api/chat`)
4. A resposta da IA é exibida com um pequeno delay e um indicador de digitação

---

## ⚙️ Requisitos

- Navegador moderno (Chrome, Edge, Firefox, etc.)
- Servidor local rodando na porta 3000 que exponha o endpoint `POST /api/chat`
- API Key válida da IA, configurada no backend (incluida no codigo para testar a page para o processo seletivo)

---

## 📌 To-Do / Melhorias Futuras

- Adicionar autenticação de usuário
- Implementar histórico de mensagens
- Adicionar comandos rápidos (botões)
- Conectar com banco de dados para persistência
- Responsividade para mobile

---

## 👨‍💻 Autor

- Nome: **Mohamed Omar Rahal**
- GitHub: [github.com/MohaRahal](https://github.com/MohaRahal)