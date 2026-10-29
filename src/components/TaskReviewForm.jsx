import { useState } from 'react';

export default function TaskReviewForm({ task, status, onSave }) {
  const [evidence, setEvidence] = useState(task.evidence || '');
  const [link, setLink] = useState(task.evidenceUrl || '');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const review = status === 'review';
  const approve = status === 'done';
  return <form className="space-y-4" onSubmit={async (event) => { event.preventDefault(); setBusy(true); setError(''); try { await onSave({ evidence: evidence.trim(), evidenceUrl: link.trim(), feedback: feedback.trim() }); } catch (issue) { setError(issue.message); } finally { setBusy(false); } }}>
    <h2 className="text-xl font-black text-white">{approve ? 'Aprovar tarefa e conceder Gears' : review ? 'Enviar tarefa para revisão' : 'Devolver para ajustes'}</h2><p className="text-sm text-slate-300">{task.text}</p>
    {approve ? <><div className="rounded-xl border border-amber-200/25 bg-amber-200/5 p-4 text-sm text-amber-100"><p><strong>{task.gearReward} Gears para cada participante cadastrado.</strong></p><p className="mt-2">{Array.isArray(task.participants) && task.participants.length ? task.participants.map((person) => person.name || 'Participante cadastrado').join(', ') : 'Vincule os responsáveis aos cadastros dos alunos antes de aprovar.'}</p><p className="mt-2 text-xs">A tarefa e os créditos são confirmados juntos. Reabrir a tarefa não repete o pagamento.</p></div>{task.evidence && <div className="rounded-xl border border-white/15 p-3 text-sm text-slate-300"><p className="font-bold">Resultado apresentado</p><p className="mt-2 whitespace-pre-wrap">{task.evidence}</p></div>}</> : review ? <><label className="block text-sm text-slate-300">O que foi feito e como foi verificado?<textarea required minLength={5} maxLength={2000} rows={4} value={evidence} onChange={(event) => setEvidence(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 p-3 text-white" /></label><label className="block text-sm text-slate-300">Link da evidência (opcional)<input type="url" maxLength={1000} value={link} onChange={(event) => setLink(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 p-3 text-white" /></label></> : <label className="block text-sm text-slate-300">O que precisa ser corrigido?<textarea required minLength={5} maxLength={2000} rows={4} value={feedback} onChange={(event) => setFeedback(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 p-3 text-white" /></label>}
    {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
    <button disabled={busy} className="rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">{busy ? 'Salvando…' : approve ? 'Confirmar aprovação e Gears' : review ? 'Enviar para revisão' : 'Registrar devolução'}</button>
  </form>;
}
