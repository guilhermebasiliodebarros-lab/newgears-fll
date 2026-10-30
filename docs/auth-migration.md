# Migração do acesso legado para Firebase Authentication

Preparação local em 30/10/2026. Nenhuma conta foi criada, nenhuma senha foi alterada e nenhuma regra foi publicada.

## Situação atual

O acesso legado continua funcionando, conforme a decisão do técnico. `VITE_FIREBASE_AUTH_ENABLED` permanece desativada até a preparação das contas. O caminho de login autenticado, a validação no servidor e a associação `weeklyReportMembers/{uid}` já existem.

**O login legado não oferece autorização segura.** Há credenciais administrativas no código do cliente, comparação de senhas de alunos no navegador e confiança em uma identidade local. Retirar senhas do `localStorage` reduz a exposição, mas não resolve essas limitações. Não use uma alteração visual ou uma verificação `isAdmin` como substituta das regras do banco.

O Firestore permite leitura por documento, não ocultação de campos de um documento lido. A coleção compartilhada de alunos precisa ser separada dos dados privados durante a migração. Ocultar senha, nota ou XP na vitrine não impede que o documento original seja consultado se as regras permitirem a leitura.

## Gerar um plano sem acessar serviços externos

O script lê arquivos locais e gera somente um planejamento. Ele não usa SDK administrativo, não faz requisições de rede e não cria contas. Não sobrescreve arquivos existentes. Arquivos `*.local.json` foram adicionados ao `.gitignore`.

Prepare uma lista JSON local contendo somente `id`, `name`, `email` e `status` dos integrantes. Exemplo fictício:

```json
[
  { "id": "integrante-exemplo", "name": "Integrante de exemplo", "email": "aluno@example.com", "status": "active" }
]
```

Execute:

```powershell
node scripts/plan-auth-migration.mjs --roster=integrantes.local.json --out=plano-auth.local.json
```

Sem e-mail, o plano exige confirmação; ele não inventa um endereço. Sem UID, indica a necessidade de criar a conta. Depois que uma conta real for criada e verificada por um operador autorizado, um arquivo opcional pode relacionar o UID ao ID original:

```json
[
  { "studentId": "integrante-exemplo", "uid": "uid-confirmado-no-firebase", "email": "aluno@example.com" }
]
```

```powershell
node scripts/plan-auth-migration.mjs --roster=integrantes.local.json --accounts=vinculos.local.json --out=plano-auth-revisado.local.json
```

O resultado contém os dados propostos para os vínculos, sempre com papel `student`, e mantém `readyToActivate: false`. E-mails compartilhados, IDs duplicados e vínculos sem aluno ativo impedem o planejamento. Uma conta técnica deve ser configurada separadamente e revisada por um administrador. Não compartilhe esses arquivos: contêm dados pessoais, embora não contenham senhas.

## Ordem de execução externa, após autorização

1. Exportar um backup revisado e guardar uma cópia das regras efetivamente publicadas. O backup da aplicação exclui senhas e contas de autenticação; não é um mecanismo de restauração de credenciais.
2. Habilitar Email/Password no Firebase Authentication e conferir os domínios autorizados, incluindo o domínio da Cloudflare. Configurar os segredos das APIs somente no servidor.
3. Criar e testar a conta técnica. Criar as contas dos alunos com os responsáveis autorizados; não reutilizar automaticamente as senhas que estavam expostas no login legado.
4. Criar os vínculos `weeklyReportMembers/{uid}` com `active`, `role`, `studentId`, `name` e `email`. O `studentId` precisa apontar para um documento existente e ativo. Preservar os IDs dos alunos mantém notas, XP, trajetos, Gears e históricos associados.
5. Separar perfil compartilhado, perfil privado e projeção pública. Remover credenciais dos documentos lidos pelo navegador somente quando o acesso autenticado já tiver sido validado. A vitrine e a TV pública devem consultar documentos próprios com campos aprovados.
6. Integrar as regras de **todas** as coleções, com negação por padrão, e testá-las no Emulator Suite. `firestore.weekly-reports.rules` é um conjunto parcial de regras; não deve substituir às cegas a configuração atual. Incluir XP, notas, Gears, reembolsos, comprovantes, avaliações, arquivos, perfis e os novos campos `revision` e `officialCodeId`.
7. Fazer um piloto em ambiente separado, com um técnico e dois alunos. Conferir leitura própria, bloqueio de alteração de outro aluno, bloqueio de promoção de papel, alteração administrativa, conta arquivada, logout, várias abas, computador compartilhado e acesso público sem dados privados.
8. Ativar `VITE_FIREBASE_AUTH_ENABLED=true` e publicar somente após o piloto. A flag é resolvida no build: mudar uma variável no painel sem gerar o frontend novamente não altera o login entregue.
9. Monitorar os acessos e só então retirar o caminho legado, revogar suas credenciais e revisar os dados que ficaram em caches de computadores compartilhados. Definir também a política de persistência de sessão e cache nesses equipamentos.

Voltar a uma versão anterior da interface não substitui uma estratégia de recuperação das regras. Um retorno temporário ao login legado conserva suas limitações de segurança. Não abrir regras de produção para solucionar um erro de permissão.

## O que foi verificado nesta etapa

- Testes locais de planejamento, detecção de colisões e exclusão de senhas.
- Teste no navegador com Firebase simulado: consultas protegidas começam depois da validação da sessão.
- API de relatórios recusa vínculo para aluno inexistente ou inativo.
- O código mantém a configuração legada atual, sem criar usuários ou alterar documentos reais.

Criação de contas, publicação das regras, migração de documentos privados e ativação em produção continuam dependendo de autorização específica e de validação no ambiente real.
