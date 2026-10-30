import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Check, Download, FileText, LoaderCircle, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { canManageReport, filterWeeklyReports, formatReportSize, localReportDate, validateReportDetails, validateReportFile, weekStartFor } from '../utils/weeklyReports';
import { deleteWeeklyReport, getWeeklyReportFile, markWeeklyReportRead, notifyWeeklyReport, saveWeeklyReport } from '../services/weeklyReports';
import WeeklyDeliveryPanel from '../components/WeeklyDeliveryPanel';
import { reportCalendarWeek, reportWeekIndex } from '../utils/learningProgress';
import { teamCsv } from '../utils/teamExport';
import { downloadBlob } from '../utils/download';

const fieldClass = 'w-full rounded-xl border border-white/15 bg-[#101520] p-3 text-sm text-white outline-none focus:border-cyan-300';
const dateLabel = (value, includeTime = false) => value ? new Date(value.length === 10 ? `${value}T12:00:00Z` : value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}) }) : '';
const emptyFilters = { search: '', student: '', week: '', month: '', year: '' };

function ReportForm({ report, user, defaultWeek, onClose, onSaved }) {
  const today = localReportDate();
  const [details, setDetails] = useState({ title: report?.title || '', week: report?.week || defaultWeek || `Semana de ${dateLabel(weekStartFor(today))}`, reportDate: report?.reportDate || today, description: report?.description || '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = oldOverflow; previous?.focus(); };
  }, []);
  const selectFile = (candidate) => {
    if (saving) return;
    try { validateReportFile(candidate); setFile(candidate); setError(''); }
    catch (issue) { setError(issue.message); }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    try {
      const values = validateReportDetails(details);
      if (file || !report) validateReportFile(file);
      setError(''); setSaving(true); setProgress(0);
      const result = await saveWeeklyReport({ id: report?.id, details: values, file, onProgress: setProgress });
      onSaved(result.report, !report);
    } catch (issue) { setError(issue.message); }
    finally { setSaving(false); }
  };
  const handleDialogKeys = (event) => {
    if (event.key === 'Escape' && !saving) onClose();
    if (event.key === 'Tab') {
      const controls = [...event.currentTarget.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled])')].filter((element) => element.type !== 'file');
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  };
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="report-form-title" onKeyDown={handleDialogKeys} className="newgears-modal-frame newgears-modal-scrollable max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#151925] p-5 md:p-7">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-cyan-200">Memória compartilhada da equipe</p><h2 id="report-form-title" className="mt-2 text-2xl font-black text-white">{report ? 'Editar relatório' : 'Novo relatório'}</h2></div><button ref={closeRef} type="button" aria-label="Fechar formulário" disabled={saving} onClick={onClose} className="rounded-lg border border-white/10 p-2 text-gray-300 disabled:opacity-40"><X size={18} /></button></div>
        <p className="mt-4 rounded-xl bg-white/5 p-3 text-xs text-gray-300">Autor: <strong className="text-white">{report?.studentName || user.name}</strong> · {report?.studentEmail || user.email}</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-xs font-bold text-gray-300">Título do relatório<input required maxLength={160} disabled={saving} value={details.title} onChange={(event) => setDetails({ ...details, title: event.target.value })} className={`${fieldClass} mt-2`} placeholder="Ex.: Pesquisa sobre sensores do robô" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-bold text-gray-300">Semana<input required maxLength={80} disabled={saving} value={details.week} onChange={(event) => setDetails({ ...details, week: event.target.value })} className={`${fieldClass} mt-2`} placeholder="Ex.: Semana 3" /></label><label className="block text-xs font-bold text-gray-300">Data do relatório<input type="date" required disabled={saving} value={details.reportDate} onChange={(event) => setDetails({ ...details, reportDate: event.target.value })} className={`${fieldClass} mt-2`} /></label></div>
          <label className="block text-xs font-bold text-gray-300">Descrição / resumo (opcional)<textarea maxLength={4000} rows={3} disabled={saving} value={details.description} onChange={(event) => setDetails({ ...details, description: event.target.value })} className={`${fieldClass} mt-2 resize-y`} placeholder="Conte rapidamente o que pesquisou, desenvolveu ou testou." /></label>
          <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" disabled={saving} onChange={(event) => { if (event.target.files?.[0]) selectFile(event.target.files[0]); event.target.value = ''; }} />
          <button type="button" disabled={saving} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); if (!saving) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); if (event.dataTransfer.files.length !== 1) { setError('Selecione apenas um arquivo por relatório.'); return; } selectFile(event.dataTransfer.files[0]); }} className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center disabled:opacity-60 ${dragging ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/20 bg-black/15 hover:border-cyan-300/50'}`}>
            <Upload size={25} className="text-cyan-200" /><span className="text-sm font-bold text-white">{file ? file.name : report ? 'Clique ou arraste para substituir o arquivo' : 'Clique ou arraste seu relatório aqui'}</span><span className="text-xs text-gray-400">{file ? formatReportSize(file.size) : 'PDF, DOC ou DOCX · até 10 MB'}</span>
          </button>
          {report && !file && <p className="break-all text-xs text-gray-400">Arquivo atual: {report.fileName} · {formatReportSize(report.fileSize)}. Será mantido se você não escolher outro.</p>}
          {saving && <div role="status" aria-live="polite"><div className="flex justify-between text-xs text-cyan-100"><span>{progress >= 99 ? 'Validando e salvando o relatório…' : 'Enviando arquivo…'}</span><span>{progress}%</span></div><progress value={progress} max="100" className="mt-2 h-2 w-full accent-cyan-300" /></div>}
          {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4"><button type="button" disabled={saving} onClick={onClose} className="rounded-xl border border-white/15 px-4 py-3 text-sm text-gray-300 disabled:opacity-40">Cancelar</button><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}{saving ? 'Salvando…' : report ? 'Salvar alterações' : 'Publicar relatório'}</button></div>
        </form>
      </section>
    </div>
  );
}

export default function WeeklyReportsView({ user, workspace, defaultWeek, focusedReportId = '', students = [], seasonId = 'legacy', reportDueDay = 5 }) {
  const { readIds, loading, error, enabled, retry } = workspace;
  const focusedReport = focusedReportId ? workspace.reports.find((report) => report.id === focusedReportId) : null;
  const viewedSeasonId = focusedReport ? focusedReport.seasonId || 'legacy' : seasonId;
  const reports = workspace.reports.filter((report) => (report.seasonId || 'legacy') === viewedSeasonId);
  const [filters, setFilters] = useState(emptyFilters);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [formReport, setFormReport] = useState(undefined);
  const [notice, setNotice] = useState(null);
  const [busyId, setBusyId] = useState('');
  const options = useMemo(() => ({ students: [...new Map(reports.map((report) => [report.userId, report.studentName])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR')), weeks: [...new Set(reports.map((report) => report.week))].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true })), years: [...new Set(reports.map((report) => report.reportDate?.slice(0, 4)).filter(Boolean))].sort().reverse() }), [reports]);
  const [calendarWeek, setCalendarWeek] = useState('');
  const indexedWeeks = reportWeekIndex(reports);
  const filtered = filterWeeklyReports(reports, filters).filter((report) => (!calendarWeek || reportCalendarWeek(report) === calendarWeek) && (!onlyUnread || (report.userId !== user?.uid && !readIds.has(report.id))));
  useEffect(() => {
    if (!focusedReportId || loading) return;
    document.getElementById(`weekly-report-${focusedReportId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusedReportId, loading, reports.length]);
  const saved = (report, isNew) => {
    setFormReport(undefined);
    setNotice({ success: true, message: isNew ? 'Relatório publicado. A equipe já pode acessá-lo no sistema.' : 'Relatório atualizado.' });
    if (isNew) notifyWeeklyReport(report.id).then((result) => {
      if (result.emailStatus !== 'sent') setNotice({ success: true, message: result.message || 'Relatório publicado. As notificações por e-mail estão sendo processadas.' });
    }).catch(() => setNotice({ success: true, message: 'Relatório publicado. O e-mail não pôde ser enviado; o aviso interno continua disponível. Use “Tentar e-mail novamente” no card.' }));
  };
  const openFile = async (report, download) => {
    const popup = window.open('', '_blank');
    if (popup) { popup.opener = null; popup.document.title = 'Abrindo relatório…'; }
    setBusyId(report.id); setNotice(null);
    try {
      const { url } = await getWeeklyReportFile(report.id, download);
      if (popup) popup.location.replace(url); else window.location.assign(url);
      markWeeklyReportRead(report.id).catch(() => setNotice({ success: false, message: 'O arquivo abriu, mas não foi possível atualizar o indicador de leitura.' }));
    } catch (issue) { popup?.close(); setNotice({ success: false, message: issue.message }); }
    finally { setBusyId(''); }
  };
  const runAction = async (report, operation, message) => {
    setBusyId(report.id); setNotice(null);
    try { await operation(); if (message) setNotice({ success: true, message }); }
    catch (issue) { setNotice({ success: false, message: issue.message }); }
    finally { setBusyId(''); }
  };
  if (!enabled) return <section className="newgears-major-panel rounded-2xl border border-white/10 bg-[#121722] p-6"><h2 className="text-2xl font-black text-white">Relatórios Semanais</h2><p className="mt-3 text-sm leading-relaxed text-gray-300">Esta área estará disponível quando o técnico ativar o acesso autenticado da equipe. Seus registros atuais continuam disponíveis nas outras abas.</p></section>;
  return (
    <div className="space-y-5 text-left">
      <section className="newgears-major-panel rounded-[28px] border border-cyan-300/15 bg-gradient-to-br from-[#142c38] to-[#121722] p-5 md:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-200"><FileText size={15} /> Aprendizados compartilhados</p><h2 className="mt-3 text-3xl font-black text-white">Relatórios Semanais</h2><p className="mt-3 max-w-2xl text-sm text-gray-300">Pesquisas, testes e desenvolvimentos dos alunos em um lugar que toda a equipe pode consultar.</p></div><button onClick={() => setFormReport(null)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950"><Plus size={17} /> Novo relatório</button></div></section>
      <section className="rounded-2xl border border-white/10 p-4"><div className="flex flex-wrap items-end gap-3"><label className="text-xs text-slate-300">Semana por data<select aria-label="Semana dos relatórios por data" value={calendarWeek} onChange={(event) => setCalendarWeek(event.target.value)} className={fieldClass}><option value="">Todas as datas</option>{indexedWeeks.map((item) => <option key={item.week} value={item.week}>{item.week} · {item.reports} relatório(s), {item.authors} autor(es)</option>)}</select></label><button type="button" className="ng-button" onClick={() => { setFilters(emptyFilters); setCalendarWeek(weekStartFor(localReportDate())); setOnlyUnread(false); }}>Semana atual</button><button type="button" className="ng-button" onClick={() => { setFilters({ ...emptyFilters, student: user.uid }); setCalendarWeek(''); setOnlyUnread(false); }}>Minha autoria</button><button type="button" className="ng-button" disabled={loading || Boolean(error) || !filtered.length} onClick={() => downloadBlob(new Blob([teamCsv(['Semana', 'Data', 'Responsável', 'Título', 'Descrição', 'Documento', 'Leitura'], filtered.map((report) => [report.week, report.reportDate, report.studentName, report.title, report.description, report.fileName, readIds.has(report.id) ? 'Lido' : 'Não marcado como lido']))], { type: 'text/csv;charset=utf-8' }), 'indice-relatorios.csv')}>Exportar índice filtrado</button></div><p className="mt-3 text-xs text-slate-400">O índice exporta somente os metadados dos relatórios visíveis. Não inclui arquivos, notas privadas ou links de download.</p></section>
      {notice && <p role="status" aria-live="polite" className={`rounded-xl border p-3 text-sm ${notice.success ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'border-red-300/20 bg-red-300/10 text-red-100'}`}>{notice.message}</p>}
      {error && <div role="alert" className="rounded-xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">{error}<button onClick={retry} className="ml-3 font-bold underline">Tentar novamente</button></div>}
      <section className="rounded-2xl border border-white/10 bg-[#121722] p-4"><label className="relative block"><Search size={16} className="absolute left-3 top-3.5 text-gray-400" /><input aria-label="Buscar relatórios" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} className={`${fieldClass} pl-10`} placeholder="Buscar aluno, título ou descrição…" /></label><div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <select aria-label="Filtrar por aluno" value={filters.student} onChange={(event) => setFilters({ ...filters, student: event.target.value })} className={fieldClass}><option value="">Todos os alunos</option>{options.students.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
        <select aria-label="Filtrar por semana" value={filters.week} onChange={(event) => setFilters({ ...filters, week: event.target.value })} className={fieldClass}><option value="">Todas as semanas</option>{options.weeks.map((week) => <option key={week} value={week}>{week}</option>)}</select>
        <select aria-label="Filtrar por mês" value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })} className={fieldClass}><option value="">Todos os meses</option>{Array.from({ length: 12 }, (_, index) => { const month = String(index + 1).padStart(2, '0'); return <option key={month} value={month}>{new Date(2020, index, 1).toLocaleDateString('pt-BR', { month: 'long' })}</option>; })}</select>
        <select aria-label="Filtrar por ano" value={filters.year} onChange={(event) => setFilters({ ...filters, year: event.target.value })} className={fieldClass}><option value="">Todos os anos</option>{options.years.map((year) => <option key={year}>{year}</option>)}</select>
      </div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={onlyUnread} onChange={(event) => setOnlyUnread(event.target.checked)} className="accent-cyan-300" /><Bell size={13} /> Apenas não lidos</label><button onClick={() => { setFilters(emptyFilters); setOnlyUnread(false); setCalendarWeek(''); }} className="text-xs text-cyan-200 hover:underline">Limpar filtros</button></div></section>
      {viewedSeasonId !== seasonId && <p className="rounded-xl border border-amber-300/20 p-3 text-sm text-amber-100">Você está consultando um relatório de uma temporada anterior.</p>}
      {user.type === 'admin' && viewedSeasonId === seasonId && !loading && !error && <WeeklyDeliveryPanel students={students} reports={reports} seasonId={seasonId} dueDay={reportDueDay} />}
      <p className="text-xs text-gray-400">{filtered.length} relatório(s) · mais recentes primeiro</p>
      {focusedReportId && !loading && !error && !reports.some((report) => report.id === focusedReportId) && <p role="status" className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">O relatório deste link não foi encontrado. Ele pode ter sido excluído; os demais registros da equipe estão abaixo.</p>}
      {loading ? <p role="status" className="flex items-center gap-2 p-6 text-sm text-gray-300"><LoaderCircle size={18} className="animate-spin" />Carregando relatórios…</p> : !filtered.length && !error ? <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center"><FileText size={28} className="mx-auto text-cyan-200" /><h3 className="mt-3 font-bold text-white">{reports.length ? 'Nenhum relatório encontrado' : 'Compartilhe o primeiro relatório da equipe'}</h3><p className="mt-2 text-sm text-gray-400">{reports.length ? 'Ajuste a busca ou os filtros.' : 'Publique uma pesquisa, um teste ou um desenvolvimento para todos acompanharem.'}</p></div> : null}
      <section className="grid gap-4 xl:grid-cols-2">{filtered.map((report) => {
        const own = report.userId === user.uid; const read = own || readIds.has(report.id); const manage = canManageReport(user, report); const busy = busyId === report.id;
        return <article key={report.id} id={`weekly-report-${report.id}`} className={`scroll-mt-24 rounded-[24px] border bg-[#141925] p-5 ${focusedReportId === report.id ? 'border-cyan-300 ring-1 ring-cyan-300/40' : 'border-white/10'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">{report.week}</span><span className={`text-xs ${read ? 'text-gray-400' : 'font-bold text-amber-200'}`}>{own ? 'Seu relatório' : read ? 'Lido' : '● Não lido'}</span></div>
          <h3 className="mt-4 text-lg font-black text-white">{report.title}</h3><p className="mt-2 text-sm font-bold text-gray-200">{report.studentName}</p><p className="mt-1 break-all text-xs text-gray-400">{report.studentEmail}</p><p className="mt-2 text-xs text-gray-400">Data: {dateLabel(report.reportDate)} · Enviado em {dateLabel(report.createdAt, true)}</p>
          {report.description && <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-300">{report.description}</p>}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/5 p-3"><FileText size={17} className="mt-0.5 shrink-0 text-cyan-200" /><div className="min-w-0"><p className="break-all text-xs font-bold text-gray-200">{report.fileExtension?.toUpperCase()} — {report.fileName}</p><p className="mt-1 text-xs text-gray-400">{formatReportSize(report.fileSize)}</p></div></div>
          <div className="mt-4 flex flex-wrap gap-2">{report.fileExtension === 'pdf' && <button disabled={busy} onClick={() => openFile(report, false)} className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950 disabled:opacity-50">Visualizar PDF</button>}<button disabled={busy} onClick={() => openFile(report, true)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-gray-200 disabled:opacity-50"><Download size={13} />Baixar{report.fileExtension !== 'pdf' ? ' Word' : ''}</button>{!read && <button disabled={busy} onClick={() => runAction(report, () => markWeeklyReportRead(report.id))} className="inline-flex items-center gap-1.5 px-2 py-2 text-xs text-cyan-200"><Check size={13} />Marcar como lido</button>}{manage && <><button disabled={busy} onClick={() => setFormReport(report)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300"><Pencil size={13} />Editar</button><button disabled={busy} onClick={() => { if (window.confirm(`Excluir “${report.title}” e seu arquivo? Esta ação não pode ser desfeita.`)) runAction(report, () => deleteWeeklyReport(report.id), 'Relatório excluído.'); }} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300/15 px-3 py-2 text-xs text-red-200"><Trash2 size={13} />Excluir</button></>}</div>
          {manage && <div className="mt-4 border-t border-white/5 pt-3 text-xs text-gray-400"><p>E-mail: {({ sent: 'envio concluído', sending: 'processando', failed: 'falha no envio', not_configured: 'aguardando configuração', pending: 'aguardando envio' })[report.emailStatus] || 'aguardando envio'}</p>{report.emailStatus !== 'sent' && <button disabled={busy} onClick={() => runAction(report, async () => { const result = await notifyWeeklyReport(report.id); setNotice({ success: result.emailStatus === 'sent', message: result.emailStatus === 'sent' ? 'Envio de e-mail concluído.' : result.message || 'Envio em processamento.' }); })} className="mt-2 font-bold text-cyan-200 hover:underline disabled:opacity-50">Tentar e-mail novamente</button>}</div>}
        </article>;
      })}</section>
      {formReport !== undefined && <ReportForm report={formReport} user={user} defaultWeek={defaultWeek} onClose={() => setFormReport(undefined)} onSaved={saved} />}
    </div>
  );
}
