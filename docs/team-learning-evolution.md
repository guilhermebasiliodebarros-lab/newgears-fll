# Evolução funcional — NEW GEARS FLL

Implementação local de 30/10/2026. As alterações anteriores do Giro e do redesign foram preservadas. Nenhum commit, push, deploy, migração, alteração de conta ou gravação em produção foi feito.

## 1. Funcionalidades melhoradas

| Área | Resultado desta etapa |
| --- | --- |
| Dashboard | Metas sugeridas de colaboração com tarefas compartilhadas e participação nos relatórios da semana. Os indicadores usam os dados já carregados. |
| Avaliações | Atalho para abrir o próximo aluno pendente; seleção das notas anunciada por acessibilidade; opção de usar notas anteriores como rascunho, sem salvar automaticamente nem copiar comentários de outra semana. |
| Diário | Formulário auxiliar para testes, código, problema/solução, estratégia e projeto. Insere texto estruturado no rascunho existente, com validação de acertos/tentativas e próximo passo. |
| Relatórios | Índice por semana calculada pela data, atalhos “Semana atual” e “Minha autoria”, exportação CSV dos metadados filtrados. Filtros e indicador de não lidos anteriores foram preservados. |
| Exportações | CSV compartilhado com proteção contra fórmulas em nomes/comentários; aplicado também ao relatório de prontidão já existente, preservando seus cálculos. |
| Rubricas | Orientação para separar acompanhamento interno, documentos oficiais e Robot Game; acesso aos materiais oficiais e ao roteiro de juízes da temporada identificada. |
| Giro | Apresenta a simulação e lê a pergunta usando a voz já existente, sem chamada adicional à IA. |
| Backup | O endpoint de backup privado do técnico inclui a nova coleção de observações. Não foi acrescentada leitura direta dessa coleção pelo navegador. |

XP, ranking e conquistas não receberam novas fórmulas, descontos ou recompensas automáticas. Kanban, tarefas, eventos, calendário, projetos, PitStop, modo TV e administração foram considerados nos fluxos existentes; foram mantidos os recursos que já atendiam ao pedido, evitando criar versões paralelas.

## 2. Novas funcionalidades

### Simulador de juízes

Caminho: **Estratégia → Treino com juízes → Simulação cronometrada**.

- Categorias: Projeto de Inovação, Design do Robô, Core Values, Robot Game e combinação das áreas.
- Participação individual ou coletiva, com escolha dos participantes reais.
- Sorteio sem repetir perguntas na mesma sessão; uma, três ou cinco perguntas.
- Meta de tempo por resposta configurável, cronômetro com pausa/retomada e leitura pelo Giro.
- Consulta opcional à orientação existente, marcada no resultado.
- Autoavaliação interna da resposta e registro do aprendizado ou próximo passo.
- Conclusão completa ou encerramento com as respostas já registradas.
- Histórico de até 50 simulações neste navegador, separado por conta e temporada; resumo em TXT ou cópia para o diário/relatório.

O histórico guarda pergunta, tempo, autoavaliação, consulta à orientação e próximo passo. Não grava a fala nem áudio. O treino em andamento fica nesta aba; a interface informa que ele não é recuperado ao fechar ou trocar de página. Há proteção de saída pelo navegador durante a sessão. Se o armazenamento falhar, o resultado permanece na aba com aviso para exportar, sem afirmar que foi persistido.

As perguntas já existentes foram extraídas para um módulo reutilizável. As novas perguntas de Robot Game são claramente **reflexões internas de treino**, sem regras ou pontuações oficiais inventadas. A meta do cronômetro também é interna e não encerra automaticamente a fala.

### Registro rápido de engenharia

Caminho: **Diário → Registro rápido de engenharia**.

Campos: tipo, data, responsáveis, objetivo, configuração/versão/saída, problema ou hipótese, alteração aplicada, resultado, acertos, tentativas, pontuação observada e próximo passo.

Objetivo, resultado e próximo passo são obrigatórios. Acertos e tentativas devem ser preenchidos juntos, com acertos menores ou iguais às tentativas. A consistência exibida descreve somente aquele teste, sem prever o torneio. Pontos são informações fornecidas pelo usuário e precisam ser conferidos no manual da temporada.

O modelo é inserido no rascunho com hashtags compatíveis com a busca atual. Inserir o mesmo modelo novamente não duplica o texto. A publicação continua pelo botão habitual e pela transação de rascunho existente. Não foi criado banco paralelo ou novo sistema de recompensa.

Os campos auxiliares são temporários; a interface informa que somente o texto inserido no rascunho é recuperado após atualizar. O rascunho final mantém a recuperação já existente.

### Acompanhamento privado do técnico

Caminho: **Avaliações → Acompanhamento privado**.

Código e interface implementados e testados localmente, **desativados por padrão no servidor** até a validação das permissões em produção.

O técnico pode registrar oito dimensões: participação, comprometimento, comunicação, responsabilidade, trabalho em equipe, desenvolvimento técnico, preparação para apresentações e cumprimento de tarefas. A escala interna distingue “Não observado”, “Com apoio”, “Em prática” e “Com autonomia”. Não observado não entra no gráfico como uma nota zero.

Inclui ponto forte, próximo passo individual, anotação privada, histórico por integrante/temporada, gráfico por dimensão, tabela acessível e exportação dos registros carregados. As observações são registros novos, preservando o histórico. Não alteram XP, ranking, convocação ou os feedbacks compartilhados com o aluno.

Proteções implementadas:

- Autenticação e papel de técnico verificados na API existente de relatórios. O papel enviado pelo navegador não concede acesso.
- Estudantes são rejeitados antes de qualquer leitura privada, tanto em GET quanto em POST.
- Coleção separada, `coachObservations`, sem leitura/gravação direta pelo cliente nas regras preparadas.
- Nenhum texto privado salvo no localStorage, enviado ao Giro, incluído no modo TV ou acrescentado ao feedback público do aluno.
- Identidade do avaliador e nome do aluno definidos no servidor; campos desconhecidos são descartados.
- Identificador de envio estável para repetir uma tentativa sem criar outra observação.
- Transação Firestore confere o cadastro e a temporada, impedindo o envio se eles mudarem durante a operação. Não sobrescreve um registro de histórico.
- Histórico paginado em blocos de 100. O CSV informa que exporta os registros carregados.

O preenchimento privado não enviado fica somente em memória. A interface distingue esse comportamento dos rascunhos das avaliações compartilhadas. Ao sair, atualizar ou mudar de temporada, um preenchimento privado não salvo pode ser perdido; não há cache local de notas confidenciais.

## 3. Ativação privada pendente — exige autorização para produção

1. Concluir o acesso autenticado dos técnicos, mantendo o plano de [migração de autenticação existente](auth-migration.md).
2. Revisar as regras reais do Firestore e excluir `coachObservations` de **toda regra ampla de permissão**. Um bloco com `allow false` não anula outro bloco que permita a mesma operação.
3. Publicar e testar essas regras com contas de técnico, aluno e usuário sem autenticação. O arquivo do repositório é um conjunto de regras para integração, não prova das regras implantadas.
4. Somente depois definir `COACHING_PRIVATE_ENABLED=true` no runtime Cloudflare e publicar o código aprovado. Essa variável não usa prefixo `VITE_`.

Nada disso foi executado em produção. O módulo mostra a pendência e não grava observações enquanto estiver desabilitado. O login legado continua funcionando nas áreas anteriores, mas não é aceito como autorização para dados privados novos.

## 4. Melhorias para a FLL

O banco existente foi confrontado com o [roteiro oficial de juízes BIOGLOW 2026–27](https://firstinspires.blob.core.windows.net/fll/challenge/2026-27/fll-challenge-bioglow-judging-session-script-questions.pdf). As perguntas são adaptações de treino; não representam garantia do que será perguntado. O painel também aponta para os [materiais oficiais da temporada](https://www.firstinspires.org/resources/library/fll/season-materials).

Os arquivos locais examinados não incluíam os PDFs completos das rubricas oficiais. A biblioteca de produção não foi consultada. Por isso, não foram inventados critérios oficiais nem substituídas as escalas existentes por outra supostamente oficial. As novas escalas de observação e autoavaliação são identificadas como internas.

O Robot Game é tratado como estratégia, medição e consistência de treino; as regras e pontos precisam vir dos documentos aplicáveis. As sugestões de evidência relacionam Core Values, projeto, design, testes e comunicação, sem transformar essas sugestões em exigências oficiais.

## 5. Benefícios para técnico e estudantes

Para o técnico: localizar avaliações pendentes, aproveitar notas anteriores como ponto de partida, registrar observações rápidas, consultar evolução individual e exportar índices sem abrir documento por documento.

Para os alunos: treinar perguntas com tempo, participar da resposta coletiva, ouvir o Giro, registrar descobertas com estrutura e recuperar o texto do diário. As metas do dashboard incentivam o trabalho em dupla e o compartilhamento do aprendizado, sem uma nova competição por pontos.

## 6. Arquivos desta etapa

Criados:

- `src/components/JudgeTrainingSession.jsx`
- `src/components/EngineeringEntryComposer.jsx`
- `src/components/CoachingPanel.jsx`
- `src/components/TeamLearningGoals.jsx`
- `src/components/TeamLearning.css`
- `src/utils/judgeQuestions.js`
- `src/utils/judgeTraining.js`
- `src/utils/engineeringNotebook.js`
- `src/utils/coaching.js`
- `src/utils/learningProgress.js`
- `src/utils/teamExport.js`
- `server/reports/coaching.js`
- `test/learningFeatures.test.js`
- `test/coaching.test.js`
- Este relatório e quatro capturas em `docs/learning-evolution/`.

Editados:

- `src/App.jsx`: metas nos dois dashboards, mantendo as alterações anteriores.
- `src/views/JudgePracticeView.jsx`: reutilização do banco e integração da simulação.
- `src/views/LogbookView.jsx`: formulário auxiliar, inserção sem duplicata e quebra de textos longos.
- `src/views/FinalSprintEvaluationsView.jsx`: atalhos, estados acessíveis e área privada separada.
- `src/views/WeeklyReportsView.jsx`: índice, atalhos e exportação filtrada.
- `src/components/RubricView.jsx`: documentos e orientação de evidências.
- `src/services/weeklyReports.js`: chamadas autenticadas do novo módulo.
- `server/reports/api.js`: roteamento protegido e inclusão das observações no backup privado.
- `server/reports/firebase.js`: suporte aos endereços REST de operações como `documents:commit`, sem alterar os endereços de documentos existentes.
- `firestore.weekly-reports.rules`: bloqueio de acesso direto à nova coleção, ainda não publicado.
- `.env.example`: variável de ativação documentada e desativada.
- `test/run-tests.js`: registro das duas novas suítes.

Os arquivos do Giro já alterados no diretório pertencem à etapa anterior e foram preservados.

## 7. Validação

- `npm test`: **36 suítes aprovadas**. As duas novas cobrem simulador, validação de resultados, isolamento do histórico, falha de armazenamento, diário, colaboração, datas, CSV, autenticação privada, papel de aluno, ativação, idempotência, temporada, cadastro inativo, paginação, transação e rollback.
- `npm run lint`: aprovado. Permanece a nota informativa do Babel sobre o tamanho preexistente de `App.jsx`.
- `npm run build:pages`: frontend e worker gerados. Permanece o aviso de chunk PDF grande já existente.
- Navegador: simulação individual, cronômetro, pausa, orientação consultada, registro, download e histórico após recarregar; modo coletivo também conferido no layout.
- Diário: validação de acertos, inserção no rascunho, recuperação após atualizar e publicação pelo fluxo de transação existente em memória.
- Privacidade: módulo desabilitado não oferece salvamento; falha de API mantém o preenchimento; tentativa explícita salva; aluno não monta a área privada nem solicita seus endpoints; o texto privado não entra no localStorage.
- Relatórios: semana por data, autoria, semana atual e exportação apenas de metadados visíveis, sem arquivo, chave, nota privada ou URL de download.
- Responsividade/acessibilidade: seis cenários novos em 320, 390, 768 e 1440 px, total de 24 combinações sem overflow horizontal. axe-core 4.14.0 não reportou violações automáticas nos seis cenários. Algumas verificações de contraste e tabela vazia ficaram inconclusivas; isso não certifica conformidade WCAG.
- Regressões: repetidos os testes de avaliações, recuperação de falhas, preservação de rascunhos, backup, inicialização com Auth, Giro com armazenamento bloqueado, retry do PitStop, modais, vitrine e modo TV interno/público. Aprovados.
- Preview do build: login móvel sem erro JavaScript, carregamento adiado preservado e recuperação após falha do chunk inicial. Aprovado.
- `git diff --check`: sem erros de espaços em branco.

Os testes de navegador usaram Playwright/Edge, respostas de API simuladas e dados fictícios. As gravações foram em memória. Os roteiros e logs adicionais estão no diretório local ignorado `giro-preview.local/`; os testes de domínio e servidor permanecem em `test/`.

As operações REST foram conferidas na documentação de [consultas estruturadas](https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery), [transações](https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/beginTransaction) e [commit](https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/commit). Não foi executado emulador Firestore nem uma transação contra o banco real.

Capturas com dados fictícios:

- [Metas colaborativas](learning-evolution/metas-colaborativas.png).
- [Simulação com o Giro](learning-evolution/simulador-juizes.png).
- [Registro rápido de engenharia](learning-evolution/diario-engenharia.png).
- [Bloqueio de ativação privada](learning-evolution/privacidade-ativacao.png).

## 8. Vinte e quatro ideias adicionais

Estas propostas não são apresentadas como implementadas. Antes de desenvolver, conferir novamente o módulo correspondente para aproveitar suas funções atuais.

| # | Ideia adicional | Benefício / próximo módulo | Porte |
| --- | --- | --- | --- |
| 1 | Pauta de treino com objetivo, responsáveis e critério de conclusão | Ligar agenda e tarefas para iniciar o encontro com um plano curto | Médio |
| 2 | Matriz de testes por condição de bateria, piso e garra | Comparar consistência em condições controladas no módulo Robô | Médio |
| 3 | Comparação A/B de duas configurações | Evitar concluir que uma mudança melhorou com base em uma tentativa | Médio |
| 4 | Checklist imprimível de preparação da mesa e PitStop | Apoiar os operadores quando estiverem longe do computador | Pequeno |
| 5 | Inventário de peças, ferramentas e itens em manutenção | Evitar perder treino procurando material ou usando peça defeituosa | Médio |
| 6 | Dependências entre tarefas, com prevenção de ciclos | Mostrar o que está bloqueando uma entrega no Kanban | Médio |
| 7 | Modelos recorrentes de tarefas semanais | Reduzir recadastro, preservando aprovação e recompensas idempotentes | Médio |
| 8 | Retificação de observação privada com trilha de auditoria | Corrigir um registro sem apagar o histórico | Médio |
| 9 | Meta individual privada com data de revisão e evidência | Transformar o próximo passo em um acompanhamento verificável | Médio |
| 10 | Comentários moderados em relatórios | Permitir colaboração com permissões e regras de publicação definidas | Médio |
| 11 | Curadoria de portfólio individual de evidências | Reunir contribuições escolhidas pelo aluno e validadas pelo técnico | Grande |
| 12 | Trilha de entrada para integrantes novos | Explicar ferramenta, rotina, pesquisa e segurança sem depender de memória oral | Médio |
| 13 | Validação dos exemplos de código por ambiente/versão | Distinguir SPIKE App e Pybricks; execução real exige ambiente isolado | Grande |
| 14 | Restauração de backup com prévia das diferenças | Conferir o impacto antes de qualquer alteração no banco | Grande |
| 15 | Comparação de temporadas com indicadores compatíveis | Mostrar evolução sem misturar escalas e critérios de anos diferentes | Médio |
| 16 | QR Code interno para uma configuração de robô | Levar da etiqueta da garra/robô ao registro técnico correto | Pequeno |
| 17 | Lista de falhas recorrentes com hipótese e contramedida | Reaproveitar o aprendizado dos testes e do diário | Médio |
| 18 | Anotações sobre fotos de evidência com referências aos registros | Explicar o detalhe observado sem multiplicar arquivos pesados | Médio |
| 19 | Registro de atualização dos manuais oficiais | Identificar versão, temporada e revisão usada nas decisões da equipe | Médio |
| 20 | Histórico de duplas e oportunidades de participação | Apoiar o rodízio sem criar ranking de popularidade | Médio |
| 21 | Testes de navegador integrados à CI | Detectar regressões de avaliação, teclado e salvamento antes de publicar | Médio |
| 22 | Confirmação de presença nos próximos eventos | Separar intenção de participar da presença efetivamente registrada | Médio |
| 23 | Fila editável de aprendizados aprovados para o modo TV | Compartilhar conquistas coletivas sem expor notas privadas | Médio |
| 24 | Matriz de riscos do torneio com responsáveis e plano alternativo | Preparar solução para falhas de energia, equipamento ou apresentação | Médio |

As propostas 1, 4, 16 e 17 são candidatas a uma próxima entrega curta. Sincronizar simulações entre computadores, publicar comentários ou restaurar backups exige definir permissões e comportamento de conflitos antes de alterar produção.

## 9. Próxima etapa e limitações

O acompanhamento privado precisa da ativação segura descrita acima. A simulação salva seu histórico neste navegador, sem sincronização entre computadores. Os campos auxiliares de engenharia precisam ser inseridos no rascunho para serem recuperáveis.

Não foram testados dispositivos físicos, hardware LEGO, microfone real, envio real de e-mail ou respostas reais da NVIDIA. Nenhum material oficial em produção foi lido. Não houve benchmark de FPS/carga; os novos indicadores reaproveitam dados e não criam listeners de Firestore.

Nenhuma dependência foi adicionada. Não foi introduzido Firebase Storage nem um novo serviço pago. O módulo privado usa o Firebase/Cloudflare existentes e, quando ativado, continuará sujeito às cotas e políticas desses serviços.

Não se conclui que todo problema possível da plataforma foi eliminado. Esta entrega tem testes locais e limitações explícitas; a publicação e a verificação das regras reais continuam dependendo de aprovação específica.
