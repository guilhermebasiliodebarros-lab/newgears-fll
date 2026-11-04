# Rotina de treino e continuidade dos registros

## Revisar a saída de um integrante

Em **Alunos → Gerenciar → Inativar acesso**, a confirmação mostra estação, papel no rodízio, frentes registradas e tarefas abertas do integrante. Para cada tarefa, escolha transferir sua participação para outro aluno ativo, retirar apenas esse integrante ou manter os participantes para revisar depois. Os demais participantes e a autoria original continuam registrados.

A opção **Retirar do planejamento dos próximos rodízios** vem marcada. O cadastro inativo já fica fora da escala; quando existe planejamento salvo, seus IDs também são retirados desse planejamento. Aplicações antigas do rodízio e registros de frentes permanecem no histórico. As frentes devem ser revisadas na Reta final.

As transferências selecionadas, o planejamento, a inativação e o histórico são confirmados na mesma transação. Se a temporada, os participantes ou a etapa de uma tarefa mudarem durante a confirmação, a operação é recusada sem aplicar parte das mudanças. Reabra a tela para conferir novamente. É possível redistribuir até 100 tarefas em uma confirmação.

## Abrir pendências diretamente

Os cartões de **Pendências do time** abrem o destino já filtrado: tarefas bloqueadas, tarefas vencidas ou para hoje, tarefas aguardando revisão, compromissos de hoje e amanhã, cadastros incompletos, avaliações pendentes da semana e relatórios não lidos. Os filtros podem ser alterados na área aberta. Navegar pelo menu principal volta à entrada normal dessa área.

## Reaproveitar tarefas concluídas

No formulário do **Diário** e de **Novo relatório**, use **Aproveitar tarefas concluídas**. Selecione até 30 tarefas e use **Inserir resultados no texto** para aproveitar a descrição, a evidência e seu link. O texto existente é preservado; revise e acrescente o aprendizado antes de enviar.

O aluno escolhe tarefas concluídas das quais participa, na temporada consultada. O técnico pode selecionar tarefas concluídas da equipe nos relatórios. O registro guarda os IDs das tarefas e oferece atalhos para consultá-las no Kanban. Os vínculos não concluem tarefas, não criam registros automaticamente e não concedem recompensas adicionais.

O relatório continua exigindo um arquivo PDF ou Word; o reaproveitamento preenche seu resumo. Os vínculos novos são validados pela API antes de armazenar o arquivo. Essa área continua dependendo da ativação do acesso autenticado já prevista no sistema.

## Saber o que foi salvo

Os formulários com rascunho distinguem **Rascunho salvo neste dispositivo**, **Enviando**, **Confirmado no sistema** e **Falha ao enviar**. O rascunho é local e ainda não é uma entrega. O horário é mostrado após sua gravação. Se o navegador impedir o armazenamento, a tela informa que o rascunho não pôde ser salvo.

Diário, criação e revisão de tarefas, registros de testes e relatórios usam o mesmo indicador. As avaliações também utilizam esses estados. Uma falha mantém o preenchimento para nova tentativa; editar durante o envio mantém as alterações posteriores como rascunho. Os relatórios recuperam título, data, semana, resumo e seleção de tarefas. Arquivos precisam ser selecionados novamente depois de reabrir o formulário.

## Ações rápidas no celular

Em telas menores que 768 pixels, **Durante o treino** oferece botões grandes para **Registrar teste**, **Atualizar tarefa** e, para alunos, **Registrar descoberta**. Testes abrem o campo de pontuação do round completo; descobertas abrem o texto do diário. Tarefas abrem as pendências do técnico ou as tarefas abertas do próprio aluno.

## Validação local

`npm test` inclui redistribuição atômica, preservação de autoria, alterações simultâneas, filtros e validação dos vínculos na API. Com `npm run dev` ativo, execute `node test/browser/workflow-improvements.cjs`; `PLAYWRIGHT_MODULE` pode apontar para uma instalação existente do Playwright. A verificação de navegador utiliza dados fictícios e APIs simuladas, sem acessar o banco da equipe.
