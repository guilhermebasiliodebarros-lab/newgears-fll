import { History, RefreshCw } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';

export default function GearHistoryPanel() {
  const { isStudent, history, syncHistory } = useGearShopContext();
  if (isStudent || !history) return null;
  const summary = history.summary;
  return <section className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-sm font-black text-cyan-100"><History size={16} />Histórico da equipe e check-ins</h3><p className="mt-2 text-xs leading-relaxed text-slate-300">{history.loading ? `Reconhecendo o histórico: ${summary?.processed || 0} de ${summary?.total || '…'} registros.` : summary?.completedAt ? 'Histórico reconhecido. Os alunos já podem conferir seus Gears, níveis e movimentos.' : 'Reconheça os registros antigos, check-ins e valores cortados pelo limite anterior para toda a equipe.'}</p></div><button type="button" disabled={history.loading} onClick={syncHistory} className="inline-flex items-center gap-2 rounded-xl border border-cyan-200/30 px-4 py-2 text-xs font-bold text-cyan-100 disabled:opacity-50"><RefreshCw size={14} />{history.loading ? 'Conferindo…' : 'Conferir histórico'}</button></div>
    {history.error ? <p role="alert" className="mt-3 text-xs text-amber-100">{history.error} Os créditos já confirmados serão preservados. Tentar novamente não duplica recompensas.</p> : null}
    {summary ? <p className="mt-3 text-xs text-slate-400">{summary.total} registros com autoria confirmada · {summary.checkins || 0} check-ins com novos créditos · {summary.coins} Gears e {summary.points} pontos reconhecidos nesta conferência.</p> : null}
    {summary?.unresolved?.length ? <details className="mt-4 text-xs text-slate-400"><summary className="cursor-pointer text-amber-100">{summary.unresolved.length} registro(s) sem autoria confirmada</summary><p className="mt-2 leading-relaxed">Não foram atribuídos a nenhum aluno. Confira os autores nos registros originais antes de repetir a conferência.</p><ul className="mt-2 space-y-1">{summary.unresolved.map((item) => <li key={`${item.type}:${item.sourceId}`}>{item.title}</li>)}</ul></details> : null}
  </section>;
}
