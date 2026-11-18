// Local UI fixture. Uses invented records and never imports Firebase or an API.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, LayoutDashboard, Timer, UserRound } from 'lucide-react';
import TrainingHubView from '../../src/views/TrainingHubView';
import WorkspaceBriefing from '../../src/components/WorkspaceBriefing';
import WorkspaceSearch from '../../src/components/WorkspaceSearch';
import WorkspaceSidebar from '../../src/components/WorkspaceSidebar';
import LogoNewGears from '../../src/components/LogoNewGears';
import '../../src/index.css';
import '../../src/components/WorkspaceDesign.css';

const student = { id: 'fixture-ana', name: 'Ana · demonstração', xp: 420, station: 'Programação', badges: ['Primeiro teste', 'Trabalho em equipe'] };
const students = [student, { id: 'fixture-lu', name: 'Lu' }, { id: 'fixture-rafa', name: 'Rafa' }, { id: 'fixture-inactive', name: 'Inativo', status: 'inactive' }];
const tasks = [{ id: 'sensor', text: 'Validar a leitura do sensor de cor', participants: [student], status: 'doing', dueDate: '2026-11-18' }, { id: 'prototype', text: 'Reunir o feedback sobre o protótipo', status: 'todo', dueDate: '2026-11-17' }, { id: 'story', text: 'Ensaiar a apresentação com a equipe', status: 'review', dueDate: '2026-11-20' }];
const events = [{ id: 'practice', title: 'Treino e testes na mesa', date: '2026-11-18', time: '14:00', location: 'Sala de robótica' }, { id: 'rehearsal', title: 'Ensaio de apresentação', date: '2026-11-20', time: '13:30' }];
const tabs = [{ id: 'overview', label: 'Visão geral', icon: <LayoutDashboard size={16} />, description: 'Prioridades e próximos passos da equipe.' }, { id: 'training', label: 'Central de treino', icon: <Timer size={16} />, description: 'Objetivo, checklist e tempo de foco para o encontro.' }];

function Harness() {
  const query = new URLSearchParams(location.search);
  const [area, setArea] = useState(query.get('area') || 'training');
  const [profile, setProfile] = useState(query.get('profile') || 'ana');
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const navigate = (next) => { if (!tabs.some((tab) => tab.id === next)) { setNotice(`Destino solicitado: ${next}`); return; } setArea(next); setNotice(''); history.replaceState({}, '', `?area=${next}&profile=${profile}`); window.scrollTo(0, 0); };
  return <div className="newgears-workspace min-h-screen">
    <WorkspaceSidebar tabs={tabs} activeId={area} onNavigate={navigate} open={open} onClose={() => setOpen(false)} brand={<LogoNewGears />} profile={{ name: 'Ambiente de demonstração', role: 'Dados fictícios', subtitle: 'Sem conexão com o banco' }} avatar={<UserRound size={25} />} accountKey="training-ui-fixture" onLogout={() => navigate('overview')} />
    <div className="newgears-workspace-page" data-workspace-page><header className="newgears-topbar flex items-center justify-between gap-3"><div className="workspace-topbar-heading"><small>Demonstração local · dados fictícios</small><h1>{tabs.find((tab) => tab.id === area)?.label}</h1></div><div className="ng-topbar-actions"><WorkspaceSearch tabs={tabs} activeId={area} onNavigate={navigate} /><label><span className="sr-only">Perfil de teste</span><select aria-label="Perfil de teste" value={profile} onChange={(event) => setProfile(event.target.value)}><option value="ana">Ana</option><option value="bob">Bob</option></select></label><button type="button" className="workspace-menu-toggle" aria-label="Abrir menu" onClick={() => setOpen(true)}><LayoutDashboard size={19} /></button></div></header>
    <main className="newgears-stage" id="workspace-content">{notice && <p role="status">{notice}</p>}{area === 'training' ? <TrainingHubView key={profile} scope={`ui-fixture:${profile}:2026`} onNavigate={navigate} /> : <WorkspaceBriefing technical students={students} tasks={tasks} events={events} today="2026-11-18" season="Temporada de demonstração" readiness={68} onNavigate={navigate} onOpenTask={(id) => setNotice(`Tarefa solicitada: ${id}`)} onNewTask={() => setNotice('Nova tarefa solicitada')} onNewEvent={() => setNotice('Novo evento solicitado')} />}<button type="button" className="ng-button mt-6" onClick={() => navigate(area === 'training' ? 'overview' : 'training')}><ArrowLeft size={15} />{area === 'training' ? 'Voltar à visão geral' : 'Abrir central de treino'}</button></main>
    </div>
  </div>;
}
createRoot(document.getElementById('root')).render(<Harness />);
