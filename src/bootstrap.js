// Keep the HTML recovery controls available even if a deployment/network failure
// prevents the React application (or one of its initial dependencies) from loading.
import { installDiagnostics, reportClientIssue } from './services/clientDiagnostics';
installDiagnostics();
import('./main.jsx').catch((error) => {
  reportClientIssue(error, { area: 'startup', kind: 'module-load' });
  console.error('[New Gears] Não foi possível iniciar o aplicativo.', error);
  const title = document.querySelector('[data-startup-title]');
  const description = document.querySelector('[data-startup-description]');
  if (title) title.textContent = 'Não foi possível carregar o sistema.';
  if (description) description.textContent = 'Confira sua conexão e tente abrir novamente para carregar a versão disponível do site.';
  document.querySelector('.startup-message')?.setAttribute('role', 'alert');
});
