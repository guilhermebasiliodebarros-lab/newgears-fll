import { ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, Circle, ClipboardList, Plus, Sparkles, Target, Trophy, Users, Zap } from 'lucide-react';
import { briefingEvents, briefingTasks } from '../utils/workspaceBriefing';
import { recordDay } from '../utils/workspaceRecords';
import { EmptyState, InterfaceButton } from './InterfacePrimitives';

const dateLabel = (day, long = false) => new Intl.DateTimeFormat('pt-BR', long ? { weekday: 'long', day: 'numeric', month: 'long' } : { day: '2-digit', month: 'short' }).format(new Date(`${day}T12:00:00`));
const taskStatus = { todo: 'A fazer', doing: 'Em andamento', review: 'Em revisão' };

export default function WorkspaceBriefing({ technical, name, student, students = [], tasks, events, today, season, readiness = 0, level, nextLevel, onNavigate, onNewTask, onNewEvent }) {
  const pending = briefingTasks(tasks, { student, technical, students, today });
  const upcoming = briefingEvents(events, today);
  const overdue = pending.filter((task) => recordDay(task.dueDate) && recordDay(task.dueDate) < today).length;
  const xp = Number(student?.xp) || 0;
  const percentage = technical ? Math.max(0, Math.min(100, Number(readiness) || 0)) : nextLevel ? Math.max(0, Math.min(100, (xp - (level?.min || 0)) / Math.max(1, nextLevel.min - (level?.min || 0)) * 100)) : 100;
  return <section className="ng-briefing" aria-label={technical ? 'Resumo do dia da equipe' : 'Seu resumo do dia'}>
    <div className="ng-briefing__hero">
      <div className="ng-briefing__welcome"><p className="ng-eyebrow"><span className="ng-live-dot" />{season || 'New Gears FLL'}<span className="ng-briefing__date">{dateLabel(today, true)}</span></p>
        <h2>{technical ? 'Grandes ideias. Próximos passos.' : `Olá, ${String(name || 'integrante').split(' ')[0]}. Vamos construir?`}</h2>
        <p>{technical ? 'Uma visão clara do que precisa da equipe hoje.' : 'Sua próxima contribuição começa aqui. Acompanhe suas tarefas e continue evoluindo.'}</p>
        <div className="ng-briefing__actions"><InterfaceButton variant="primary" onClick={technical ? onNewTask : () => onNavigate('kanban')}>{technical ? <Plus size={17} /> : <ArrowRight size={17} />}{technical ? 'Nova tarefa' : 'Ver minhas tarefas'}</InterfaceButton>
          <InterfaceButton onClick={technical ? onNewEvent : () => onNavigate('logbook')}>{technical ? <CalendarDays size={16} /> : <ClipboardList size={16} />}{technical ? 'Criar evento' : 'Escrever no diário'}</InterfaceButton></div>
      </div>
      <div className="ng-briefing__progress"><span className="ng-briefing__progress-icon" aria-hidden="true">{technical ? <Target size={23} /> : <Trophy size={23} />}</span><p>{technical ? 'Preparação da equipe' : level?.name || 'Sua evolução'}</p>
        <strong>{technical ? `${Math.round(percentage)}%` : <>{xp.toLocaleString('pt-BR')} <small>XP</small></>}</strong>
        <div className="ng-progress" role="progressbar" aria-label={technical ? 'Preparação para o torneio' : 'Progresso no nível atual'} aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percentage}%` }} /></div>
        <span>{technical ? 'Acompanhe os critérios e as evidências.' : nextLevel ? `${Math.max(0, nextLevel.min - xp)} XP para ${nextLevel.name}` : 'Nível máximo alcançado. Continue contribuindo!'}</span>
        <button type="button" onClick={() => onNavigate(technical ? 'evaluations' : 'feedback')}>{technical ? 'Abrir avaliações' : 'Acompanhar meu progresso'}<ArrowUpRight size={14} /></button>
      </div>
    </div>
    <div className="ng-briefing__stats">
      {[{ label: technical ? 'Tarefas em aberto' : 'Minhas tarefas', value: pending.length, icon: <ClipboardList size={17} />, tab: 'kanban' }, { label: 'Tarefas atrasadas', value: overdue, icon: <Zap size={17} />, tab: 'kanban' }, { label: 'Próximos eventos', value: upcoming.length, icon: <CalendarDays size={17} />, tab: 'agenda' }, { label: technical ? 'Integrantes ativos' : 'Conquistas', value: technical ? students.length : (Array.isArray(student?.badges) ? student.badges.length : 0), icon: technical ? <Users size={17} /> : <Sparkles size={17} />, tab: technical ? 'students' : 'shop' }].map((metric) => <button key={metric.label} type="button" className="ng-briefing__stat" onClick={() => onNavigate(metric.tab)}><span aria-hidden="true">{metric.icon}</span><span><small>{metric.label}</small><strong>{metric.value}</strong></span><ArrowUpRight size={14} /></button>)}
    </div>
    <div className="ng-briefing__lists"><div className="ng-panel"><div className="ng-section-header ng-section-header--compact"><div><p className="ng-eyebrow">Comece por aqui</p><h3>{technical ? 'Prioridades da equipe' : 'Seus próximos passos'}</h3></div><button type="button" className="ng-text-link" onClick={() => onNavigate('kanban')}>Ver todas<ArrowRight size={14} /></button></div>
      {pending.length ? <ul className="ng-briefing__tasks">{pending.slice(0, 3).map((task) => <li key={task.id}><button type="button" onClick={() => onNavigate('kanban')}><Circle size={18} aria-hidden="true" /><span><strong>{task.text || 'Tarefa da equipe'}</strong><small>{taskStatus[task.status] || 'Em aberto'}{task.dueDate && recordDay(task.dueDate) ? ` · ${dateLabel(recordDay(task.dueDate))}` : ''}</small></span>{recordDay(task.dueDate) && recordDay(task.dueDate) < today && <span className="ng-badge ng-badge--warning">Atrasada</span>}<ArrowUpRight size={15} /></button></li>)}</ul> : <EmptyState compact icon={<CheckCircle2 size={24} />} title="Tudo em dia por aqui" description={technical ? 'As próximas tarefas aparecerão neste espaço.' : 'Nenhuma tarefa pendente está atribuída a você.'} />}
    </div><div className="ng-panel"><div className="ng-section-header ng-section-header--compact"><div><p className="ng-eyebrow">Na agenda</p><h3>O que vem a seguir</h3></div><button type="button" className="ng-text-link" onClick={() => onNavigate('agenda')}>Ver agenda<ArrowRight size={14} /></button></div>
      {upcoming.length ? <ul className="ng-briefing__events">{upcoming.slice(0, 2).map((event) => <li key={event.id}><button type="button" onClick={() => onNavigate('agenda')}><span className="ng-date-tile"><strong>{recordDay(event.date).slice(-2)}</strong><small>{dateLabel(recordDay(event.date)).split(' ').at(-1).replace('.', '')}</small></span><span><strong>{event.title || 'Evento da equipe'}</strong><small>{event.time || 'Horário a definir'}{event.location ? ` · ${event.location}` : ''}</small></span><ArrowUpRight size={15} /></button></li>)}</ul> : <EmptyState compact icon={<CalendarDays size={24} />} title="Agenda com espaço para novas ideias" description="Os próximos encontros e prazos aparecerão aqui." />}
    </div></div>
  </section>;
}
