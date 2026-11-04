import { CheckCircle2, CloudOff, LoaderCircle, Save } from 'lucide-react';

export default function SaveStatus({ state = 'draft', message, savedAt }) {
  const entries = { draft: [Save, 'Rascunho salvo neste dispositivo. Ainda não foi enviado.', 'text-cyan-100'], sending: [LoaderCircle, 'Enviando… Aguarde a confirmação do sistema.', 'text-cyan-100'], confirmed: [CheckCircle2, 'Confirmado no sistema.', 'text-emerald-100'], error: [CloudOff, 'Falha ao enviar. Revise a conexão e tente novamente.', 'text-amber-100'], unavailable: [CloudOff, 'O rascunho não pôde ser salvo neste dispositivo. Mantenha esta página aberta.', 'text-amber-100'], idle: [Save, 'As alterações serão guardadas como rascunho neste dispositivo.', 'text-slate-300'] };
  const [Icon, label, tone] = entries[state] || entries.idle;
  return <p role={state === 'error' || state === 'unavailable' ? 'alert' : 'status'} className={`flex items-start gap-2 text-xs leading-relaxed ${tone}`}><Icon size={15} className={`mt-0.5 shrink-0 ${state === 'sending' ? 'animate-spin' : ''}`} /><span>{message || label}{savedAt && state === 'draft' ? ` Salvo às ${new Date(savedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.` : ''}</span></p>;
}
