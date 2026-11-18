import { useSyncExternalStore } from 'react';
import { ClipboardList, LayoutDashboard, Timer, Trophy, Wifi, WifiOff } from 'lucide-react';
import './WorkspaceUtilities.css';

const subscribeConnection = (notify) => { window.addEventListener('online', notify); window.addEventListener('offline', notify); return () => { window.removeEventListener('online', notify); window.removeEventListener('offline', notify); }; };
const connectionSnapshot = () => navigator.onLine;
const useConnection = () => useSyncExternalStore(subscribeConnection, connectionSnapshot, () => true);

export function WorkspaceConnectionStatus() {
  const online = useConnection();
  return <span className="ng-connection" data-online={online} title={online ? 'O navegador detecta uma conexão de rede. Cada envio ainda precisa ser confirmado pelo servidor.' : 'O navegador está sem conexão de rede.'}>{online ? <Wifi size={15} /> : <WifiOff size={15} />}<span>{online ? 'Rede disponível' : 'Sem conexão'}</span></span>;
}

export function WorkspaceConnectionNotice() {
  const online = useConnection();
  return online ? null : <p className="ng-connection-notice" role="status"><WifiOff size={17} /><span>Você está sem conexão. Os rascunhos locais continuam neste dispositivo; aguarde a confirmação do servidor antes de considerar um envio concluído.</span></p>;
}

export function WorkspaceMobileNav({ activeId, onNavigate }) {
  return <nav className="ng-mobile-nav" aria-label="Atalhos no celular">{[{ id: 'overview', label: 'Início', icon: LayoutDashboard }, { id: 'competition', label: 'Competição', icon: Trophy }, { id: 'training', label: 'Treino', icon: Timer }, { id: 'kanban', label: 'Tarefas', icon: ClipboardList }].map(({ id, label, icon: Icon }) => <button type="button" key={id} aria-current={id === activeId ? 'page' : undefined} onClick={() => onNavigate(id)}><Icon size={20} /><span>{label}</span></button>)}</nav>;
}
