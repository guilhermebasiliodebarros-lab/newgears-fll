# Simulador de trajetos

Abra **Robô → Simulador de trajetos**, disponível para técnico e alunos. O planejador é independente da Mesa Tática existente. Não consome Gears nem chama a IA.

1. Dê um nome ao plano e, se desejar, vincule-o a uma saída já cadastrada.
2. O simulador abre com a **imagem da mesa Bioglow** já usada pelo sistema, com o robô e o percurso desenhados sobre a pista. Os botões **Mesa Bioglow** e **Somente grade** trocam o fundo sem alterar os pontos. Na primeira abertura após esta atualização, rascunhos anteriores passam a mostrar a mesa, preservando o percurso; a escolha posterior da grade é mantida. Planos compartilhados só são atualizados ao salvar.
   Em **Medidas e orientação**, ajuste o campo e o tamanho do robô. Os valores iniciais de 240 × 120 cm são uma escala de trabalho ajustável, não uma certificação das medidas do tapete. A imagem ocupa a área informada; confira sua escala antes de usar as distâncias.
3. Clique ou toque no campo para criar os pontos, começando pela partida. X cresce para a direita e Y para cima, a partir do canto inferior esquerdo. A orientação 0° aponta para a direita e 90° para cima. O encaixe opcional usa múltiplos de 5 cm.
4. Arraste os pontos ou selecione P1, P2 etc. para editar as coordenadas pelo formulário. O botão **+** permite adicionar sem usar o desenho. É possível mudar a ordem, remover e desfazer alterações. O limite é de 80 pontos por plano.
5. Em cada ponto, escolha abrir, fechar, levantar ou baixar a garra, com uma anotação de objetivo ou missão.
6. Use **Reproduzir trajeto**, pause, reinicie ou avance pela barra da prévia. A sequência mostra curvas no próprio eixo e avanços em centímetros. As ações são executadas ao chegar ao ponto, inclusive no ponto inicial. A animação indica a ação e a abertura da garra; não modela o mecanismo específico da equipe. Se a projeção do corpo ultrapassa a borda, aparece um aviso.
7. **Salvar para a equipe** compartilha o plano na temporada atual. **Exportar trajeto** gera JSON que pode ser importado novamente. **Baixar sequência** gera instruções em TXT para consultar enquanto monta os blocos de programação.

## Prévia e uso na mesa

É uma visualização geométrica 2D. Não calcula atrito, aceleração, sensores, colisões com missões, flexão da garra ou duração real. A velocidade escolhida altera somente a apresentação. A verificação da borda considera a projeção retangular do robô na posição exibida, sem simular colisões durante o percurso. Distâncias e ângulos precisam ser calibrados no robô real; não há envio de código ou comando para o hardware.

Alterar as dimensões do campo reposiciona os pontos proporcionalmente. O formato exportado é `newgears-trajectory`, versão 1, e contém somente o plano, sem dados de conta. A importação confere o formato, os limites e as coordenadas e nunca grava automaticamente no servidor.

## Salvamento e permissões

O rascunho é guardado automaticamente neste navegador, separado por conta e temporada. Reabrir a aba recupera o trabalho. Se o armazenamento falhar, aparece um aviso; exportar ou salvar para a equipe mantém uma cópia. Trocar para outro plano com alterações pendentes pede confirmação. Alterações não salvas no navegador não aparecem em outro computador.

Os planos compartilhados ficam em `robotTrajectories/{id}` e usam `seasonId`, `ownerId`, autor, revisão e datas. A equipe lê; alunos editam e excluem os próprios; o técnico pode editar e excluir todos. Para modificar o plano de outro aluno, use **Duplicar**. O histórico de revisões é um contador para detectar conflitos, não uma lista de versões recuperáveis. Um conflito exige reabrir a versão compartilhada ou duplicar o rascunho. A repetição de um salvamento cuja resposta se perdeu não cria outro plano nem outra revisão.

O salvamento confere a temporada ativa e a saída vinculada na mesma transação. A troca de temporada mantém os planos antigos e não os copia para a nova; a coleção participa dos backups e da contagem do encerramento. Não foram criados planos de teste no Firestore real.

Integre o bloco `robotTrajectories` e o helper `validRobotTrajectory` de `firestore.weekly-reports.rules` às regras existentes. Preserve as outras coleções e exclua `robotTrajectories` de regras globais permissivas. As regras usam Firebase Auth e `weeklyReportMembers`; os proprietários devem ser UIDs quando esse login estiver ativo. Permissões e estrutura principal são verificadas nas regras; a validação detalhada dos pontos também ocorre no aplicativo. O arquivo é de integração e não substitui sozinho todas as regras do projeto. Nenhuma regra foi publicada automaticamente.
