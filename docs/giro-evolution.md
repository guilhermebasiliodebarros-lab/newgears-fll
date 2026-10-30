# Evolução do Giro — implementação e validação

30/10/2026. Trabalho local, sem commit, push, deploy, migração ou alteração de dados de produção.

## O que foi preservado

O Giro continua sendo a engrenagem original desenhada em SVG. Foram mantidos cores, contorno, profundidade simulada, olhos, membros, acessórios combináveis, loja, oficina, evolução, recompensas, voz, biblioteca e integração NVIDIA.

A inspeção encontrou animações existentes de piscar, olhar, dançar, pular, girar, falar e comemorar. A evolução usa essas partes e acrescenta novos gestos e estados. Não foi instalado pacote de animação nem introduzido outro serviço de IA.

Capturas com os componentes reais e dados fictícios:

- [Expressões do Giro](giro-evolution/giro-expressoes.png).
- [Dicas no celular](giro-evolution/giro-dicas-celular.png).
- [Giro pensando no chat](giro-evolution/giro-pensando.png).

## Animações e expressões

| Estado | Comportamento implementado |
| --- | --- |
| Repouso | Respiração discreta, cabeça acompanhando o olhar e animações existentes dos olhos e membros. |
| Boas-vindas | Aceno de três ciclos e pequeno movimento da cabeça; a saudação termina sem abrir uma janela automaticamente. |
| Clique/toque | Reação breve de alegria e movimento. Um toque anterior deixa de prevalecer quando começa um estado de maior prioridade. |
| Pensativo | Cabeça inclinada, olhar de concentração, braço aproximado do rosto e balão com três pontos. Usado durante a resposta da IA e confirmação de recompensas. |
| Curioso e surpreso | Mantidos os olhos assimétricos, sobrancelha e sinais de interrogação/exclamação existentes. |
| Empolgado | Sorriso, estrela e três pequenos impulsos; usado para uma conquista nova e respostas recebidas no chat. |
| Ajudando | Gesto de apontar e movimento curto da cabeça ao abrir as dicas. |
| Comemorando | Reações locais a XP e tarefas; danças, salto, giro e comemorações da loja continuam disponíveis. |
| Falando | Preservada a animação da boca ligada à leitura em voz alta existente. Não há sincronização por fonemas. |

A cabeça foi organizada em um grupo SVG que também acompanha os acessórios. As preferências de expressão salvas na oficina continuam sendo respeitadas. Os estados pensativo e empolgado são estados de execução; não exigem mudar o formato salvo da oficina ou publicar novas regras no Firestore.

## Interações com os dados da equipe

- O Giro observa os dados que a interface já recebeu. Não cria consultas adicionais nem concede XP ou Gears.
- Detecta aumento de XP, conquista adicionada e tarefa conhecida que passou para `done`.
- Um carregamento inicial, uma tarefa antiga recém-carregada ou uma atualização idêntica não conta como nova realização.
- No perfil do aluno, tarefas com identificadores são filtradas pelo ID; alunos com o mesmo nome não são confundidos. Registros legados que só possuem autor por nome continuam dependendo dessa identificação disponível.
- Mudanças simultâneas podem gerar uma mensagem conjunta. Há intervalo mínimo de 12 segundos entre novas reações locais, sem fila de notificações antigas; a mensagem permanece por 6,5 segundos.
- Reações locais novas são suprimidas enquanto a aba está oculta, um modal está aberto ou o modo tranquilo está ativo. Não há roubo de foco.
- Foi corrigida também a comemoração indevida de XP no primeiro carregamento: a identidade parcial retornada pelo login não é mais interpretada como um saldo inicial de zero antes do cadastro completo chegar.

As recompensas e mensagens preexistentes do sistema continuam funcionando. Esses sinais visuais não substituem as transações e permissões dos serviços de XP/Gears.

## Personalidade e dicas sem IA

O botão do Giro apresenta uma dica da área aberta, com “Outra dica” e acesso à função correspondente. O chat também oferece “Dicas sem IA” e “Preparar uma pergunta”. Preparar uma pergunta só preenche o campo; não envia uma chamada.

Os temas incluem tarefas e evidências, diário, relatórios, próximos eventos registrados, projeto de inovação, testes do robô, ré no simulador, feedback, rubricas, ensaio para juízes e preparação da equipe. A rotação é acionada pelo usuário; não há notificações periódicas de dicas.

As mensagens usam somente fatos disponíveis, como contagem de tarefas próprias, próximo evento e indicador interno de preparação. Dicas de FLL são orientações gerais de trabalho, sem inventar regras, pontos ou prazos oficiais. A informação local não é apresentada como uma resposta gerada pela IA.

## Chat e integração existente

Problemas corrigidos:

1. **Cancelar podia reenviar a pergunta.** Na troca do botão de cancelar para enviar, o mesmo clique podia acionar o formulário. O cancelamento agora impede a ação padrão. A regressão de navegador verifica a quantidade de chamadas e o descarte de uma resposta tardia.
2. **Espera sem limite no cliente.** O transporte agora limita a consulta de estado a 12 segundos e a conversa a 100 segundos. O limite cobre obtenção do token, requisição e leitura do corpo. Rascunho e anexos permanecem disponíveis para nova tentativa.
3. **Resposta malformada podia derrubar a conversa.** O cliente valida o texto e as fontes, limita os campos aceitos e mostra um erro recuperável, preservando a pergunta.
4. **Limite de uso pouco claro.** Respostas HTTP 429 agora geram uma espera visível baseada em `Retry-After`, limitada a 120 segundos no cliente. Durante a espera, as dicas locais permanecem disponíveis. O limite do servidor continua sendo a proteção efetiva.
5. **Novas respostas interrompiam a leitura do histórico.** O chat mantém a posição de quem está lendo mensagens anteriores e oferece “Ir para a última mensagem”.

O cabeçalho mostra o Giro pensando, ajudando diante de um erro e reagindo a uma resposta. Erros oferecem nova tentativa explícita. Nenhuma pergunta é reenviada automaticamente. Fotos continuam sendo preparadas e enviadas na solicitação visual; a prévia só é removida após sucesso. A interface existente de áudio e transcrição foi preservada.

## Segurança e consumo

Foram examinados `server/giro/ai.js`, `server/giro/nvidia.js` e `functions/api/giro-ai/[[path]].js`. A função Cloudflare continua encaminhando à integração NVIDIA existente. As regras de autenticação, validação de corpo/imagens/referências, proteção de origem, limite por usuário e tempo limite do provedor foram preservados; não foram alteradas nesta etapa.

O contexto local de XP, conquistas e tarefas é separado do `aiContext`. Não é incluído nas solicitações da IA. O resumo técnico continua passando pelo filtro existente. Chaves permanecem no servidor; nenhuma credencial foi incluída neste relatório, nas capturas ou nas novas fixtures.

As dicas e gestos locais não consomem a API. O novo transporte mantém o Bearer token existente e rejeita URLs inseguras nas fontes. A validação das fontes aceita somente os campos esperados. Os testes de segurança e integração da suíte anterior também passaram.

Não houve chamada real à NVIDIA durante a validação. Nenhuma afirmação de funcionamento da conta, créditos ou modelo em produção é feita com base nos testes simulados. O Giro não é treinado automaticamente por essas dicas ou conversas; a revisão da biblioteca pelo técnico permanece no fluxo existente.

## Acessibilidade e desempenho

- Preferência “Modo tranquilo” salva por conta/temporada neste navegador, com fallback quando o armazenamento está bloqueado. O widget fica estático e não abre reações automáticas; o chat e as comemorações manuais também respeitam essa preferência.
- `prefers-reduced-motion` prevalece inclusive nas danças acionadas pelo usuário. Foi removida a exceção antiga que reativava essas animações.
- Confetes de XP também deixam de ser criados com movimento reduzido. Comemorações tranquilas não criam as partículas decorativas.
- Um `IntersectionObserver` compartilhado pausa os Giros fora da tela. Um ouvinte compartilhado da visibilidade da página pausa as animações quando a aba está oculta. Não há loop JavaScript para cada quadro.
- Movimento por CSS/SVG, sem imagens de substituição ou dependências novas. Rotação e profundidade existentes foram preservadas.
- Controles de teclado, Escape, foco de retorno, rótulos e mensagens acessíveis verificados. Texto auxiliar do chat ficou maior; textarea móvel usa 16 px.

As decisões de cancelamento e movimento reduzido seguem os mecanismos documentados de [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) e [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

## Arquivos

| Arquivo | Alteração |
| --- | --- |
| `src/App.jsx` | Contexto local e navegação do Giro; proteção contra comemoração no carregamento parcial; confetes respeitando movimento reduzido. |
| `src/components/GearExperienceProvider.jsx` | Disponibiliza o contexto local separado do contexto da IA. |
| `src/components/GearMascot.jsx` | Grupo da cabeça, estados pensativo/empolgado, prioridade das reações e pausa fora da tela. |
| `src/components/GearCompanion.jsx` | Dicas, atalhos, reações locais e modo tranquilo. |
| `src/components/GiroLife.css` | Novo conjunto de movimentos e apresentação dos recursos locais. |
| `src/components/GearExperience.css` | Remove a exceção de movimento reduzido. |
| `src/components/GearCelebration.jsx` | Respeita modo tranquilo/movimento reduzido e evita partículas nesses estados. |
| `src/components/GiroAIChat.jsx` e `GiroAIChat.css` | Novos estados, dicas locais, cancelamento, nova tentativa, posição de leitura e ajustes móveis. |
| `src/hooks/useGiroLife.js` | Observa diferenças dos registros, controla duração/intervalo e salva a preferência local. |
| `src/hooks/useGiroMotion.js` | Visibilidade e observador compartilhados para os SVGs. |
| `src/hooks/useReducedMotion.js` | Preferência do sistema acompanhada em tempo real. |
| `src/hooks/useGiroAI.js` | Cancelamento, estado de conexão e espera após limite de uso. |
| `src/services/giroAI.js` | Usa o transporte com limite de tempo e validação. |
| `src/utils/giroTransport.js` | Novo transporte testável, cancelamento e validação das respostas. |
| `src/utils/giroCompanion.js` | Seleção de dicas e diferenças de progresso, sem gravações. |
| `src/utils/gearWorkshop.js` | Mapeamento dos novos estados sem mudar as opções persistidas. |
| `test/giroCompanion.test.js` e `test/giroTransport.test.js` | Duas novas suítes de regressão. |
| `test/run-tests.js` | Registra as novas suítes. |
| `test/browser/giro-interactions.cjs` | Regressão de navegador preservada no projeto. |
| `test/fixtures/giro-interactions.html` e `GiroInteractionHarness.jsx` | Ambiente isolado com os componentes reais e dados fictícios; não é uma entrada do build de produção. |
| `docs/giro-evolution.md` e `docs/giro-evolution/` | Este relatório e três capturas. |

## Testes executados

| Verificação | Resultado |
| --- | --- |
| `npm test` | 34 suítes aprovadas, incluindo as duas novas e as regressões existentes de IA/NVIDIA, loja, acessórios, recompensas e trajetos. |
| `npm run lint` | Aprovado. Permanece a nota informativa do Babel sobre o tamanho de `App.jsx`. |
| `npm run build:pages` | Frontend e worker Cloudflare gerados. Permanece o aviso do chunk PDF grande já existente. |
| Regressão de navegador versionável | Dica sem chamada de IA, tarefa concluída, modo tranquilo, cancelar sem reenviar, resposta tardia, HTTP 429, resposta inválida, nova tentativa, mobile e teclado aprovados. |
| Integração local na aplicação | XP, conquista, tarefa, repetição de snapshots, persistência do modo tranquilo, expressão de clique, movimento reduzido, confetes, personagem fora da tela e aba oculta aprovados. |
| Chat na aplicação | Estado pensativo, erro, cancelamento, envio manual, posição de leitura, espera do limite, resposta inválida e foto enviada à solicitação visual aprovados. |
| IA desativada | Dicas locais funcionam, pergunta pode ser preparada e envio à IA permanece desabilitado. |
| Responsividade | Widget e chat conferidos em 320, 390, 768 e 1440 px, sem overflow horizontal e com controles de envio dentro da tela. |
| Acessibilidade automática | axe-core 4.14.0: widget e chat, para aluno e técnico, após concluir as transições; zero violações automáticas reportadas nos quatro cenários. |
| Acessórios | Repetidos os testes de três acessórios simultâneos, compra, remoção independente e persistência do técnico. Aprovados. |
| Preview do build | Login móvel sem erro JavaScript, carregamentos adiados preservados e recuperação de falha do chunk inicial aprovados. |
| `git diff --check` | Sem erros de espaços em branco. |

O teste de navegador pode ser repetido com `npm run dev` aberto e `node test/browser/giro-interactions.cjs`, usando Playwright instalado. Se estiver em outro diretório, definir `PLAYWRIGHT_MODULE` com o caminho do módulo. `GIRO_TEST_BASE` altera a URL local e `GIRO_BROWSER_CHANNEL` seleciona o navegador. O teste bloqueia HTTPS externo e usa respostas locais simuladas para a API; não acessa uma conta real.

Os roteiros adicionais e logs de inspeção ficaram no diretório local ignorado `giro-preview.local/`. Foram executados com Microsoft Edge headless via Playwright. As gravações dos testes usam somente memória. O build principal mede aproximadamente 483 kB antes de gzip; não houve redução de bundle nesta etapa e não foi executado benchmark de FPS em aparelhos físicos.

## Limites e próximos recursos visuais

Os movimentos usam a vista frontal existente. Perfil completo, costas, caminhada com mudança real de perspectiva, mãos com novos gestos e fala sincronizada por fonemas exigem novos desenhos/camadas ou um conjunto de poses. Eles não foram simulados trocando o Giro por outro personagem. Não foi criado modelo 3D.

Os testes não usaram microfone físico, leitor de tela real nem transcrição completa com download do modelo de voz. O fluxo de áudio foi preservado e suas verificações existentes passaram. Algumas verificações automáticas de contraste e atributos ficaram inconclusivas; isso não é certificação WCAG.

Firebase e NVIDIA foram simulados nos testes de navegador. Não foi validado o envio real ao provedor, a configuração implantada ou o desempenho em celulares físicos. A publicação continua pendente de autorização específica.
