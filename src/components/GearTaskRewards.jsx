import { useEffect, useId, useRef, useState } from 'react';
import { Coins, Gift, History, RefreshCw } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import { grantStudentGears, subscribeGearGrants } from '../services/gearGrants';
import { gearShopError } from '../services/gearShop';
import { GEAR_GRANT_MAX, GEAR_GRANT_REASON_MAX } from '../utils/gearGrants';
import DraftForm from './DraftForm';

const grantDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data indisponível' : date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

function GrantHistory({ studentId, db, user }) {
  const [state, setState] = useState({ studentId: '', rows: [], loading: true, error: '' });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!studentId || !db) return;
    let active = true;
    const unsubscribe = subscribeGearGrants({ db, user, studentId, includeTasks: true,
      onData: (rows) => { if (active) setState({ studentId, rows, loading: false, error: '' }); },
      onError: (error) => { if (active) setState({ studentId, rows: [], loading: false, error: gearShopError(error) }); },
    });
    return () => { active = false; unsubscribe(); };
  }, [db, user, studentId, retry]);
  if (!studentId) return <p className="text-xs text-slate-400">Escolha um aluno para consultar as concessões por tarefas.</p>;
  const current = state.studentId === studentId ? state : { rows: [], loading: true, error: '' };
  return <div className="space-y-3"><h4 className="flex items-center gap-2 text-sm font-bold text-cyan-100"><History size={16} />Últimas concessões de Gears</h4>
    {current.loading && <p role="status" className="text-xs text-slate-400">Carregando concessões…</p>}
    {current.error && <div role="alert" className="text-xs text-amber-100">{current.error}<button type="button" onClick={() => setRetry((value) => value + 1)} className="ml-3 inline-flex items-center gap-1 underline"><RefreshCw size={13} />Tentar novamente</button></div>}
    {!current.loading && !current.error && !current.rows.length && <p className="text-xs text-slate-400">Nenhuma concessão por tarefa registrada para este aluno.</p>}
    <ul className="space-y-2">{current.rows.map((grant) => <li key={grant.id} className="rounded-xl border border-white/10 bg-black/15 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-amber-100">+{grant.coins} Gears</strong><span className="text-[10px] text-slate-400">{grantDate(grant.createdAt)}</span></div><p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-200">{grant.reason}</p><p className="mt-2 text-[10px] text-slate-400">{grant.source === 'kanban' ? 'Kanban · ' : ''}Concedidos por {grant.actorName || 'Técnico'}</p></li>)}</ul>
    {!current.loading && current.rows.length === 10 && <p className="text-[10px] text-slate-500">Mostrando as dez concessões mais recentes.</p>}
  </div>;
}

export default function GearTaskRewards() {
  const { db, user, account, teamMembers = [], seasonId = 'legacy' } = useGearShopContext();
  const technician = user?.type === 'admin';
  const [selectedId, setSelectedId] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const running = useRef(false);
  const prefix = useId();
  const members = [...teamMembers].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
  const selected = members.find((member) => member.id === selectedId);
  if (!technician && user?.type !== 'student') return null;
  const submit = async (event, { draftId }) => {
    if (running.current) return false;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const studentId = String(fields.get('studentId') || '');
    if (!members.some((member) => member.id === studentId)) { setError('Escolha um aluno ativo da equipe.'); return false; }
    running.current = true; setSaving(true); setError(''); setNotice('');
    try {
      const result = await grantStudentGears({ db, user, studentId, coins: Number(fields.get('coins')), reason: String(fields.get('reason') || ''), grantId: draftId, seasonId });
      setSelectedId(studentId);
      setNotice(result.duplicate ? 'Esta concessão já estava registrada. O envio não foi creditado novamente.' : `${result.coins} Gears concedidos a ${members.find((member) => member.id === studentId).name}!`);
      form.elements.namedItem('reason').value = '';
      return true;
    } catch (issue) { setError(gearShopError(issue)); return false; }
    finally { running.current = false; setSaving(false); }
  };
  return <section className="rounded-2xl border border-amber-200/20 bg-gradient-to-br from-amber-200/5 to-cyan-300/5 p-5 md:p-6" aria-label={technician ? 'Conceder Gears por tarefas' : 'Gears recebidos por tarefas'}>
    <div className="mb-5"><h3 className="flex items-center gap-2 text-xl font-black text-white"><Gift size={21} className="text-amber-200" />{technician ? 'Gears por tarefas' : 'Reconhecimentos do técnico'}</h3><p className="mt-2 text-xs leading-relaxed text-slate-300">{technician ? 'Reconheça uma tarefa concluída: escolha o aluno, defina o valor e registre o motivo. Os Gears entram na carteira da loja.' : 'Confira os Gears que o técnico concedeu pelas suas tarefas e contribuições.'}</p></div>
    {technician && <DraftForm kind="gear-grant" onSubmit={submit} className="mb-5">
      <fieldset disabled={saving || !members.length} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]"><label className="block text-xs font-bold text-slate-200" htmlFor={`${prefix}-student`}>Aluno<select id={`${prefix}-student`} name="studentId" required defaultValue="" onChange={(event) => { setSelectedId(event.target.value); setNotice(''); }} className="mt-2 w-full rounded-xl border border-white/20 bg-[#101a2b] p-3 text-sm text-white"><option value="">Selecione um aluno</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label><label className="block text-xs font-bold text-slate-200" htmlFor={`${prefix}-coins`}>Quantidade de Gears<input id={`${prefix}-coins`} name="coins" type="number" inputMode="numeric" min="1" max={GEAR_GRANT_MAX} step="1" defaultValue="10" required className="mt-2 w-full rounded-xl border border-white/20 bg-black/25 p-3 text-sm text-white" /></label></div>
        <label className="block text-xs font-bold text-slate-200" htmlFor={`${prefix}-reason`}>Tarefa / motivo<textarea id={`${prefix}-reason`} name="reason" required minLength={3} maxLength={GEAR_GRANT_REASON_MAX} rows={3} placeholder="Ex.: concluiu os testes da garra e registrou os resultados." className="mt-2 block w-full resize-y rounded-xl border border-white/20 bg-black/25 p-3 text-sm text-white" /></label>
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[11px] leading-relaxed text-slate-400">De 1 a 10.000 Gears por concessão. O motivo fica visível para o aluno.</p><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-amber-200 px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-40"><Coins size={16} />{saving ? 'Concedendo…' : 'Conceder Gears'}</button></div>
      </fieldset>
      {!members.length && <p className="mt-3 text-xs text-amber-100">Cadastre um aluno ativo para começar a conceder Gears.</p>}
    </DraftForm>}
    {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-xs text-emerald-100">{notice}</p>}
    {error && <p role="alert" className="mb-4 rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-xs text-rose-100">{error}</p>}
    {technician && selected && <p className="mb-3 text-xs font-bold text-slate-200">Histórico de {selected.name}</p>}
    <GrantHistory studentId={technician ? selected?.id || '' : account.studentId} db={db} user={user} />
  </section>;
}
