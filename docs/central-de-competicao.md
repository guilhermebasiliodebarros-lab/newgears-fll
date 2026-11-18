# Central de competição e evolução da plataforma

Implementação local de 18/11/2026. As melhorias anteriores da Central de treino foram mantidas.

## Preparada para a transição dos programas

A identidade principal passou a ser **New Gears · Robótica**, com textos de entrada, menu, vitrine pública e modo TV independentes de uma marca de competição. Os registros, simuladores, avaliações e rubricas atuais da FLL foram preservados. As rubricas aparecem identificadas como **Rubricas FLL**; os novos critérios configuráveis ficam na Central de competição.

A FIRST confirma a conclusão da FLL em 2027 e prepara programas substitutos para 2027–2028. Nomes, regulamentos, calendário regional e decisões da equipe não foram presumidos. Referência consultada em 18/11/2026: [FIRST K-8 Programs: 2027 and Beyond](https://www.firstinspires.org/programs/k-8).

## Recursos implementados

| Recurso | Como funciona |
| --- | --- |
| Perfil da competição | Nome, modalidade, categoria, data, local, link e versão do regulamento. Campos podem ficar a definir. O tempo de round é configurável e não herda um limite de outra modalidade. |
| Checklist do pit | Até 30 itens personalizados, com grupo, responsável e conferência. Sugestões iniciais incluem baterias, peças, código, documentos e organização. |
| Programação do evento | Até 30 compromissos com data, horário, local, responsável e tipo. A próxima atividade é destacada e os horários passados continuam consultáveis. |
| Preparação com evidências | Até 16 critérios próprios, com peso de 1 a 5, responsável, situação, descrição e link. Concluir exige uma descrição de pelo menos 8 caracteres ou um link. |
| Indicador interno | Calcula a fração dos pesos dos critérios concluídos com evidência. Não calcula nota oficial, qualidade da evidência nem probabilidade de classificação. Sem critérios, o indicador fica sem valor em vez de mostrar 100%. |
| Consistência do robô | Lê até 10 rounds completos recentes dos dados existentes, mostra mediana, melhor resultado, evolução e testes dentro do tempo configurado. Permite filtrar a versão do robô. Exclui testes de saída e registros sem data, pontuação ou tempo válidos. |
| Modo torneio | Destaca o próximo compromisso e apresenta checklist e programação para consulta, com ações de edição recolhidas. |
| Exportação | Baixa um arquivo de texto com a configuração, programação, responsáveis, checklist e evidências. Rascunhos são identificados no arquivo. |
| Navegação móvel | Atalhos fixos para Início, Competição, Treino e Tarefas. O Giro fica acima da barra. |
| Conexão | Mostra o estado de rede detectado pelo navegador. A disponibilidade de rede não é apresentada como confirmação de sincronização com o banco. |
| Vitrine pública | Links para seções, perfis ativos, carregamento sob demanda das fotos e galeria ampliável com navegação por botões, setas e Escape. |
| Contagem de data | Ausência ou erro de data aparece como “a definir”/“confira a data”. Datas passadas não aparecem como se o evento estivesse chegando agora. Datas cadastradas foram preservadas. |

## Fluxo do técnico e do aluno

O técnico abre **Central de competição**, configura o evento e adapta os preparativos ao regulamento escolhido. Cada edição fica em um rascunho local, separado por perfil e temporada. **Salvar para a equipe** confirma a gravação antes de exibir sucesso.

Os alunos consultam a versão compartilhada; não alteram o plano, os horários, as conferências ou os critérios. A edição no modo capitã também não concede os privilégios do técnico.

Se outra pessoa salvar uma versão enquanto há um rascunho, a cópia local é preservada e o salvamento fica bloqueado. É possível exportá-la e abrir a versão atual da equipe. Repetir uma gravação cuja resposta se perdeu não cria uma segunda revisão. Falhas de rede ou permissão preservam o rascunho.

## Persistência, regras e publicação

- A coleção interna é `competitionWorkspaces`, com um documento por temporada. O plano não é colocado nas configurações da vitrine pública.
- A coleção participa dos backups e do fechamento de temporada existentes. Alterações em temporadas encerradas ou em transição são recusadas pelo serviço.
- Esta versão organiza **uma competição corrente por temporada**. Para guardar uma cópia de cada evento do mesmo circuito, exporte o plano antes de substituí-lo. Uma seleção de múltiplos eventos é uma evolução sugerida abaixo.
- A vitrine pública mantém sua curadoria própria; configurar a central interna não publica automaticamente responsáveis, evidências ou horários internos.
- Os rascunhos usam o armazenamento do navegador. Limpar os dados do navegador remove as cópias locais; o plano confirmado permanece no Firebase.

A sincronização precisa da autenticação e das regras da coleção no Firebase. O bloco `competitionWorkspaces` foi acrescentado a [firestore.weekly-reports.rules](../firestore.weekly-reports.rules), usando as funções de integrante ativo e técnico já existentes. Esse arquivo é um conjunto de blocos para integrar às regras do projeto; não deve substituir indiscriminadamente as demais permissões. A etapa local não publicou regras nem fez alterações no banco de produção. Consulte também [migração de autenticação](auth-migration.md) e [configuração do acesso autenticado](weekly-reports-setup.md).

## Validação

`npm test` inclui conflitos, retomada de gravação, bloqueio de edição por aluno, isolamento por temporada, dados inválidos, URLs seguras, evidências obrigatórias, pesos, estatísticas e contagem de datas. `npm run build` compila a aplicação; a central é carregada sob demanda.

O cenário `test/fixtures/competition-hub.html` usa os componentes reais, com dados fictícios e sem importar Firebase. Permite conferir perfis, rascunhos, edição externa, falha simulada, exportação, modo torneio e a vitrine. A confirmação de gravação nesse cenário é simulada; não valida permissões ou disponibilidade do banco de produção.

Foram conferidos no navegador: recuperação do rascunho após recarga; consulta do aluno sem acesso ao rascunho do técnico; evidência obrigatória; criação de item do pit e horário; confirmação simulada para a equipe; bloqueio diante de uma edição externa; exportação; modo torneio; galeria por botões, setas e Escape, com retorno do foco. Os formulários e a entrada foram verificados a 320 px e a central a 390 px, sem rolagem horizontal. A entrada real foi recarregada sem novos erros de console. O fechamento dessa etapa passou nas **42 suítes** e no build de produção.

Capturas, com os dados fictícios identificados na central:

- [Central no computador](competicao/central-desktop.jpg).
- [Central no celular](competicao/central-celular.jpg).
- [Identidade da equipe na entrada móvel](competicao/entrada-celular.jpg).

## Próximas funcionalidades sugeridas

1. **Circuito de torneios:** vários eventos dentro da temporada, com preparação, resultados e retrospectiva próprios.
2. **Rastreabilidade das evidências:** ligar critério a tarefa, versão de código, teste e registro do diário, aproveitando os vínculos já presentes nos relatórios.
3. **Inventário e manutenção:** localização e empréstimo de peças, registro de baterias e revisões do robô; o checklist atual registra apenas a conferência.
4. **Plano B de mesa:** comparar saídas usando as repetições reais para preparar alternativas quando tempo, alinhamento ou missão falharem.
5. **Retrospectiva do torneio:** reunir resultados, feedback dos avaliadores e próximos experimentos, associados ao histórico da temporada.

Essas ideias são propostas para outra etapa; não estão ativadas nesta implementação.
