import { BookOpen, ClipboardList, Timer } from 'lucide-react';

export default function TrainingQuickActions({ onTest, onTasks, onDiary, technical = false }) {
  return <nav aria-label="Ações rápidas do treino" className="mb-5 rounded-2xl border border-cyan-300/20 bg-[#141925] p-4 md:hidden">
    <p className="mb-3 text-sm font-bold text-white">Durante o treino</p>
    <div className={`grid gap-2 ${technical ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {[[Timer, 'Registrar teste', onTest], [ClipboardList, 'Atualizar tarefa', onTasks], ...(!technical ? [[BookOpen, 'Registrar descoberta', onDiary]] : [])].map(([Icon, label, action]) => <button type="button" key={label} onClick={action} className="flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-2 py-3 text-center text-xs font-bold text-cyan-100"><Icon size={21} />{label}</button>)}
    </div>
  </nav>;
}
