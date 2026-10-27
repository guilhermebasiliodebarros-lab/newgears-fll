# React + Vite

Fluxos de rodízio, chamada, tarefas, relatórios e encerramento de temporada: [guia dos processos da equipe](docs/team-processes.md).

Resumo diário de prazos, impedimentos e relatórios: [configuração do agendador de lembretes](docs/reminders-setup.md).

Mascote Giro, moedas virtuais e itens de perfil: [guia da loja de personalização](docs/giro-shop.md).

Configuração da funcionalidade de relatórios semanais: [guia de Firebase Auth, Supabase, e-mail e Cloudflare Pages](docs/weekly-reports-setup.md). As variáveis estão em `.env.example`; os relatórios exigem ativação do acesso autenticado após preparar os serviços externos.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
