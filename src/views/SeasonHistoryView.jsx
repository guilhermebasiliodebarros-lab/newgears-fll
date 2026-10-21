import { useEffect, useMemo, useState } from 'react';
import { collection, collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { getWeeklyReportFile } from '../services/weeklyReports';
import { Archive, CalendarDays, CheckCircle2, ClipboardList, FileText, Loader2, RotateCcw, Users } from 'lucide-react';

const ARCHIVED_COLLECTIONS = [
  { id: 'tasks', label: 'Tarefas', icon: ClipboardList },
  { id: 'events', label: 'Agenda', icon: CalendarDays },
  { id: 'finalSprintAssignments', label: 'Frentes da reta final', icon: RotateCcw },
  { id: 'finalSprintEvaluations', label: 'Avaliações', icon: CheckCircle2 },
  { id: 'finalSprintSelectionScores', label: 'Seleções de torneio', icon: Users },
  { id: 'studentSubmissions', label: 'Entregas dos integrantes', icon: ClipboardList },
  { id: 'workspaceSnapshots', label: 'Projeto, metas e rubricas', icon: FileText },
  ...[
    ['attendanceSessions', 'Chamadas'], ['rotationApplications', 'Aplicações do rodízio'],
    ['logbook', 'Diário de bordo'], ['score_history', 'Treinos e pontuações'],
    ['prototypeIterations', 'Evolução do protótipo'], ['expertContacts', 'Contatos com especialistas'],
    ['outreach', 'Divulgação'], ['decisionMatrix', 'Decisões'], ['xpRecords', 'Movimentações de XP'],
    ['xpLossRecords', 'Perdas de XP'], ['leaderPenaltyRequests', 'Solicitações de revisão'], ['dailyMoods', 'Check-ins'], ['activityLogs', 'Histórico de ações'],
  ].map(([id, label]) => ({ id, label, icon: FileText })),
];

const formatArchiveDate = (value) => {
  if (!value) return 'Data não registrada';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data não registrada' : date.toLocaleDateString('pt-BR');
};

const getRecordDate = (record) => record.updatedAt || record.createdAt || record.date || '';

const snapshotLabels = { title: 'Título', name: 'Nome', problem: 'Problema', solution: 'Solução', description: 'Descrição', impact: 'Impacto', text: 'Conteúdo', updatedAt: 'Atualização', createdAt: 'Criação', target: 'Meta', evidence: 'Evidência' };
function SnapshotDetails({ data }) {
  return <dl className="space-y-2">{Object.entries(data).filter(([key]) => key !== 'id').map(([key, value]) => <div key={key}><dt className="font-semibold text-slate-200">{snapshotLabels[key] || key.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ')}</dt><dd className="ml-2 mt-1 whitespace-pre-wrap break-words">{value && typeof value === 'object' ? <SnapshotDetails data={value} /> : typeof value === 'boolean' ? value ? 'Sim' : 'Não' : String(value ?? 'Não informado').startsWith('data:') ? 'Arquivo preservado' : String(value ?? 'Não informado')}</dd></div>)}</dl>;
}

const formatStatus = (status) => ({
  todo: 'A fazer',
  in_progress: 'Em andamento',
  done: 'Concluída',
  planned: 'Planejada',
  complete: 'Concluída',
  confirmed: 'Confirmado',
  concluido: 'Concluído',
  confirmado: 'Confirmado',
  planejado: 'Planejado',
})[status] || status;

const getRecordSummary = (collectionId, record) => {
  if (collectionId === 'workspaceSnapshots') return { title: record.title, detail: record.data?.title || record.data?.name || 'Retrato dos dados coletivos ao encerrar a temporada', status: 'Preservado' };
  if (collectionId === 'studentSubmissions') return { title: record.name || 'Integrante', detail: record.submission?.text || 'Sem entrega ao encerrar o ciclo', status: ({ pending: 'Pendente', approved: 'Aprovada', rejected: 'Devolvida' })[record.submission?.status] || '' };
  if (collectionId === 'tasks') return { title: record.text || 'Tarefa sem título', detail: [record.author, record.dueDate ? `Prazo ${formatArchiveDate(record.dueDate)}` : null].filter(Boolean).join(' · '), status: formatStatus(record.status || 'todo') };
  if (collectionId === 'events') return { title: record.title || 'Evento sem título', detail: [record.date ? formatArchiveDate(record.date) : null, record.time, record.location].filter(Boolean).join(' · '), status: formatStatus(record.status || record.type || 'confirmado') };
  if (collectionId === 'finalSprintAssignments') return { title: `${record.studentName || 'Aluno'} · ${record.frontLabel || 'Frente'}`, detail: record.commitment || record.progressNote || 'Sem atualização registrada', status: formatStatus(record.status || 'planned') };
  if (collectionId === 'finalSprintEvaluations') return { title: `${record.studentName || 'Aluno'} · ${record.type === 'weekly' ? record.weekLabel || 'Avaliação semanal' : record.type === 'presentation' ? 'Apresentação' : 'Relatório'}`, detail: record.improvement || record.strengths || 'Avaliação registrada', status: record.total === undefined ? 'Concluída' : `Nota ${record.total}` };
  if (collectionId === 'finalSprintSelectionScores') return { title: record.studentName || 'Aluno', detail: record.selectionNote || 'Seleção de torneio registrada', status: record.selectedForTournament ? 'Selecionado' : 'Não selecionado' };
  return { title: record.title || record.studentName || record.weekName || record.name || record.date || 'Registro da temporada', detail: record.text || record.reason || record.note || record.description || record.updatedBy || record.appliedBy || (record.score !== undefined ? `${record.score} pontos` : record.studentCount !== undefined ? `${record.studentCount} integrantes` : 'Registro preservado'), status: formatStatus(record.status || '') };
};

export default function SeasonHistoryView({ db, seasons = [], reports = [], reportsEnabled = false }) {
  const archivedSeasons = useMemo(() => seasons.filter((season) => season.status === 'archived'), [seasons]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [recordsByCollection, setRecordsByCollection] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const selectedSeason = archivedSeasons.find((season) => season.id === selectedSeasonId) || archivedSeasons[0] || null;

  useEffect(() => {
    if (archivedSeasons.length && !archivedSeasons.some((season) => season.id === selectedSeasonId)) {
      setSelectedSeasonId(archivedSeasons[0].id);
    }
  }, [archivedSeasons, selectedSeasonId]);

  useEffect(() => {
    if (!db || !selectedSeason?.id) {
      setRecordsByCollection({});
      return undefined;
    }
    let active = true;
    setLoading(true);
    setError('');
    setRecordsByCollection({});
    Promise.all(ARCHIVED_COLLECTIONS.map(async ({ id }) => {
      const source = id === 'workspaceSnapshots' ? collection(db, 'teamSeasons', selectedSeason.id, 'workspace') : id === 'studentSubmissions' ? collection(db, 'teamSeasons', selectedSeason.id, 'students') : id === 'logbook' ? collectionGroup(db, 'logbook') : query(collection(db, id), where('seasonId', '==', selectedSeason.id));
      const snapshot = await getDocs(source);
      const records = snapshot.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id })).filter((record) => (record.seasonId || 'legacy') === selectedSeason.id);
      records.sort((left, right) => String(getRecordDate(right)).localeCompare(String(getRecordDate(left))));
      return [id, records];
    })).then((entries) => {
      if (active) setRecordsByCollection(Object.fromEntries(entries));
    }).catch((loadError) => {
      console.error('Falha ao abrir o histórico da temporada:', loadError);
      if (active) setError('Não foi possível carregar os registros arquivados. Confira a conexão e tente novamente.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [db, selectedSeason?.id]);

  if (!archivedSeasons.length) {
    return (
      <section className="rounded-[26px] border border-white/10 bg-[#121722] p-6 text-center">
        <Archive size={28} className="mx-auto text-cyan-200" />
        <h2 className="mt-3 text-lg font-black text-white">Histórico de temporadas</h2>
        <p className="mt-2 text-sm text-slate-400">As temporadas encerradas aparecerão aqui, com os registros preservados para consulta.</p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(8,145,178,0.12),rgba(15,23,42,0.65))] p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200"><Archive size={14} /> Memória da equipe</p>
            <h2 className="mt-2 text-2xl font-black text-white">Histórico de temporadas</h2>
            <p className="mt-2 text-sm text-slate-300">Consulte tarefas, agenda, avaliações e frentes sem misturar com o ciclo ativo.</p>
          </div>
          <label className="min-w-[220px] text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Temporada arquivada
            <select value={selectedSeason?.id || ''} onChange={(event) => setSelectedSeasonId(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d1322] px-4 py-3 text-sm font-semibold normal-case text-white outline-none focus:border-cyan-300/40">
              {archivedSeasons.map((season) => <option key={season.id} value={season.id}>{season.name || 'Temporada arquivada'}</option>)}
            </select>
          </label>
        </div>
        {selectedSeason && (
          <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold text-slate-300">
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">Encerrada em {formatArchiveDate(selectedSeason.closedAt)}</span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">{selectedSeason.teamSnapshot?.length || 0} integrantes no retrato final</span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">{selectedSeason.weeklyStatsSnapshot?.successfulWeeks || 0} semanas bem-sucedidas</span>
          </div>
        )}
      </section>

      {error && <p role="alert" className="rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-sm text-red-100">{error}</p>}
      {loading ? <p role="status" className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300"><Loader2 size={17} className="animate-spin" />Carregando os registros arquivados…</p> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {ARCHIVED_COLLECTIONS.map(({ id, label, icon: Icon }) => {
            const records = recordsByCollection[id] || [];
            return (
              <section key={id} className="rounded-[22px] border border-white/10 bg-[#121722] p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-black text-white"><Icon size={16} className="text-cyan-200" />{label}</h3>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300">{records.length}</span>
                </div>
                {records.length ? (
                  <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
                    {records.map((record) => {
                      const summary = getRecordSummary(id, record);
                      return (
                        <article key={record.id} className="rounded-[16px] border border-white/7 bg-black/20 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="break-words text-xs font-bold text-slate-100">{summary.title}</h4>
                              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400">{summary.detail}</p>
                            </div>
                            <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-bold text-slate-300">{summary.status}</span>
                          </div>
                          <p className="mt-2 flex items-center gap-1 text-[9px] text-slate-500"><FileText size={11} />{formatArchiveDate(getRecordDate(record))}</p>
                          {(record.text || record.evidence || record.description || record.submission?.text) && <details className="mt-2 text-xs text-slate-300"><summary className="cursor-pointer text-cyan-200">Ler conteúdo completo</summary><p className="mt-2 whitespace-pre-wrap break-words">{record.text || record.evidence || record.description || record.submission?.text}</p></details>}
                          {record.data && <details className="mt-2 text-xs text-slate-300"><summary className="cursor-pointer text-cyan-200">Consultar retrato completo</summary><div className="mt-3"><SnapshotDetails data={record.data} /></div></details>}
                        </article>
                      );
                    })}
                  </div>
                ) : <p className="mt-3 rounded-xl border border-dashed border-white/10 p-4 text-xs text-slate-500">Nenhum registro nesta categoria.</p>}
              </section>
            );
          })}
        </div>
      )}

      {selectedSeason?.teamSnapshot?.length > 0 && (
        <section className="rounded-[22px] border border-white/10 bg-[#121722] p-4 md:p-5">
          <h3 className="flex items-center gap-2 text-sm font-black text-white"><Users size={16} className="text-emerald-200" />Retrato da equipe ao encerrar</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {selectedSeason.teamSnapshot.map((student) => (
              <div key={student.id} className="flex items-center justify-between gap-3 rounded-[16px] border border-white/8 bg-black/20 px-3 py-2.5">
                <span className="min-w-0 truncate text-xs font-bold text-slate-200">{student.name}</span>
                <span className="shrink-0 text-[10px] text-slate-400">{student.xp} XP · {student.station || 'Sem estação'}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="rounded-[22px] border border-white/10 bg-[#121722] p-5"><h3 className="font-bold text-white">Relatórios da temporada</h3>{!reportsEnabled ? <p className="mt-2 text-sm text-slate-400">Entre pelo acesso autenticado para consultar os arquivos dos relatórios.</p> : <div className="mt-3 space-y-2">{reports.filter((report) => (report.seasonId || 'legacy') === selectedSeason?.id).map((report) => <div key={report.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 p-3 text-sm text-slate-300"><span>{report.studentName} · {report.title}</span><button className="rounded-full border border-white/15 px-3 py-2 text-xs" onClick={async () => { const tab = window.open('', '_blank'); if (!tab) { setError('Permita a abertura de uma nova aba para visualizar o arquivo.'); return; } tab.opener = null; try { const result = await getWeeklyReportFile(report.id); tab.location.href = result.url; } catch (issue) { tab.close(); setError(issue.message); } }}>Abrir arquivo</button></div>)}</div>}</section>
    </div>
  );
}
