import { useContext, useEffect, useRef, useState } from 'react';
import { Download, LockKeyhole, Save } from 'lucide-react';
import { GearShopContext } from '../hooks/useGearShopContext';
import { loadCoachingHistory, loadCoachingStatus, saveCoachingObservation } from '../services/weeklyReports';
import { COACHING_CRITERIA, COACHING_LEVELS, coachingTrend, validateCoachingObservation } from '../utils/coaching';
import { localReportDate } from '../utils/weeklyReports';
import { teamCsv } from '../utils/teamExport';
import { downloadBlob } from '../utils/download';
import './TeamLearning.css';

const empty = () => ({ id: crypto.randomUUID(), date: localReportDate(), ratings: {}, strength: '', nextStep: '', note: '' });
export default function CoachingPanel({ students }) {
  const { user, seasonId } = useContext(GearShopContext);
  if (user?.type !== 'admin') return null;
  if (!user.uid) return <section className="learning-panel"><h3>Acompanhamento privado</h3><p className="learning-hint">Esta área exige a conta do técnico no Firebase Authentication. O acesso legado continua nas outras funções; observações privadas não serão guardadas sem autenticação.</p></section>;
  return <CoachingWorkspace key={`${user.uid}:${seasonId}`} students={students} seasonId={seasonId} />;
}

function CoachingWorkspace({ students, seasonId }) {
  const [chosen, setSelected] = useState(() => String(students[0]?.id || ''));
  const selected = chosen || String(students[0]?.id || '');
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState(null);
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({});
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [criterion, setCriterion] = useState('participation');
  const busy = useRef(false);
  const scope = JSON.stringify([seasonId, selected]);
  const history = state.scope === scope ? state.records || [] : [];
  const ready = status?.ready === true;
  useEffect(() => {
    const abort = new AbortController();
    loadCoachingStatus(abort.signal).then((result) => { if (!abort.signal.aborted) setStatus(result); }).catch((error) => { if (!abort.signal.aborted) setStatus({ ready: false, message: error.message }); });
    return () => abort.abort();
  }, [retry]);
  useEffect(() => {
    if (!ready || !selected) return;
    const abort = new AbortController();
    loadCoachingHistory(seasonId, selected, '', abort.signal).then((result) => { if (!abort.signal.aborted) setState({ scope, records: result.records, cursor: result.cursor, loaded: true }); }).catch((error) => { if (!abort.signal.aborted) setState({ scope, records: [], loaded: true, error: error.message }); });
    return () => abort.abort();
  }, [ready, scope, seasonId, selected, retry]);
  const patch = (values) => { if (!chosen) setSelected(selected); setForm((current) => ({ ...current, ...values })); };
  const save = async (event) => {
    event.preventDefault(); if (busy.current) return;
    let data;
    try { data = validateCoachingObservation({ ...form, seasonId, studentId: selected }); }
    catch (error) { setNotice(error.message); return; }
    busy.current = true; setSaving(true); setNotice('');
    try {
      const { record } = await saveCoachingObservation(data);
      setState((current) => ({ ...current, scope, records: [record, ...(current.scope === scope ? current.records || [] : []).filter((item) => item.id !== record.id)], loaded: true }));
      setForm(empty()); setNotice('Observação privada salva. Ela não altera XP, notas ou ranking e não aparece para alunos.');
    } catch (error) { setNotice(`${error.message} Seu preenchimento permanece nesta tela.`); }
    finally { busy.current = false; setSaving(false); }
  };
  const more = async () => {
    if (busy.current) return; busy.current = true; setSaving(true);
    try { const result = await loadCoachingHistory(seasonId, selected, state.cursor); setState((current) => ({ ...current, records: [...new Map([...current.records, ...result.records].map((record) => [record.id, record])).values()], cursor: result.cursor })); }
    catch (error) { setNotice(error.message); }
    finally { busy.current = false; setSaving(false); }
  };
  const trend = coachingTrend(history, criterion);
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const exportHistory = () => downloadBlob(new Blob([teamCsv(['Data', 'Integrante', ...COACHING_CRITERIA.map((item) => item.label), 'Ponto forte', 'Próximo passo', 'Anotação privada'], sorted.map((record) => [record.date, record.studentName, ...COACHING_CRITERIA.map((item) => COACHING_LEVELS[record.ratings[item.id] || 0].label), record.strength, record.nextStep, record.note]))], { type: 'text/csv;charset=utf-8' }), `acompanhamento-privado-${localReportDate()}.csv`);
  return <section className="learning-panel">
    <header className="learning-header"><div><p className="ng-eyebrow"><LockKeyhole size={14} /> Somente técnico autenticado</p><h3>Acompanhamento privado</h3><p>Observações internas de aprendizagem. Não são rubricas oficiais e não modificam as avaliações compartilhadas, o XP ou a seleção de torneio.</p></div></header>
    {!ready ? <div className="learning-hint" role="status"><p>{status?.message || 'Conferindo acesso privado no servidor…'}</p><div className="learning-actions"><button type="button" className="ng-button" onClick={() => setRetry((value) => value + 1)}>Conferir novamente</button></div></div> : <>
      <label>Integrante<select aria-label="Integrante" disabled={saving} value={selected} onChange={(event) => { if ((Object.values(form.ratings).some((value) => value > 0) || form.strength || form.nextStep || form.note) && !window.confirm('Trocar de integrante e descartar esta observação ainda não enviada?')) return; setSelected(event.target.value); setForm(empty()); setNotice(''); }}>{students.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
      {selected ? <form onSubmit={save} className="mt-5 space-y-4"><label>Data da observação<input aria-label="Data da observação" type="date" required value={form.date} disabled={saving} onChange={(event) => patch({ date: event.target.value })} /></label>
        <p className="learning-muted">Marque somente o que observou. “Não observado” não é uma nota zero e não entra no gráfico.</p>
        {COACHING_CRITERIA.map((item) => <fieldset key={item.id}><legend>{item.label}</legend><div className="learning-actions">{COACHING_LEVELS.map((level) => <button key={level.id} type="button" className="ng-button" disabled={saving} aria-label={`${item.label}: ${level.label}`} aria-pressed={(form.ratings[item.id] || 0) === level.id} onClick={() => patch({ ratings: { ...form.ratings, [item.id]: level.id } })}>{level.label}</button>)}</div></fieldset>)}
        <div className="learning-form-grid"><label>Ponto forte<textarea aria-label="Ponto forte" maxLength={1200} rows={2} value={form.strength} disabled={saving} onChange={(event) => patch({ strength: event.target.value })} /></label><label>Próximo passo individual<textarea aria-label="Próximo passo individual" maxLength={1200} rows={2} value={form.nextStep} disabled={saving} onChange={(event) => patch({ nextStep: event.target.value })} /></label></div>
        <label>Anotação privada do técnico<textarea aria-label="Anotação privada do técnico" maxLength={2000} rows={2} value={form.note} disabled={saving} onChange={(event) => patch({ note: event.target.value })} /></label>
        <p className="learning-muted">O preenchimento fica apenas em memória até salvar. Não é guardado no armazenamento do navegador nem enviado ao Giro.</p>
        <button type="submit" className="ng-button ng-button--primary" disabled={saving || !students.some((person) => String(person.id) === selected) || !Object.values(form.ratings).some((value) => value > 0)}><Save size={15} />{saving ? 'Salvando…' : 'Salvar observação privada'}</button>
      </form> : <p className="learning-hint">Cadastre um integrante para começar.</p>}
      {notice && <p className="learning-hint" role="status">{notice}</p>}
      <section className="mt-6" aria-label="Histórico privado"><div className="learning-header"><h4>Histórico e evolução individual</h4><button type="button" className="ng-button" disabled={!history.length} onClick={exportHistory}><Download size={14} />Exportar registros carregados</button></div>
        {!selected ? <p className="learning-hint">Selecione um integrante para consultar o histórico.</p> : state.scope !== scope || !state.loaded ? <p role="status">Carregando observações…</p> : state.error ? <p role="alert">{state.error}<button type="button" className="ng-button" onClick={() => setRetry((value) => value + 1)}>Tentar novamente</button></p> : <>
          <label className="mt-4">Dimensão no gráfico<select aria-label="Dimensão no gráfico" value={criterion} onChange={(event) => setCriterion(event.target.value)}>{COACHING_CRITERIA.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          {trend.length > 1 && <svg viewBox="0 0 500 130" className="mt-4 w-full max-w-2xl" role="img" aria-label={`Evolução de ${COACHING_CRITERIA.find((item) => item.id === criterion).label}; valores detalhados na tabela seguinte`}><path d="M15 15V115H485" fill="none" stroke="#64748b" /><path d={trend.map((row, index) => `${index ? 'L' : 'M'}${20 + index / (trend.length - 1) * 460},${115 - row.score * 30}`).join(' ')} fill="none" stroke="#c4b5fd" strokeWidth="3" />{trend.map((row, index) => <circle key={row.id} cx={20 + index / (trend.length - 1) * 460} cy={115 - row.score * 30} r="4" fill="#67e8f9"><title>{row.date}: {COACHING_LEVELS[row.score].label}</title></circle>)}</svg>}
          <div className="overflow-x-auto"><table><caption className="py-3 text-left text-xs text-slate-300">Registros observados nesta dimensão · ordem de data</caption><thead><tr><th>Data</th><th>Observação</th></tr></thead><tbody>{trend.map((row) => <tr key={row.id}><td>{row.date}</td><td>{COACHING_LEVELS[row.score].label}</td></tr>)}</tbody></table></div>
          {!history.length && <p className="learning-hint">Nenhuma observação privada registrada para este integrante nesta temporada.</p>}
          {sorted.map((record) => <details key={record.id} className="learning-history"><summary>{record.date} · {record.evaluatorName}</summary><p>Ponto forte: {record.strength || 'Não registrado'}</p><p>Próximo passo: {record.nextStep || 'Não registrado'}</p><p className="whitespace-pre-wrap">Anotação privada: {record.note || 'Não registrada'}</p></details>)}
          {state.cursor && <button type="button" className="ng-button mt-4" disabled={saving} onClick={more}>Carregar mais 100 registros</button>}
        </>}
      </section>
    </>}
  </section>;
}
