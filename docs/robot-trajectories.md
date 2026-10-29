# Simulador de trajetos

Abra **Robô → Simulador de trajetos**, disponível para técnico e alunos. O planejador é independente da Mesa Tática existente. Não consome Gears nem chama a IA.

1. Em **Saídas do simulador**, escolha **Saída 1** a **Saída 8**. A seleção abre o rascunho local pendente ou um plano já registrado; sem plano, prepara um novo percurso para aquela saída. **Registrar Saída N** salva para a equipe e **Reproduzir Saída N** reinicia a animação do percurso selecionado. Também é possível dar um nome ao plano e vinculá-lo a uma saída cadastrada em Rounds. **Identificação no simulador** permite numerar um plano existente sem redesenhar.
2. O simulador abre com a **imagem da mesa Bioglow** já usada pelo sistema, com o robô e o percurso desenhados sobre a pista. Os botões **Mesa Bioglow** e **Somente grade** trocam o fundo sem alterar os pontos. Na primeira abertura após esta atualização, rascunhos anteriores passam a mostrar a mesa, preservando o percurso; a escolha posterior da grade é mantida. Planos compartilhados só são atualizados ao salvar.
   Em **Medidas e orientação**, ajuste o campo e o tamanho do robô. Os valores iniciais de 240 × 120 cm são uma escala de trabalho ajustável, não uma certificação das medidas do tapete. A imagem ocupa a área informada; confira sua escala antes de usar as distâncias.
3. Clique ou toque no campo para criar os pontos, começando pela partida. X cresce para a direita e Y para cima, a partir do canto inferior esquerdo. A orientação 0° aponta para a direita e 90° para cima. O encaixe opcional usa múltiplos de 5 cm.
   Em **Girar robô na largada**, use os botões de 90°, os atalhos de direção, a barra ou o campo de ângulo. O robô gira no ponto inicial e essa orientação é salva com a saída. Ela define a posição inicial; os movimentos seguintes continuam sendo curvas e avanços, sem deslocamento lateral de um robô omnidirecional.
4. Arraste os pontos ou selecione P1, P2 etc. para editar as coordenadas pelo formulário. O botão **+** permite adicionar sem usar o desenho. É possível mudar a ordem, remover e desfazer alterações. **Resetar pontos** limpa o percurso inteiro e preserva o robô, a garra, as missões e os obstáculos. **Desfazer** recupera os pontos; a saída compartilhada só muda ao salvar o novo percurso. O limite é de 80 pontos por plano.
5. Em cada ponto, escolha abrir, fechar, levantar ou baixar a garra, com uma anotação de objetivo ou missão.
6. Use **Reproduzir trajeto**, pause, reinicie ou avance pela barra da prévia. A sequência mostra curvas no próprio eixo e avanços em centímetros. As ações são executadas ao chegar ao ponto, inclusive no ponto inicial. A animação indica a ação e a abertura da garra; não modela o mecanismo específico da equipe. Se a projeção do corpo ultrapassa a borda, aparece um aviso.
7. **Salvar para a equipe** compartilha o plano na temporada atual. **Exportar trajeto** gera JSON que pode ser importado novamente. **Baixar sequência** gera instruções em TXT para consultar enquanto monta os blocos de programação.

## Prévia e uso na mesa

É uma visualização geométrica 2D. Não calcula atrito, aceleração, sensores, flexão da garra ou duração real. A velocidade escolhida altera somente a apresentação. Distâncias e ângulos precisam ser calibrados no robô real; não há envio de código ou comando para o hardware.

## Ré, curvas, objetos e configuração

Selecione um ponto após o inicial. Em **Direção até este ponto**, escolha frente ou ré. A marcha à ré mantém a frente do robô oposta ao deslocamento e participa do cálculo dos giros. Em **Formato do trecho**, escolha reta ou curva suave. A curva usa um controle roxo que pode ser arrastado ou ajustado por X/Y; o robô acompanha a tangente da curva. O comprimento da curva é aproximado geometricamente e não representa uma garantia de execução no hardware.

Em **Robô e garra**, informe nomes, medidas e o centro da garra em relação ao centro do corpo. X positivo aponta para frente e Y positivo para a esquerda. É possível vincular a configuração às versões do robô e garras já cadastradas. As dimensões são preenchidas pela equipe; selecionar um cadastro não mede o mecanismo automaticamente. O corpo e a garra aparecem na mesa e ambos entram na verificação de borda e de contato. A projeção da garra é um retângulo fixo, inclusive ao abrir, fechar, levantar ou baixar, para manter uma margem visual consistente. A configuração fica salva por saída e é copiada como ponto de partida ao preparar uma saída nova.

Em **Missões e obstáculos**, crie até 40 retângulos, nomeie, arraste e ajuste posição, largura, altura e rotação. Um contato na posição exibida mostra o nome do objeto e se foi tocado pelo corpo ou pela garra. **Analisar percurso completo** verifica também posições intermediárias e giros, por amostragem (passos de até 2 cm nas retas, até 5° nos giros e pelo menos 180 amostras por curva). O teste considera a projeção em 2D e não para a animação nem simula forças. Missões também aparecem como contato, pois tocar o modelo pode ser o objetivo do trecho. A análise não reconhece os modelos diretamente na foto: as áreas precisam ser marcadas pela equipe. Novas saídas copiam as marcações do plano aberto; depois, cada saída mantém suas próprias marcações.

## Reprodução do round completo

Abra **Reproduzir round completo · saídas registradas**. Marque as saídas desejadas e use as setas para escolher a ordem. Somente planos registrados na temporada entram no round; havendo mais de um, o sistema prefere o mais recente do usuário e, depois, o mais recente da equipe. A reprodução usa cópias das configurações registradas e preserva o rascunho local.

Ao terminar cada saída, há uma pausa com a garra e a orientação da próxima. **Iniciar próxima saída** confirma a troca e reposiciona a prévia no início do próximo plano. Não representa um deslocamento automático entre bases. É possível pausar e continuar a saída em execução. Ao concluir, **Encerrar round** retoma o rascunho anterior. A edição fica bloqueada durante a sessão; o round não gera pontos, tempo oficial ou registros de teste reais.

Planos e arquivos anteriores continuam aceitos: trechos antigos são tratados como retas para frente, sem obstáculos ou garra configurada. Os novos dados acompanham o registro, a exportação JSON e os backups. As regras de `robotTrajectories` precisam incluir `obstacles` e os novos campos de `settings`.

Alterar as dimensões do campo reposiciona os pontos proporcionalmente. O formato exportado é `newgears-trajectory`, versão 1, e contém somente o plano, sem dados de conta. A importação confere o formato, os limites e as coordenadas e nunca grava automaticamente no servidor.

## Salvamento e permissões

O rascunho é guardado automaticamente neste navegador, separado por conta, temporada e número da saída. Trocar pelos seletores numerados interrompe a prévia, carrega o percurso escolhido e mantém o rascunho anterior para retomá-lo. Reabrir a aba recupera o trabalho. Se houver vários planos registrados de uma saída, a seleção retoma o plano aberto anteriormente ou prefere o plano mais recente do próprio aluno. O bloco geral de trajetos foi retirado; os planos salvos permanecem no banco. Rascunhos pendentes têm prioridade, e os conflitos com o servidor continuam sendo conferidos ao salvar. **Recarregar versão salva** abre a revisão mais recente do plano atual, com confirmação se houver alterações pendentes. **Novo**, **Duplicar** e **Excluir plano** continuam disponíveis e a exclusão se refere sempre ao plano aberto. Se o armazenamento falhar, o cache da sessão preserva a troca enquanto a tela estiver aberta e aparece um aviso para exportar ou salvar. Alterações não salvas no navegador não aparecem em outro computador.

O campo `exitNumber` vai de 1 a 8; zero mantém a identificação pelo nome ou pelo vínculo com Rounds. Planos e arquivos antigos sem esse campo continuam aceitos. O bloco de regras `validRobotTrajectory` inclui a validação desse campo e precisa acompanhar a publicação.

Os planos compartilhados ficam em `robotTrajectories/{id}` e usam `seasonId`, `ownerId`, autor, revisão e datas. A equipe lê; alunos editam e excluem os próprios; o técnico pode editar e excluir todos. Para modificar o plano de outro aluno, use **Duplicar**. O histórico de revisões é um contador para detectar conflitos, não uma lista de versões recuperáveis. Um conflito exige reabrir a versão compartilhada ou duplicar o rascunho. A repetição de um salvamento cuja resposta se perdeu não cria outro plano nem outra revisão.

O salvamento confere a temporada ativa e a saída vinculada na mesma transação. A troca de temporada mantém os planos antigos e não os copia para a nova; a coleção participa dos backups e da contagem do encerramento. Não foram criados planos de teste no Firestore real.

Integre o bloco `robotTrajectories` e o helper `validRobotTrajectory` de `firestore.weekly-reports.rules` às regras existentes. Preserve as outras coleções e exclua `robotTrajectories` de regras globais permissivas. As regras usam Firebase Auth e `weeklyReportMembers`; os proprietários devem ser UIDs quando esse login estiver ativo. Permissões e estrutura principal são verificadas nas regras; a validação detalhada dos pontos também ocorre no aplicativo. O arquivo é de integração e não substitui sozinho todas as regras do projeto. Nenhuma regra foi publicada automaticamente.
