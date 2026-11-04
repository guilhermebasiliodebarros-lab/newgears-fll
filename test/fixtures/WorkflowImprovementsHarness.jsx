import { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DraftForm from '../../src/components/DraftForm';
import TaskEvidencePicker from '../../src/components/TaskEvidencePicker';
import StudentAccessDialog from '../../src/components/StudentAccessDialog';
import TrainingQuickActions from '../../src/components/TrainingQuickActions';
import KanbanView from '../../src/views/KanbanView';
import LogbookView from '../../src/views/LogbookView';
import WeeklyReportsView from '../../src/views/WeeklyReportsView';
import RoundsView from '../../src/views/RoundsView';
import RobotRoundsPanel from '../../src/components/RobotRoundsPanel';
import FinalSprintEvaluationsView from '../../src/views/FinalSprintEvaluationsView';
import { StudentManagementPanel } from '../../src/components/RotationOperationsPanel';
import { GearShopContext } from '../../src/hooks/useGearShopContext';
import { getFinalSprintEvaluationWeek, WEEKLY_EVALUATION_CRITERIA } from '../../src/utils/finalSprintEvaluations';
import '../../src/index.css';
import '../../src/components/WorkspaceDesign.css';

const alice = { id: 'alice', name: 'Alice', username: 'alice', password: 'fixture', turma: '8A', station: 'Engenharia' };
const bob = { id: 'bob', name: 'Bob', status: 'active' };
const tasks = [
  { id: 'done', text: 'Sensor validado', status: 'done', participants: [alice], author: 'Alice', completedAt: '2026-11-04', evidence: 'Dez testes realizados com sucesso', evidenceUrl: 'https://example.com/evidencia' },
  { id: 'other', text: 'Resultado de outra pessoa', status: 'done', participants: [bob], author: 'Bob' },
  { id: 'blocked', text: 'Comprar material pendente', status: 'doing', author: 'Alice', participants: [alice], block: { reason: 'Precisamos de material', updatedAt: '2026-11-04' } },
  { id: 'urgent', text: 'Montagem para hoje', status: 'todo', author: 'Alice', participants: [alice], dueDate: '2026-11-04' },
  { id: 'review', text: 'Apresentacao em revisao', status: 'review', author: 'Bob', participants: [bob] },
];
const noop = () => {};
const week = getFinalSprintEvaluationWeek();
const workspace = { enabled: true, reports: [{ id: 'existing', userId: 'auth-alice', studentId: 'alice', studentName: 'Alice', studentEmail: 'alice@example.com', seasonId: 'legacy', title: 'Relatório original', description: 'Resumo original', week: 'Semana 1', reportDate: '2026-11-04', revision: 1, fileName: 'original.pdf', fileSize: 20, fileRevision: 1, fileExtension: 'pdf', linkedTaskIds: [] }], readIds: new Set(), unreadReports: [], loading: false, error: '', retry: noop };
const user = { type: 'student', uid: 'auth-alice', studentId: 'alice', name: 'Alice', email: 'alice@example.com' };

export default function Harness() {
  const [area, setArea] = useState(() => new URL(location.href).searchParams.get('area') || 'status');
  const [filter, setFilter] = useState('all');
  const [text, setText] = useState('');
  const [selected, setSelected] = useState([]);
  const [mode, setMode] = useState('success');
  const [diary, setDiary] = useState('');
  const [quick, setQuick] = useState(false);
  const [roundValues, setRoundValues] = useState({});
  const [robotTab, setRobotTab] = useState('overview');
  const completeQuick = useCallback(() => setQuick(false), []);
  const navigate = (next) => { setArea(next); history.replaceState({}, '', `?area=${next}`); };
  return <GearShopContext.Provider value={{ draftScope: 'workflow-fixture:alice:season' }}><div className="newgears-workspace min-h-screen bg-[#0d111b] p-4 text-white">
    <nav className="mb-4 flex flex-wrap gap-2" aria-label="Cenários de verificação">{['status', 'access', 'tasks', 'diary', 'reports', 'evaluations', 'students'].map((item) => <button className="ng-button" key={item} onClick={() => navigate(item)}>{item}</button>)}</nav>
    <TrainingQuickActions onTest={() => { navigate('rounds'); setQuick(true); }} onTasks={() => { setFilter('mine'); navigate('tasks'); }} onDiary={() => { navigate('diary'); setQuick(true); }} />
    <main id="workspace-content">
      {area === 'status' && <><button className="ng-button" onClick={() => setMode('failure')}>Simular falha</button><button className="ng-button" onClick={() => setMode('pending')}>Simular espera</button><button className="ng-button" onClick={() => setMode('success')}>Simular sucesso</button><DraftForm kind="workflow-check" values={{ text, selected }} onDiscard={() => { setText(''); setSelected([]); }} onSubmit={async () => { if (mode === 'failure') throw Error('Falha simulada de conexão'); if (mode === 'pending') await new Promise((resolve) => { window.finishWorkflowSave = resolve; }); window.lastWorkflowSave = { text, selected }; setText(''); setSelected([]); return true; }}>
        <label>Aprendizado<textarea name="learning" value={text} onChange={(event) => setText(event.target.value)} /></label>
        <TaskEvidencePicker tasks={tasks} student={alice} selected={selected} onChange={setSelected} onInsert={(value) => setText((current) => [current, value].filter(Boolean).join('\n\n'))} />
        <button type="submit" className="ng-button">Enviar registro</button>
      </DraftForm></>}
      {area === 'access' && <StudentAccessDialog student={alice} students={[alice, bob]} tasks={tasks} planning={{ participantIds: ['alice'], captainIds: [], traineeIds: [] }} onConfirm={async (...args) => { window.lastHandoff = args; }} onClose={() => navigate('status')} />}
      {area === 'tasks' && <><div className="flex gap-2">{['blocked', 'urgent', 'review', 'all'].map((value) => <button className="ng-button" key={value} onClick={() => setFilter(value)}>Filtrar {value}</button>)}</div><KanbanView key={filter} initialAttention={filter} tasks={tasks} students={[alice, bob]} viewAsStudent={alice} isAdmin={false} currentWeekData={{ id: 1 }} localTodayObj={new Date('2026-11-04T12:00:00')} localTodayStart={new Date('2026-11-04T00:00:00')} localTodayStr="2026-11-04" parseLocalDateValue={(value) => value ? new Date(`${value}T12:00:00`) : null} getLocalYYYYMMDD={(date) => date.toISOString().slice(0, 10)} handleAddTask={async () => true} moveTask={noop} assignTaskToStudent={noop} joinTask={noop} leaveTask={noop} takeoverTask={noop} onOpenBlock={noop} removeTask={noop} /></>}
      {area === 'diary' && <LogbookView tasks={tasks} student={alice} quickFocus={quick} onQuickFocusHandled={completeQuick} currentWeekData={{ id: 1, weekName: 'Semana 1' }} isAdmin={false} studentLogbookSearchQuery="" setStudentLogbookSearchQuery={noop} studentLogbookWeekFilter="all" setStudentLogbookWeekFilter={noop} studentLogbookDraft={diary} setStudentLogbookDraft={setDiary} logbookEntries={[]} students={[alice, bob]} groupLogbookEntriesByWeek={() => []} sortLogbookEntries={(entries) => entries} buildLogbookWeekOptions={() => []} getLogbookEntryDate={() => new Date()} getLogbookEntryTags={() => []} getLogbookEntryWordCount={() => 0} getLogbookStudentId={(entry) => entry.studentId} getLogbookEntryPreview={(entry) => entry.text} handleLogbookSubmit={async (event) => { window.lastDiary = Object.fromEntries(new FormData(event.currentTarget)); setDiary(''); return true; }} />}
      {area === 'reports' && <WeeklyReportsView tasks={tasks} user={user} workspace={workspace} defaultWeek="Semana 1" seasonId="legacy" />}
      {area === 'evaluations' && <FinalSprintEvaluationsView isTechnicalProfile students={[alice, bob]} initialWeekId={week.id} initialOnlyPending evaluations={[{ studentId: 'alice', type: 'weekly', weekId: week.id, status: 'complete', ratings: Object.fromEntries(WEEKLY_EVALUATION_CRITERIA.map((item) => [item.id, 4])) }]} draftScope="workflow-fixture" />}
      {area === 'students' && <StudentManagementPanel students={[alice, bob]} tasks={tasks} initialOnlyIncomplete canManage getCurrentLevel={() => ({ name: 'Iniciante', color: 'text-white' })} onSetStudentAccess={async (...args) => { window.lastHandoff = args; }} />}
      {area === 'rounds' && <RoundsView rounds={[]} robotVersions={[]} missionsList={[]} attachments={[]} scoreHistory={[]} robotSubTab={robotTab} setRobotSubTab={setRobotTab} roundFormValues={roundValues} setRoundFormValues={setRoundValues} FULL_ROUND_SCORE_KEY="__full_round_score__" FULL_ROUND_TIME_KEY="__full_round_time__" FULL_ROUND_TIMER_ID="full" quickFocus={quick} onQuickFocusHandled={completeQuick} toggleTimer={noop} handleSaveFullRoundRun={async () => true} ScoreEvolutionChart={() => <p>Histórico fictício</p>} RobotRoundsPanel={RobotRoundsPanel} LazyPanelFallback={() => <p>Carregando…</p>} />}
    </main>
  </div></GearShopContext.Provider>;
}
createRoot(document.getElementById('root')).render(<Harness />);
