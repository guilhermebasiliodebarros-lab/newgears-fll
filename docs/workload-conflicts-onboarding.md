# Carga de trabalho, comparação de alterações e primeiros passos

## Distribuição das atividades

O técnico encontra **Ver carga de trabalho da equipe** em **Alunos** e no **Kanban**. O painel considera os próximos sete dias, incluindo tarefas vencidas e sem prazo. Os integrantes aparecem em ordem alfabética.

O esforço estimado em minutos pode ser informado na criação da tarefa ou em **Editar tarefa**. Ele representa a tarefa inteira; o painel divide esse esforço igualmente entre os responsáveis ativos. Tarefas concluídas ficam fora do planejamento, e tarefas aguardando revisão são mostradas separadamente, sem somar esforço de execução ao aluno.

Para cada integrante, o técnico pode **Combinar disponibilidade** em minutos por semana. Essa disponibilidade é uma informação de planejamento, combinada com o aluno, e pode ser deixada em branco. O painel não inventa disponibilidade nem transforma uma tarefa sem estimativa em esforço zero: informa quantas ainda precisam ser estimadas e que o total está incompleto.

O filtro **Mostrar quem precisa de atenção** reúne pessoas com esforço estimado acima da disponibilidade, tarefa vencida ou impedimento. Em **Ver tarefas e redistribuir**, abra uma atividade para conferir seus responsáveis, ajustar a estimativa ou combinar a redistribuição. Tarefas sem responsável ativo aparecem em um bloco separado.

## Alterações simultâneas

O comparador está integrado à edição dos detalhes de tarefas, às avaliações semanais, de apresentação e de relatórios, e à edição dos relatórios em PDF/Word. A disponibilidade semanal também detecta alterações simultâneas.

Quando a versão usada para começar uma edição muda no banco, a gravação é recusada e a escrita local permanece disponível. A tela apresenta **Versão original**, **Versão atual no sistema** e **Sua versão**. Nos campos alterados pelos dois acessos, escolha explicitamente qual manter. Campos alterados em apenas um acesso já vêm com uma sugestão que preserva a alteração correspondente.

**Aplicar escolhas ao formulário** atualiza o preenchimento e a referência de comparação. Esse botão não grava no banco: confira o conteúdo e salve novamente. Se outra alteração ocorrer nesse intervalo, o comparador volta a ser apresentado. Tarefas mantêm participantes e demais campos que não fazem parte dessa edição.

Os rascunhos das avaliações guardam a versão de origem. Isso permite detectar mudanças mesmo quando uma atualização ao vivo já chegou à tela. Uma avaliação com rascunho aberto continua acessível no filtro de pendentes quando outro técnico a conclui.

Relatórios usam um contador de revisão e a verificação condicional do banco. Edições sem informar a revisão de origem são recusadas; clientes antigos precisam atualizar a página. Uma comparação também diferencia os anexos: escolher o documento atual mantém o arquivo do sistema, enquanto escolher o arquivo local preserva a seleção para uma nova tentativa. O conteúdo binário dos arquivos não é comparado. Não são retornados caminhos internos do armazenamento na resposta de conflito.

Os demais fluxos conservam suas verificações existentes; este comparador não substitui autenticação ou regras do banco.

## Roteiro de entrada

Na visão geral do aluno, **Primeiros passos na equipe** apresenta quatro etapas: conhecer a estação, localizar tarefas, registrar o primeiro aprendizado e entender as entregas da semana. Cada etapa tem uma explicação, um atalho para a área correspondente e uma marcação manual de conclusão.

O roteiro abre inicialmente para quem ainda não marcou as quatro etapas. É possível recolher e rever as orientações. Os atalhos respeitam os recursos disponíveis: quando os relatórios autenticados ainda não estão ativos, o roteiro explica essa condição e encaminha para tarefas e diário.

As marcações ficam neste navegador, separadas por aluno e temporada. Elas não são uma avaliação, não concedem pontos e não substituem a confirmação de uma entrega. Se o navegador impedir a gravação, a tela informa que o progresso ficará apenas enquanto o roteiro estiver aberto. O roteiro não aparece no painel técnico nem na prévia de aluno aberta pelo técnico.

## Validação

`npm test` verifica o cálculo de esforço compartilhado, estimativas ausentes, capacidade, comparação de versões, permissão para editar, preservação de alterações e isolamento do roteiro por aluno e temporada. Os testes da API incluem recusa de revisões antigas e preservação dos arquivos.

Com `npm run dev` ativo, `node test/browser/workload-conflicts.cjs` verifica o painel completo, dois acessos editando tarefas e avaliações, comparação de relatórios e persistência dos primeiros passos. O teste usa um banco fictício local e APIs simuladas. A variável `PLAYWRIGHT_MODULE` pode apontar para uma instalação existente do Playwright.
