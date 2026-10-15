import { useState } from 'react';
import { LoaderCircle, Mail, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { deleteReportRecipient, saveReportRecipient } from '../services/weeklyReports';

const blank = { name: '', email: '', active: true, notificationsEnabled: true };
const field = 'mt-2 w-full rounded-xl border border-white/15 bg-[#101520] p-3 text-sm text-white outline-none focus:border-cyan-300';

export default function ReportRecipientsView({ user, workspace }) {
  const [draft, setDraft] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  if (user?.type !== 'admin') return null;
  if (!workspace.enabled) return <p className="rounded-2xl border border-white/10 bg-[#121722] p-6 text-sm text-gray-300">Ative o acesso autenticado da equipe para cadastrar destinatários.</p>;
  const run = async (operation) => {
    setBusy(true); setError(''); setMessage('');
    try { await operation(); }
    catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  };
  const submit = (event) => {
    event.preventDefault();
    run(async () => { await saveReportRecipient(draft); setDraft(blank); setMessage('Integrante salvo. As preferências serão usadas nos próximos relatórios.'); });
  };
  return <div className="space-y-5 text-left">
    <section className="newgears-major-panel rounded-[28px] border border-cyan-300/15 bg-[#121722] p-6"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-200"><Users size={15} /> Administração</p><h2 className="mt-3 text-3xl font-black text-white">Integrantes / Notificações</h2><p className="mt-3 text-sm text-gray-300">Cadastre quem receberá os avisos de novos relatórios por e-mail. Este cadastro controla os avisos; o acesso ao sistema depende da conta da equipe.</p></section>
    {(error || message || workspace.error) && <p role="status" className={`rounded-xl border p-3 text-sm ${error || workspace.error ? 'border-red-300/20 text-red-200' : 'border-emerald-300/20 text-emerald-100'}`}>{error || workspace.error || message}{workspace.error && <button onClick={workspace.retry} className="ml-3 underline">Tentar novamente</button>}</p>}
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-[#141925] p-5"><h3 className="font-black text-white">{draft.id ? 'Editar integrante' : 'Novo integrante'}</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-gray-300">Nome<input required maxLength={120} disabled={busy} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={field} /></label><label className="text-xs font-bold text-gray-300">E-mail<input type="email" required maxLength={254} disabled={busy} value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} className={field} /></label></div><div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-300"><label className="flex items-center gap-2"><input type="checkbox" disabled={busy} checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} className="accent-cyan-300" />Integrante ativo</label><label className="flex items-center gap-2"><input type="checkbox" disabled={busy} checked={draft.notificationsEnabled} onChange={(event) => setDraft({ ...draft, notificationsEnabled: event.target.checked })} className="accent-cyan-300" />Receber notificações por e-mail</label></div><div className="mt-5 flex gap-2"><button disabled={busy} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-xs font-black text-slate-950 disabled:opacity-50">{busy ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />}Salvar integrante</button>{draft.id && <button type="button" disabled={busy} onClick={() => setDraft(blank)} className="rounded-xl border border-white/15 px-4 py-3 text-xs text-gray-300">Cancelar edição</button>}</div></form>
    <section className="space-y-3">{workspace.recipients.map((recipient) => <article key={recipient.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#141925] p-4"><div className="min-w-0"><p className="font-bold text-white">{recipient.name}</p><p className="mt-1 break-all text-xs text-gray-400">{recipient.email}</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className={recipient.active ? 'text-emerald-200' : 'text-gray-400'}>{recipient.active ? 'Ativo' : 'Inativo'}</span><span className={`inline-flex items-center gap-1 ${recipient.active && recipient.notificationsEnabled ? 'text-cyan-200' : 'text-gray-400'}`}><Mail size={12} />Notificações {recipient.active && recipient.notificationsEnabled ? 'ON' : 'OFF'}</span></div></div><div className="flex gap-2"><button disabled={busy} onClick={() => { setDraft({ ...recipient }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-gray-300"><Pencil size={13} />Editar</button><button disabled={busy} onClick={() => { if (window.confirm(`Remover ${recipient.name} da lista de notificações?`)) run(async () => { await deleteReportRecipient(recipient.id); if (draft.id === recipient.id) setDraft(blank); setMessage('Integrante removido das notificações.'); }); }} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300/15 px-3 py-2 text-xs text-red-200"><Trash2 size={13} />Excluir</button></div></article>)}</section>
    {!workspace.recipients.length && !workspace.loading && !workspace.error && <p className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-gray-400">Nenhum destinatário cadastrado. Os avisos internos continuam disponíveis para a equipe.</p>}
  </div>;
}
