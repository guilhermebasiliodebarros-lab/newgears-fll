import { Bell, ChevronRight, FileText } from 'lucide-react';
import { localReportDate, weekStartFor } from '../utils/weeklyReports';

export default function WeeklyReportsSummary({ workspace, onOpen }) {
  if (!workspace.enabled) return null;
  const { reports, unreadReports, loading, error } = workspace;
  const weekStart = weekStartFor(localReportDate());
  const count = reports.filter((report) => report.weekStart === weekStart).length;
  const latest = reports[0];
  const latestDate = latest?.createdAt ? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(latest.createdAt)) : '';
  const latestLabel = latestDate === localReportDate() ? 'hoje' : latestDate.split('-').reverse().join('/');
  return <section className="newgears-major-panel mb-6 rounded-2xl border border-cyan-300/15 bg-[#121722] p-4 text-left md:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 font-black text-white"><FileText size={17} className="text-cyan-200" />Relatórios da equipe</h3><p className="mt-2 text-xs text-gray-400">{loading ? 'Carregando relatórios…' : error ? 'Não foi possível carregar. Abra a aba para tentar novamente.' : `Esta semana: ${count} relatório(s) · ${unreadReports.length} não lido(s)`}</p>{latest && <p className="mt-1 text-xs text-gray-300">Último relatório: {latest.studentName} — {latestLabel} · {latest.title}</p>}</div><button onClick={() => onOpen()} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-bold text-cyan-100">Ver todos<ChevronRight size={14} /></button></div>
    {unreadReports.length > 0 && <div className="mt-4 space-y-2 border-t border-white/10 pt-3">{unreadReports.slice(0, 3).map((report) => <button key={report.id} onClick={() => onOpen(report.id)} className="flex w-full items-start gap-2 rounded-lg bg-cyan-300/5 p-2.5 text-left text-xs text-cyan-100 hover:bg-cyan-300/10"><Bell size={13} className="mt-0.5 shrink-0" /><span>{report.studentName} publicou um novo relatório — {report.week}</span></button>)}</div>}
  </section>;
}
