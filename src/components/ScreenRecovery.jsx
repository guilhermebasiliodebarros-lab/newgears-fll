import { Component, useSyncExternalStore } from 'react';
import { isStorageUnavailable, subscribeStorageStatus } from '../utils/browserStorage';
import './ScreenRecovery.css';
import { reportClientIssue } from '../services/clientDiagnostics';

const isModuleError = (error) => /failed to fetch dynamically imported module|importing a module script failed|loading (css )?chunk|unable to preload css|failed to load module script/i.test(error?.message || '');

export function BrowserStorageNotice() {
  const unavailable = useSyncExternalStore(subscribeStorageStatus, isStorageUnavailable, () => false);
  return unavailable ? <p role="status" className="storage-notice">O navegador bloqueou o armazenamento. Seu acesso e suas preferências ficam disponíveis apenas nesta aba. Os dados salvos no sistema continuam na conta.</p> : null;
}

export default class ScreenRecovery extends Component {
  state = { failed: false, error: null, attempt: 0 };

  static getDerivedStateFromError(error) { return { failed: true, error }; }

  componentDidCatch(error, info) {
    reportClientIssue(error, { area: this.props.area || 'principal', kind: 'render' });
    console.error(`[New Gears] Falha na tela ${this.props.area || 'principal'}`, error, info.componentStack);
  }

  render() {
    const { failed, error, attempt } = this.state;
    if (!failed) return <div key={attempt} className="screen-recovery-content">{this.props.children}</div>;
    const moduleError = isModuleError(error);
    return <section className="screen-recovery" role="alert" aria-labelledby="screen-recovery-title">
      <span className="screen-recovery__brand">NEW GEARS</span>
      <h1 id="screen-recovery-title">Não foi possível abrir esta tela.</h1>
      <p>{moduleError ? 'Uma parte do site não carregou. Confira a conexão e atualize para abrir a versão disponível.' : this.props.area ? 'Ocorreu uma falha ao exibir esta área. Você pode tentar novamente ou acessar outra função pelo menu.' : 'Ocorreu uma falha ao abrir o sistema. Tente novamente; se continuar, atualize a página.'}</p>
      <div className="screen-recovery__actions">
        {!moduleError && <button type="button" onClick={() => this.setState({ failed: false, error: null, attempt: attempt + 1 })}>Tentar novamente</button>}
        {this.props.onHome && <button type="button" onClick={this.props.onHome}>Voltar à visão geral</button>}
        <button type="button" onClick={() => window.location.reload()}>Atualizar página</button>
      </div>
      <p className="screen-recovery__hint">Se houver alterações ainda não salvas, tente outra área antes de atualizar a página.</p>
    </section>;
  }
}
