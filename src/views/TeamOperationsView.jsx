import { useState } from 'react';
import EvolutionPanel from '../components/EvolutionPanel';
import TeamBackupPanel from '../components/TeamBackupPanel';
import ReminderSettingsPanel from '../components/ReminderSettingsPanel';

export default function TeamOperationsView({ db, user, tasks, sessions, seasonId, seasons, reportsEnabled }) {
  const [tab, setTab] = useState('evolution');
  return <div className="space-y-5"><div className="flex flex-wrap gap-2" role="group" aria-label="Ferramentas de acompanhamento">{[['evolution', 'Indicadores'], ['backup', 'Backup'], ['reminders', 'Lembretes']].map(([id, label]) => <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)} className={`rounded-full border px-4 py-2 text-sm font-bold ${tab === id ? 'border-cyan-300 bg-cyan-300 text-slate-950' : 'border-white/15 bg-white/5 text-slate-300'}`}>{label}</button>)}</div>{tab === 'evolution' && <EvolutionPanel tasks={tasks} sessions={sessions} />}{tab === 'backup' && <TeamBackupPanel db={db} user={user} seasonId={seasonId} seasons={seasons} reportsEnabled={reportsEnabled} />}{tab === 'reminders' && <ReminderSettingsPanel enabled={reportsEnabled} />}</div>;
}
