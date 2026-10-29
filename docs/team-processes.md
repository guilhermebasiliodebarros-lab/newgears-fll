# Processos da equipe

## Planejamento e rodízio

Na aba **Rodízio**, abra **Configurar planejamento da temporada** para escolher data inicial, quantidade de semanas, dias de treino, prazo dos relatórios e papéis dos integrantes. Capitãs e capitães ficam em Gestão; aprendizes alternam Engenharia e Inovação. Alunos fora da escala mantêm a estação atual.

Para férias e pausas, informe uma data de cada semana sem atividade. O calendário pula essas semanas sem avançar o ciclo da distribuição. Os dias de treino configurados também são usados no check-in.

A distribuição exibida é uma prévia. **Aplicar rodízio** atualiza os escalados em uma transação e preserva suas entregas. Uma semana aplicada não pode ser reaplicada. O histórico oferece **Desfazer distribuição**, que só restaura estações se nenhum aluno tiver recebido outra distribuição ou alteração manual depois.

Os cadastros anteriores continuam ativos por padrão. O planejamento legado é convertido para referências por ID ao salvar, mantendo a distribuição conhecida de 2026 como ponto de partida.

## Avaliações e convocação para o torneio

Em **Avaliações → Avaliação semanal**, use **Semana da avaliação** para escolher uma data da semana que deseja preencher ou corrigir. Os botões **Semana anterior**, **Próxima semana** e **Voltar à atual** permitem navegar sem limite de doze semanas. O resumo e as pendências acompanham a semana escolhida; as notas são gravadas por aluno e semana, sem substituir as de outro período. Quando há avaliações pendentes na semana passada, um atalho permite abri-las diretamente.

O **Calendário de avaliações** mostra semanas completas, incompletas e sem avaliação desde o início da temporada, com filtro por mês ou toda a temporada. Cada semana informa os nomes pendentes e pode ser aberta por um clique. As pendências consideram os integrantes ativos que já haviam entrado na equipe no período; semanas de pausa planejadas não geram cobrança. O filtro **Mostrar somente alunos ainda não avaliados** facilita completar o período escolhido.

Notas e feedbacks em preenchimento nas avaliações semanais, de apresentação e dos relatórios são guardados a cada edição no navegador, separados por técnico e temporada. Após atualizar ou fechar a aba, **Rascunhos recuperados → Continuar avaliação** reabre o aluno e o período corretos. **Descartar rascunho** remove apenas o preenchimento local. A nota só é divulgada e entra nos gráficos ao salvar a avaliação; sucesso remove o rascunho enviado, falhas mantêm a escrita, e novas edições feitas durante o envio são preservadas. Se o navegador não permitir gravar rascunhos, a tela informa a falha. Esses rascunhos não sincronizam entre dispositivos e não fazem parte do backup do banco.

Em **Evolução individual**, o técnico escolhe o aluno e consulta os cinco critérios em um gráfico de 0 a 5, com filtro por critério e período, pontuação da última avaliação, variação e tabela acessível. Cada aluno encontra seu próprio gráfico em **Meu feedback**. Somente avaliações semanais completas e com notas válidas entram no gráfico. Semanas sem nota não viram zero; intervalos sem avaliação interrompem as linhas. Com uma única avaliação, não é calculada variação.

Em **Prontidão para o torneio**, o técnico prepara até seis integrantes na coluna **Torneio**. Essa lista fica em `finalSprintTournamentDrafts`, carregada somente no painel técnico. Marcar ou retirar pessoas não altera a convocação oficial. Use **Divulgar convocação**, confira os nomes e selecione **Confirmar divulgação** para atualizar os participantes oficiais de uma vez. A publicação verifica a revisão da lista, a temporada ativa e a situação dos alunos; alterações concorrentes exigem nova conferência. Uma lista vazia permite retirar uma convocação existente após confirmação. Convocações já existentes continuam oficiais até a publicação de uma alteração. O CSV diferencia a lista em preparação da convocação divulgada.

Após a divulgação, cada convocado recebe a mensagem ao entrar em seu painel; quem estiver conectado também recebe a atualização. A mensagem tem confetes e fogos animados pela tela durante oito segundos e pode ser fechada pelo botão ou por Escape. O modo leve usa menos partículas sem desligar a celebração. Quando o dispositivo pede menos movimento, a animação automática fica desativada e o botão **Ativar fogos** permite iniciá-la por escolha do aluno. O botão **Repetir fogos** reinicia os efeitos dentro do pop-up. Um destaque permanente no painel permite rever a convocação. Retirar alguém da convocação oficial remove o destaque, e convocações de outras temporadas não aparecem no ciclo atual.

Para desfazer um teste com um único convocado, desmarque **Na lista** e use **Retirar convocação oficial → Confirmar retirada**. A remoção de uma lista já carregada e a retirada das últimas convocações usam gravações atômicas sem novas leituras, preservando integrantes adicionados por outro técnico. A tela aguarda a confirmação do banco e mantém a mensagem específica de erro quando a alteração é recusada, incluindo cota excedida ou falta de permissão.

## Chamada

A chamada registra Presente, Atraso, Falta ou Falta justificada, com observação. Uma justificativa exige motivo. Atraso conta como presença; falta justificada não entra no denominador do percentual. Os totais de frequência existentes são preservados como base.

Corrigir uma data altera apenas a diferença em relação à chamada anterior, sem adicionar outra aula. Presenças e totais são confirmados juntos; falhas não deixam uma gravação parcial. O resumo por período mostra presenças, atrasos, faltas e justificativas registrados nas sessões do ciclo atual.

## Tarefas

Autoria original e participantes passam a ser campos separados. A autoria permanece quando alguém entra, sai ou assume a tarefa. Nomes antigos são interpretados de forma compatível ao atualizar um registro legado.

Ao enviar para revisão, o aluno descreve o resultado e como o verificou; um link HTTP/HTTPS é opcional. A espera fixa de três horas foi removida. O técnico aprova ou devolve com um motivo, e as mudanças ficam no histórico da tarefa. Alterações simultâneas de etapa são detectadas.

## Relatórios

No acesso autenticado, o técnico encontra **Entregas esperadas da semana** em Relatórios Semanais. Selecione uma data para consultar a semana correspondente. O painel compara integrantes e relatórios pelo ID do aluno e início da semana, mostrando Entregue, A entregar, Atrasado ou Dispensado.

Dispensas exigem motivo e podem ser removidas pelo técnico. Elas são gravadas pela API autenticada; falhas no carregamento não são interpretadas como falta de entrega. Novos relatórios recebem a temporada ativa no servidor. Arquivos antigos sem temporada pertencem ao ciclo legado e continuam consultáveis no histórico e por seus links.

## Arquivar e reativar alunos

Em **Alunos**, o filtro alterna Ativos, Arquivados e Todos os cadastros. **Arquivar aluno** preserva seus registros, remove o integrante dos fluxos ativos e impede o login. **Reativar aluno** devolve o cadastro à equipe; inclua-o novamente na escala quando desejar. Editar o perfil não sobrescreve XP, presença ou entregas com valores antigos do formulário.

## Encerrar temporada

Confira os nomes do ciclo atual e seguinte, data de início, integrantes e pendências. Escolha se tarefas abertas, compromissos pendentes e o projeto de inovação devem continuar. Se desmarcar o projeto, o próximo ciclo começa com o formulário inicial; o projeto anterior permanece no arquivo. Os não selecionados são arquivados; XP, conquistas e frequência acumulada acompanham os escolhidos. As entregas são preservadas no arquivo da temporada e limpas para o próximo ciclo.

Tarefas, agenda, avaliações, chamadas, aplicações do rodízio, diário, treinos, evolução do protótipo, contatos, divulgação, decisões, XP e check-ins ficam associados ao ciclo encerrado. Relatórios recebem a temporada pela API. Código, anexos, versões do robô e materiais compartilhados continuam como acervo reutilizável.

O encerramento grava uma trava no banco. A equipe aguarda a conclusão e o técnico pode **Retomar encerramento** após uma queda de conexão. As escolhas originais e o ID da próxima temporada são reaproveitados. Cópias de pendências usam IDs determinísticos para evitar duplicação na retomada.

## Bloqueios de tarefas

O Kanban oferece **Bloquear** para o técnico e para os participantes de cada tarefa. Registre o motivo, a categoria e, se necessário, quem pode ajudar ou qual tarefa precisa terminar primeiro. A tarefa permanece em sua etapa e recebe destaque; o filtro **Somente bloqueadas** ajuda a localizar impedimentos.

O técnico também pode definir **Gears por participante** na criação ou pelo cartão. Ao aprovar o resultado, confirma o valor e os responsáveis; cada participante cadastrado e ativo recebe o valor integral uma única vez. A aprovação e os créditos são atômicos. Zero desativa a recompensa, e reabrir uma tarefa já paga não gera novo pagamento. Veja [regras e histórico das recompensas](giro-shop.md#recompensa-automática-no-kanban).

O avanço é recusado enquanto o bloqueio estiver aberto. Para liberar, registre a solução. Dependências precisam estar concluídas e ciclos entre tarefas são recusados. As ações ficam em um histórico separado das revisões.

## Indicadores e backup

A aba **Evolução** reúne **Indicadores**, **Backup** e **Lembretes**. Nos indicadores, selecione até 366 dias para comparar com o período anterior de mesma duração. Pontualidade considera apenas tarefas concluídas com prazo; retrabalho considera devoluções da revisão. Sem registros suficientes, o painel mostra **Sem base**. A tabela semanal pode ser exportada em CSV.

Em **Evolução → Backup**, **Baixar relatório em PDF** gera um documento legível com integrantes, projeto, tarefas, agenda, chamadas, treinos, avaliações e outros registros textuais da temporada selecionada. O PDF tem seções, paginação e suporte a acentos. Dados ausentes não são inventados; relatórios privados indisponíveis são informados no documento. Imagens e o conteúdo interno de anexos PDF/Word não são incorporados. Fontes Noto Sans licenciadas acompanham o site, e a geração ocorre no navegador com [pdf-lib](https://pdf-lib.js.org/).

A opção **Incluir o relatório da equipe em PDF no ZIP** funciona também no acesso legado e vem marcada por padrão. O ZIP inclui o arquivo `relatorio-da-equipe.pdf`, listado com tamanho e SHA-256 no manifesto. O PDF também pode ser baixado diretamente, sem ZIP.

O backup exporta um ZIP com `dados.json`, `manifesto.json` e, selecionado, o relatório legível da equipe em PDF e, no acesso autenticado, os anexos originais PDF/Word dos relatórios. Escolha a temporada ativa, uma arquivada ou todas. Cadastros e materiais compartilhados acompanham os registros; senhas, contas de autenticação e filas privadas ficam fora. Cada arquivo listado no manifesto tem tamanho e SHA-256.

Arquivos referenciados por links externos não são baixados. No acesso legado, os relatórios privados ficam de fora e essa omissão é registrada; o PDF dos dados da equipe continua disponível. A opção de anexos originais aparece apenas quando há acesso autenticado aos relatórios. O PDF gerado apresenta os registros do sistema. Os anexos originais dos alunos mantêm seu formato e só acompanham o ZIP quando selecionados; eles não são convertidos para PDF. Falhas ao baixar arquivos selecionados interrompem a exportação. Há um limite de 250 MB para esses arquivos por exportação. Os dados são lidos durante o intervalo informado no backup, sem uma trava sobre edições normais da equipe; uma mudança de temporada durante a leitura interrompe o processo.

A restauração é manual. Guarde o ZIP em um local independente do site. Para ativar e conferir os e-mails automáticos, consulte [configuração dos lembretes](reminders-setup.md).

## Publicação e validação dos processos

Publique frontend e funções da API juntos para disponibilizar o novo endpoint de dispensas. Integre os blocos de `firestore.weekly-reports.rules` às regras do ambiente, incluindo a verificação de aluno arquivado. O arquivo é um complemento às regras existentes, não uma substituição das permissões das demais abas.

As novas transações precisam das permissões de leitura e gravação nas coleções `rotationApplications`, `attendanceSessions`, `teamSeasons` e suas subcoleções `students` e `workspace`, além de `settings/workspace_season`. As dispensas são acessadas somente pelo servidor em `weeklyReportExpectations`.

A preparação da convocação também usa `finalSprintTournamentDrafts`, incluída no arquivo e no backup da temporada. No acesso autenticado, integre o bloco dessa coleção em `firestore.weekly-reports.rules`, com leitura e gravação exclusivas do técnico. Regras globais permissivas devem excluir essa coleção para preservar a privacidade da lista. A divulgação atualiza a coleção oficial `finalSprintSelectionScores` em uma única transação; os alunos continuam lendo somente seus próprios registros oficiais.

Execute `npm test` e `npm run build`. A suíte `teamProcesses` usa um adaptador de transações em memória e cobre repetição, rollback, revisão e retomada. Ela não valida as regras efetivamente publicadas no Firebase; essa conferência exige o ambiente configurado.
