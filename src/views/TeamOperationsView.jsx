import { lazy, Suspense, useState } from 'react';
import EvolutionPanel from '../components/EvolutionPanel';
const TeamBackupPanel = lazy(() => import('../components/TeamBackupPanel'));
const ReminderSettingsPanel = lazy(() => import('../components/ReminderSettingsPanel'));
const DiagnosticsPanel = lazy(() => import('../components/DiagnosticsPanel'));

export default function TeamOperationsView({ db, user, tasks, sessions, seasonId, seasons, reportsEnabled }) {
  const [tab, setTab] = useState('evolution');
  return <div className="space-y-5"><div className="ng-tabs" role="group" aria-label="Ferramentas de acompanhamento">{[['evolution', 'Indicadores'], ['stability', 'Estabilidade'], ['backup', 'Backup'], ['reminders', 'Lembretes']].map(([id, label]) => <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}</div><Suspense fallback={<p role="status" className="ng-panel">Carregando ferramenta…</p>}>{tab === 'evolution' && <EvolutionPanel tasks={tasks} sessions={sessions} />}{tab === 'stability' && <DiagnosticsPanel user={user} />}{tab === 'backup' && <TeamBackupPanel db={db} user={user} seasonId={seasonId} seasons={seasons} reportsEnabled={reportsEnabled} />}{tab === 'reminders' && <ReminderSettingsPanel enabled={reportsEnabled} />}</Suspense></div>;
}
