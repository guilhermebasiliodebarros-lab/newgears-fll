import { ArrowUpRight, Users } from 'lucide-react';
import { collaborationProgress } from '../utils/learningProgress';
import './TeamLearning.css';

export default function TeamLearningGoals({ tasks, students, reports, reportsReady, today, onNavigate }) {
  const progress = collaborationProgress({ tasks, students, reports, today });
  return <section className="learning-panel mt-5" aria-label="Metas colaborativas"><div className="learning-header"><div><p className="ng-eyebrow"><Users size={14} /> A equipe cresce junto</p><h3>Metas de aprendizagem compartilhada</h3><p>Metas sugeridas a partir dos registros disponíveis. Não geram cobrança, XP ou premiação automática.</p></div></div>
    <div className="learning-metrics"><div><h4>Tarefas em colaboração</h4><p className="learning-muted mt-2">{progress.sharedTotal ? `${progress.sharedCompleted}/${progress.sharedTotal} tarefas com mais de um responsável concluídas.` : 'Distribuam uma tarefa em dupla para compartilhar decisões e aprendizados.'}</p>{progress.sharedTotal > 0 && <progress className="mt-3 w-full accent-violet-300" aria-label="Conclusão de tarefas compartilhadas" value={progress.sharedCompleted} max={progress.sharedTotal} />}<button type="button" className="ng-button mt-3" onClick={() => onNavigate('kanban')}>Organizar tarefas<ArrowUpRight size={14} /></button></div>
    <div><h4>Compartilhar o aprendizado da semana</h4><p className="learning-muted mt-2">{reportsReady ? `${progress.authors}/${progress.members} integrantes com relatório datado nesta semana. Uma contribuição por pessoa é uma meta de colaboração, não uma regra do torneio.` : 'O acompanhamento dos relatórios aparece quando a área autenticada estiver disponível e carregada.'}</p>{reportsReady && progress.members > 0 && <progress className="mt-3 w-full accent-cyan-300" aria-label="Integrantes que compartilharam relatório nesta semana" value={progress.authors} max={Math.max(1, progress.members)} />}<button type="button" className="ng-button mt-3" onClick={() => onNavigate('weekly_reports')}>Ver relatórios<ArrowUpRight size={14} /></button></div></div>
  </section>;
}
