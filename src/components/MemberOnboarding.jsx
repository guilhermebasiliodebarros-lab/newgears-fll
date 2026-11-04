import { useEffect, useState } from 'react';
import { CheckCircle2, Compass } from 'lucide-react';
import { onboardingKey, readOnboarding, writeOnboardingStep } from '../utils/memberOnboarding';

export default function MemberOnboarding({ student, seasonId, reportsEnabled, onNavigate }) {
  const key = onboardingKey(student.id, seasonId);
  return <OnboardingSteps key={key} storageKey={key} student={student} reportsEnabled={reportsEnabled} onNavigate={onNavigate} />;
}
function OnboardingSteps({ storageKey: key, student, reportsEnabled, onNavigate }) {
  const read = () => { try { return readOnboarding(localStorage, key).completed; } catch { return []; } };
  const [completed, setCompleted] = useState(read);
  const [storageError, setStorageError] = useState(false);
  const [expanded, setExpanded] = useState(() => read().length < 4);
  useEffect(() => {
    const sync = (event) => { if (event.key === key || event.key === null) { try { setCompleted(readOnboarding(localStorage, key).completed); } catch { setStorageError(true); } } };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key]);
  const mark = (step, checked) => {
    const fallback = checked ? [...new Set([...completed, step])] : completed.filter((item) => item !== step);
    try { const next = writeOnboardingStep(localStorage, key, step, checked, storageError ? completed : []); setCompleted(next.completed); setStorageError(false); }
    catch { setCompleted(fallback); setStorageError(true); }
  };
  const steps = [
    { id: 'station', title: 'Conhecer minha estação', text: student.station ? `Sua estação é ${student.station}. Veja sua missão e combine com o técnico como contribuir.` : 'Sua estação ainda não foi definida. Converse com o técnico para combinar onde começar.', tab: 'mission', action: 'Ver minha missão' },
    { id: 'tasks', title: 'Localizar minhas tarefas', text: 'Confira os responsáveis, os prazos e a etapa de cada atividade. Se precisar de ajuda, registre um impedimento na tarefa.', tab: 'kanban', action: 'Abrir minhas tarefas' },
    { id: 'learning', title: 'Registrar meu primeiro aprendizado', text: 'No diário, conte o que tentou, o resultado e o que aprendeu. Você pode aproveitar evidências de tarefas concluídas.', tab: 'logbook', action: 'Escrever no diário' },
    { id: 'deliveries', title: 'Entender as entregas da semana', text: reportsEnabled ? 'Combine o prazo com o técnico. O diário guarda seus aprendizados; os relatórios semanais compartilham o documento PDF ou Word. Rascunho salvo neste dispositivo ainda não é uma entrega.' : 'Confira tarefas e prazos com o técnico e registre seus aprendizados no diário. Os relatórios em PDF ou Word ficam disponíveis quando o acesso autenticado for ativado. Rascunho salvo neste dispositivo ainda não é uma entrega.', tab: reportsEnabled ? 'weekly_reports' : 'kanban', action: reportsEnabled ? 'Conhecer os relatórios' : 'Conferir tarefas e prazos' },
  ];
  return <section aria-label="Roteiro para novos integrantes" className="mb-5 rounded-2xl border border-cyan-300/20 bg-[#141925] p-4 md:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-bold text-white">{completed.length === 4 ? <CheckCircle2 size={20} /> : <Compass size={20} />}Primeiros passos na equipe</h2><p className="mt-1 text-xs text-slate-300">{completed.length}/4 etapas marcadas · progresso deste dispositivo</p></div><button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="ng-button min-h-11">{expanded ? 'Recolher roteiro' : completed.length === 4 ? 'Rever roteiro' : 'Continuar roteiro'}</button></div>
    {expanded && <div className="mt-4 grid gap-3 md:grid-cols-2">{steps.map((step) => <article key={step.id} className="rounded-xl border border-white/10 p-4"><label className="flex min-h-11 items-center gap-2 text-sm font-bold text-white"><input type="checkbox" checked={completed.includes(step.id)} onChange={(event) => mark(step.id, event.target.checked)} />{step.title}</label><p className="mt-2 text-xs leading-relaxed text-slate-300">{step.text}</p><button type="button" onClick={() => onNavigate(step.tab)} className="ng-button mt-3 min-h-11 text-xs">{step.action}</button></article>)}</div>}
    {storageError && <p role="alert" className="mt-3 text-xs text-amber-100">Não foi possível guardar seu progresso neste dispositivo. As marcações ficam disponíveis apenas enquanto esta tela estiver aberta.</p>}
  </section>;
}
