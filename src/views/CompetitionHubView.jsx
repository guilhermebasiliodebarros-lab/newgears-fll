import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarClock, Check, CheckCircle2, ClipboardCheck, Download, Edit3, ExternalLink, Flag, MapPin, MonitorPlay, Plus, RefreshCw, Save, Settings2, ShieldCheck, Target, Trash2, Trophy, Users } from 'lucide-react';
import { EmptyState, InterfaceButton, PanelSkeleton } from '../components/InterfacePrimitives';
import CompetitionEditor from '../components/CompetitionEditor';
import CompetitionAnalytics from '../components/CompetitionAnalytics';
import useWorkspaceClock from '../hooks/useWorkspaceClock';
import { browserStorage } from '../utils/browserStorage';
import { downloadBlob } from '../utils/download';
import { isActiveStudent } from '../utils/teamProcesses';
import { competitionDraftKey, competitionItemId, competitionReadiness, competitionReport, competitionSchedule, COMPETITION_CRITERION_STATUSES, COMPETITION_PIT_GROUPS, COMPETITION_SLOT_TYPES, newCompetitionPlan, readCompetitionDraft, validateCompetitionPlan } from '../utils/competition';
import './CompetitionHubView.css';

const sections = [{ id: 'overview', label: 'Panorama', icon: Target }, { id: 'pit', label: 'Pit e materiais', icon: ClipboardCheck }, { id: 'schedule', label: 'Programação', icon: CalendarClock }, { id: 'criteria', label: 'Critérios e evidências', icon: ShieldCheck }];
const slotDate = (value) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export default function CompetitionHubView({ record, loading = false, error = null, onSave, onRetry, canManage = false, scope, seasonName, students = [], scoreHistory = [], onNavigate }) {
  const storageKey = competitionDraftKey(scope);
  const [draftState, setDraftState] = useState(() => canManage ? readCompetitionDraft(browserStorage.getItem(storageKey)) : null);
  const [section, setSection] = useState('overview');
  const [editor, setEditor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [dayMode, setDayMode] = useState(false);
  const now = useWorkspaceClock();
  const initial = useMemo(newCompetitionPlan, []);
  const confirmedDraft = draftState && record?.mutationId === draftState.mutationId && JSON.stringify(record.plan) === JSON.stringify(draftState.plan);
  const local = canManage && !confirmedDraft ? draftState : null;
  const plan = local?.plan || record?.plan || initial;
  const dirty = Boolean(local);
  const conflict = dirty && (record?.revision || 0) !== local.baseRevision;
  const editable = canManage && !loading && !error && !busy && !dayMode;
  const readiness = competitionReadiness(plan);
  const timetable = competitionSchedule(plan.schedule, now);
  const members = students.filter(isActiveStudent);

  useEffect(() => {
    if (!canManage) return;
    if (draftState && !confirmedDraft) browserStorage.setItem(storageKey, JSON.stringify(draftState));
    else browserStorage.removeItem(storageKey);
  }, [canManage, storageKey, draftState, confirmedDraft]);

  const change = (next) => {
    const clean = validateCompetitionPlan(next);
    setDraftState({ version: 1, baseRevision: local?.baseRevision ?? record?.revision ?? 0, mutationId: competitionItemId(), plan: clean });
    setMessage(''); setSaveError('');
  };
  const openEditor = (kind, item) => setEditor({ kind, item: item || (kind === 'event' ? plan.event : kind === 'pit' ? { id: competitionItemId(), title: '', group: 'equipment', owner: '', checked: false } : kind === 'schedule' ? { id: competitionItemId(), title: '', at: '', type: 'round', owner: '', location: '' } : { id: competitionItemId(), title: '', weight: 1, status: 'todo', owner: '', evidence: '', evidenceUrl: '' }) });
  const applyEditor = (item) => {
    if (editor.kind === 'event') change({ ...plan, event: item });
    else { const rows = plan[editor.kind]; change({ ...plan, [editor.kind]: rows.some((row) => row.id === item.id) ? rows.map((row) => row.id === item.id ? item : row) : [...rows, item] }); }
    setEditor(null);
  };
  const remove = (kind, id) => { change({ ...plan, [kind]: plan[kind].filter((item) => item.id !== id) }); setMessage('Item removido do rascunho. A versão da equipe só muda quando você salvar.'); };
  const exportPlan = () => { downloadBlob(new Blob([competitionReport(plan, { season: seasonName, draft: dirty || !record })], { type: 'text/plain;charset=utf-8' }), `newgears-competicao${dirty || !record ? '-rascunho' : ''}.txt`); setMessage('Plano exportado com programação, checklist e evidências.'); };
  const save = async () => {
    if (!dirty || busy || conflict || error) return;
    setBusy(true); setSaveError(''); setMessage('');
    try { await onSave({ plan: validateCompetitionPlan(plan), expectedRevision: local.baseRevision, mutationId: local.mutationId }); setDraftState(null); setMessage('Planejamento confirmado para a equipe.'); }
    catch (reason) { setSaveError(reason.message || 'Não foi possível confirmar. O rascunho foi preservado.'); }
    finally { setBusy(false); }
  };
  const restore = () => { setDraftState(null); setSaveError(''); setMessage(record ? 'Versão atual da equipe aberta.' : 'Modelo inicial restaurado.'); };
  const RowActions = ({ kind, item }) => editable ? <span className="ng-competition__row-actions"><button type="button" onClick={() => openEditor(kind, item)} aria-label={`Editar ${item.title}`}><Edit3 size={15} /></button><button type="button" onClick={() => remove(kind, item.id)} aria-label={`Remover ${item.title}`}><Trash2 size={15} /></button></span> : null;
  const Failure = () => <div className="ng-error"><span>{error?.message || 'Não foi possível carregar a central.'} {dirty ? 'Seu rascunho continua neste dispositivo.' : ''}</span><InterfaceButton onClick={onRetry}><RefreshCw size={15} />Tentar novamente</InterfaceButton></div>;

  if (loading && !local) return <PanelSkeleton label="Abrindo o plano de competição da temporada…" />;
  if (error && !local && !record) return <Failure />;

  const renderPit = (compact = false) => <section className="ng-panel ng-competition__pit" aria-label="Checklist do pit"><div className="ng-section-header"><div><p className="ng-eyebrow">Nada importante fica para trás</p><h3>O pit pronto para partir.</h3></div>{!compact && editable ? <InterfaceButton disabled={plan.pit.length >= 30} onClick={() => openEditor('pit')}><Plus size={15} />Novo item</InterfaceButton> : <span className="ng-badge">{readiness.pitChecked}/{readiness.pitTotal}</span>}</div><div className="ng-progress" role="progressbar" aria-label="Itens conferidos do pit" aria-valuenow={readiness.pitChecked} aria-valuemin={0} aria-valuemax={readiness.pitTotal || 1}><span style={{ width: `${readiness.pitTotal ? readiness.pitChecked / readiness.pitTotal * 100 : 0}%` }} /></div>{plan.pit.length ? <ul>{(compact ? plan.pit.filter((item) => !item.checked).slice(0, 4) : plan.pit).map((item) => <li key={item.id}><label><input type="checkbox" checked={item.checked} disabled={!editable} onChange={() => change({ ...plan, pit: plan.pit.map((row) => row.id === item.id ? { ...row, checked: !row.checked } : row) })} /><span><strong>{item.title}</strong><small>{item.owner || 'Responsável a combinar'} · {COMPETITION_PIT_GROUPS[item.group]}</small></span></label><RowActions kind="pit" item={item} /></li>)}</ul> : <EmptyState compact icon={<ClipboardCheck size={24} />} title="O checklist pode acompanhar o jeito da equipe." description="O técnico pode cadastrar equipamentos, documentos e outros preparativos." />}{compact && readiness.pitTotal > 0 && readiness.pitChecked === readiness.pitTotal && <p className="ng-competition__all-clear"><CheckCircle2 size={17} />Todos os itens foram conferidos.</p>}{compact && <button type="button" className="ng-text-link" onClick={() => setSection('pit')}>Ver checklist completo<ArrowRight size={14} /></button>}</section>;

  const renderSchedule = (compact = false) => <section className="ng-panel ng-competition__schedule" aria-label="Programação da competição"><div className="ng-section-header"><div><p className="ng-eyebrow">A equipe no lugar certo</p><h3>{compact ? 'O que vem a seguir.' : 'Cada horário, um próximo passo.'}</h3></div>{!compact && editable && <InterfaceButton disabled={plan.schedule.length >= 30} onClick={() => openEditor('schedule')}><Plus size={15} />Novo horário</InterfaceButton>}</div>{timetable.sorted.length ? <ol>{(compact ? timetable.sorted.filter((item) => new Date(item.at).getTime() >= now).slice(0, 3) : timetable.sorted).map((item) => <li key={item.id} data-next={timetable.next?.id === item.id} data-past={new Date(item.at).getTime() < now}><span className="ng-competition__time"><strong>{item.at.slice(11)}</strong><small>{slotDate(item.at).split(',')[0]}</small></span><div><p><span>{COMPETITION_SLOT_TYPES[item.type]}</span>{timetable.next?.id === item.id && <span className="ng-badge">Próximo</span>}</p><strong>{item.title}</strong><small>{item.location || 'Local a definir'} · {item.owner || 'Equipe'}</small></div><RowActions kind="schedule" item={item} /></li>)}</ol> : <EmptyState compact icon={<CalendarClock size={25} />} title="O roteiro do dia começa aqui." description="Organize chegada, inspeção, rounds, apresentações e pausas assim que os horários forem divulgados." />}{compact && plan.schedule.length > 0 && !timetable.next && <p className="ng-competition__muted">Não há mais horários futuros cadastrados.</p>}{compact && <button type="button" className="ng-text-link" onClick={() => setSection('schedule')}>Ver toda a programação<ArrowRight size={14} /></button>}</section>;

  const renderCriteria = () => <section className="ng-panel ng-competition__criteria" aria-labelledby="competition-criteria-title"><div className="ng-section-header"><div><p className="ng-eyebrow">Preparação que dá para mostrar</p><h3 id="competition-criteria-title">Um critério, uma evidência.</h3></div>{editable && <InterfaceButton disabled={plan.criteria.length >= 16} onClick={() => openEditor('criteria')}><Plus size={15} />Novo critério</InterfaceButton>}</div><p className="ng-competition__muted">Os critérios e pesos são definidos pela equipe. O indicador não representa nota oficial nem previsão de classificação.</p>{plan.criteria.length ? <ul>{plan.criteria.map((item) => <li key={item.id} data-status={item.status}><span className="ng-competition__criterion-icon">{item.status === 'done' ? <Check size={18} /> : <Target size={18} />}</span><div><span className="ng-badge">{COMPETITION_CRITERION_STATUSES[item.status]}</span><h4>{item.title}</h4><small>Peso {item.weight} · {item.owner || 'Responsável a combinar'}</small>{item.evidence ? <p>{item.evidence}</p> : <p className="ng-competition__muted">A evidência deste critério ainda não foi registrada.</p>}{item.evidenceUrl && <a href={item.evidenceUrl} target="_blank" rel="noopener noreferrer" className="ng-text-link">Abrir evidência<ExternalLink size={13} /></a>}</div><RowActions kind="criteria" item={item} /></li>)}</ul> : <EmptyState compact icon={<ShieldCheck size={25} />} title="Cada competição pode pedir algo diferente." description="Adicione os critérios adequados quando a modalidade e o regulamento forem definidos." />}</section>;

  return <section className={`ng-competition ${dayMode ? 'ng-competition--day' : ''}`} aria-labelledby="competition-title">
    {error && <Failure />}
    <header className="ng-competition__hero"><div className="ng-competition__hero-copy"><p className="ng-eyebrow"><Flag size={14} />New Gears · Próximo desafio</p><div className="ng-competition__edition"><span>{plan.event.program || 'Modalidade a definir'}</span><span>{dirty ? 'Rascunho local' : record ? `Versão ${record.revision} da equipe` : 'Modelo inicial · personalize'}</span></div><h2 id="competition-title">{plan.event.name}</h2><p>O torneio muda. Nosso jeito de construir em equipe continua.</p><div className="ng-competition__event-meta"><span><CalendarClock size={15} />{plan.event.date ? new Date(`${plan.event.date}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Data a definir'}</span><span><MapPin size={15} />{plan.event.location || 'Local a definir'}</span>{plan.event.category && <span><Users size={15} />{plan.event.category}</span>}</div></div><Trophy className="ng-competition__hero-art" size={150} strokeWidth={.8} aria-hidden="true" /><div className="ng-competition__hero-actions">{editable && <InterfaceButton onClick={() => openEditor('event')}><Settings2 size={16} />Configurar competição</InterfaceButton>}<InterfaceButton onClick={exportPlan}><Download size={16} />Exportar plano</InterfaceButton><InterfaceButton aria-pressed={dayMode} onClick={() => setDayMode((value) => !value)}><MonitorPlay size={16} />{dayMode ? 'Sair do modo torneio' : 'Modo torneio'}</InterfaceButton></div></header>

    <div className="ng-competition__metrics"><div><span><Target size={16} />Preparação interna</span><strong>{readiness.percentage === null ? '—' : `${readiness.percentage}%`}</strong><small>{readiness.complete}/{readiness.total} critérios com evidência</small></div><div><span><ClipboardCheck size={16} />Checklist do pit</span><strong>{readiness.pitChecked}<small>/{readiness.pitTotal}</small></strong><small>itens conferidos pela equipe</small></div><div><span><CalendarClock size={16} />Próximo compromisso</span><strong className="ng-competition__next-time">{timetable.next ? timetable.next.at.slice(11) : 'A definir'}</strong><small>{timetable.next?.title || 'Acompanhe a programação'}</small></div><div><span><ShieldCheck size={16} />Regulamento</span><strong className="ng-competition__next-time">{plan.event.rulebookUrl ? 'Vinculado' : 'A definir'}</strong><small>{plan.event.rulebookVersion || 'Guarde a versão consultada'}</small></div></div>
    {plan.event.rulebookUrl && <div className="ng-competition__rule-link"><ShieldCheck size={16} /><span>Consulte o documento da modalidade antes de ajustar o plano.</span><a className="ng-text-link" href={plan.event.rulebookUrl} target="_blank" rel="noopener noreferrer">Abrir regulamento<ExternalLink size={14} /></a></div>}
    {!canManage && <p className="ng-competition__reader-note"><Users size={15} />{record ? 'Você está consultando a versão da equipe. O técnico organiza os horários, as conferências e os critérios.' : 'O técnico ainda não publicou um plano nesta temporada. Os itens abaixo são sugestões iniciais.'}</p>}
    {dayMode && timetable.next && <div className="ng-competition__day-call"><span>PRÓXIMO COMPROMISSO · {slotDate(timetable.next.at)}</span><strong>{timetable.next.title}</strong><p>{timetable.next.location || 'Confirme o local com a organização'} · {timetable.next.owner || 'Equipe'}</p></div>}
    {!dayMode && <nav className="ng-competition__tabs" aria-label="Seções da central de competição">{sections.map(({ id, label, icon: Icon }) => <button type="button" key={id} aria-pressed={section === id} onClick={() => setSection(id)}><Icon size={16} />{label}</button>)}</nav>}

    {(section === 'overview' || dayMode) && <>{!dayMode && <><div className="ng-competition__overview-grid">{renderSchedule(true)}{renderPit(true)}</div><CompetitionAnalytics records={scoreHistory} matchSeconds={plan.event.matchSeconds} onNavigate={onNavigate} /></>}{dayMode && <div className="ng-competition__day-checklist">{renderPit()}{renderSchedule()}</div>}</>}
    {!dayMode && section === 'pit' && renderPit()}
    {!dayMode && section === 'schedule' && renderSchedule()}
    {!dayMode && section === 'criteria' && renderCriteria()}
    {conflict && <p className="ng-error" role="alert">Outra pessoa atualizou o planejamento. Seu rascunho foi mantido. Exporte sua cópia e use a versão atual antes de continuar.</p>}
    {saveError && <p className="ng-error" role="alert">{saveError}</p>}
    <div className="ng-competition__status" role="status" aria-live="polite">{message}</div>
    {dirty && <div className="ng-competition__savebar"><span><Save size={17} /><span><strong>Alterações no rascunho</strong><small>Salvas neste dispositivo. A equipe recebe depois da confirmação.</small></span></span><div><InterfaceButton disabled={busy} onClick={restore}>{record ? 'Usar versão da equipe' : 'Restaurar modelo'}</InterfaceButton><InterfaceButton variant="primary" disabled={busy || loading || Boolean(error) || conflict} onClick={save}><Save size={15} />{busy ? 'Confirmando…' : 'Salvar para a equipe'}</InterfaceButton></div></div>}
    <footer className="ng-competition__footer"><p><ShieldCheck size={14} />{seasonName || 'Temporada atual'} · Plano separado por temporada.</p><button className="ng-text-link" type="button" onClick={() => onNavigate('training')}>Transformar o próximo passo em treino<ArrowRight size={14} /></button></footer>
    {editor && <CompetitionEditor key={`${editor.kind}:${editor.item.id || 'event'}`} kind={editor.kind} item={editor.item} members={members} onCommit={applyEditor} onClose={() => setEditor(null)} />}
  </section>;
}
