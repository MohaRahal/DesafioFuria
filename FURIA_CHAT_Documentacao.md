
Desafio Fúria - Aplicativo de Chat Interativo

Descrição

O Desafio Fúria é um aplicativo de chat interativo desenvolvido para proporcionar uma experiência de comunicação envolvente, com integração de informações em tempo real, bate-papo com funcionalidades de digitação e streamers ao vivo. O design segue a paleta de cores da Fúria, uma organização de eSports, proporcionando uma interface visualmente atraente e funcional.

Funcionalidades

1. Chat Interativo
- Mensagens de Usuário e Bot: O aplicativo permite a troca de mensagens entre o usuário e um chatbot. As mensagens são visualizadas em balões com diferentes estilos para diferenciar quem enviou.
- Indicador de Digitação: Sempre que o bot está "digitando", um indicador de animação é exibido, com três pontos se movendo de forma contínua.

2. Sidebar de Navegação
- Menu Lateral: O menu lateral apresenta links de navegação para outras funcionalidades e conteúdo, como "Streamers Ao Vivo".
- Estilo Responsivo: O menu lateral desaparece na versão móvel para uma navegação mais amigável, dando foco à área de conteúdo.

3. Streamers Ao Vivo
- Grid de Streamers: Apresenta uma lista de streamers ao vivo em uma interface baseada em grid. Cada streamer tem uma imagem de miniatura e um banner indicando que está ao vivo.
- Botões de Ação: Cada card de streamer possui um botão de ação para o usuário assistir à transmissão ao vivo.

4. Design Visual
- Cores Personalizadas: O aplicativo segue uma paleta de cores inspirada na Fúria (preto, branco e cinza escuro).
- Imagens de Fundo: O fundo do chat contém um GIF animado de baixa opacidade para não interferir na legibilidade.

5. Interface de Usuário
- Layout Limpo e Intuitivo: A interface é projetada para ser simples e intuitiva. No desktop, os botões de navegação são exibidos na barra lateral, enquanto no mobile, a interface se adapta para otimizar a experiência de uso.

Tecnologias Utilizadas

- HTML5: Estrutura da página e conteúdo.
- CSS3: Estilos e layouts responsivos.
  - Flexbox: Para layouts flexíveis.
  - Grid: Para a exibição dos streamers em formato de grid.
  - Animações CSS: Para o efeito de digitação e hover nos cards.
- JavaScript: Para interações dinâmicas.
- Git: Controle de versão para gerenciamento de alterações e colaboração no código.
- GitHub: Repositório remoto para hospedagem e controle do código.

Como Rodar o Projeto Localmente

Pré-requisitos
- Node.js (se precisar de algum backend)
- Editor de Código (como VS Code)

Passos para Execução

1. Clonar o repositório:
   git clone https://github.com/MohaRahal/DesafioFuria.git

2. Navegar para o diretório do projeto:
   cd DesafioFuria

3. Abrir o arquivo index.html no seu navegador.

4. Personalizar o conteúdo e testar as funcionalidades conforme necessário.

Responsividade

O layout foi otimizado para funcionar em telas de diferentes tamanhos, com uma versão de desktop e uma versão mobile (abaixo de 768px). O menu lateral é ocultado em telas pequenas para proporcionar uma navegação mais limpa e acessível.

Responsividade:
- Desktop: Menu lateral com opções de navegação.
- Mobile: Menu lateral oculto e navegação baseada no conteúdo principal.

Personalização

Alterar o Fundo
Você pode personalizar o fundo do chat facilmente modificando o valor da propriedade CSS background na classe .chat-bg:

.chat-bg {
  background: url('novo-link-da-imagem.gif') center/cover;
}

Alterar as Cores
As cores podem ser alteradas alterando as variáveis CSS dentro da :root:

:root {
  --furia-black: #000;
  --furia-white: #fff;
  --furia-dark-gray: #222;
  --furia-light-gray: #f2f2f2;
}

Melhorias Futuras

- Integração com APIs de Streaming: Para mostrar dados ao vivo de streamers de plataformas como Twitch ou YouTube.
- Autenticação de Usuário: Implementar sistema de login e registro para personalizar a experiência.
- Notificações: Notificar usuários sobre novos streams ou mensagens importantes.

Contribuições

Contribuições são bem-vindas! Para contribuir com o projeto, siga os seguintes passos:

1. Faça um fork deste repositório.
2. Crie uma nova branch para a sua feature (git checkout -b minha-feature).
3. Faça commit das suas alterações (git commit -am 'Adicionando nova funcionalidade').
4. Envie para o seu fork (git push origin minha-feature).
5. Abra um pull request.

Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para mais detalhes.
