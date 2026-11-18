// UI verification only. Invented records; no Firebase imports or external requests.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutDashboard, Menu, Trophy, UserRound } from 'lucide-react';
import CompetitionHubView from '../../src/views/CompetitionHubView';
import PublicTeamView from '../../src/views/PublicTeamView';
import WorkspaceBriefing from '../../src/components/WorkspaceBriefing';
import WorkspaceSidebar from '../../src/components/WorkspaceSidebar';
import WorkspaceSearch from '../../src/components/WorkspaceSearch';
import { WorkspaceConnectionNotice, WorkspaceConnectionStatus, WorkspaceMobileNav } from '../../src/components/WorkspaceUtilities';
import LogoNewGears from '../../src/components/LogoNewGears';
import { browserStorage } from '../../src/utils/browserStorage';
import { competitionDraftKey, newCompetitionPlan, validateCompetitionPlan } from '../../src/utils/competition';
import { DEFAULT_PUBLIC_SHOWCASE_SETTINGS } from '../../src/utils/publicShowcase';
import '../../src/index.css';
import '../../src/components/WorkspaceDesign.css';

const members = [{ id: 'ana', name: 'Ana · demonstração' }, { id: 'rafa', name: 'Rafa · demonstração' }];
const tabs = [{ id: 'overview', label: 'Visão geral', icon: <LayoutDashboard size={16} />, description: 'Prioridades e próximos passos' }, { id: 'competition', label: 'Central de competição', icon: <Trophy size={16} />, description: 'Pit, programação e critérios configuráveis' }];
const season = '2027-fixture';
const recordKey = 'newgears_competition_ui_shared_v1';
function seedRecord() {
  const plan = newCompetitionPlan();
  plan.event = { ...plan.event, name: 'Desafio de robótica · demonstração', date: '2027-03-20', location: 'Espaço de demonstração', matchSeconds: 180 };
  plan.pit[0].checked = true; plan.pit[0].owner = 'Ana · demonstração';
  plan.criteria[0] = { ...plan.criteria[0], status: 'done', evidence: 'Três testes de alinhamento concluídos. Evidência fictícia para conferir a interface.', owner: 'Ana · demonstração' };
  plan.schedule = [{ id: 'arrival', title: 'Chegada e organização do pit', at: '2027-03-20T08:00', type: 'arrival', location: 'Entrada principal', owner: 'Equipe' }, { id: 'round', title: 'Primeiro round de demonstração', at: '2027-03-20T10:30', type: 'round', location: 'Mesa de demonstração', owner: 'Ana e Rafa' }, { id: 'presentation', title: 'Apresentação do projeto', at: '2027-03-20T14:00', type: 'presentation', location: 'Sala de demonstração', owner: 'Equipe' }];
  return { plan, seasonId: season, revision: 1, mutationId: 'initial-seed', updatedAt: '2026-11-18T10:00:00Z' };
}
const runs = [270, 300, 290, 315, 310, 305, 320, 315].map((score, index) => ({ id: `${index}`, practiceType: 'full_round', score, time: index === 2 ? 190 : 155 + index, date: `2026-11-${String(index + 10).padStart(2, '0')}T14:00:00Z`, robotVersionId: index < 4 ? 'v1' : 'v2', robotVersionLabel: index < 4 ? 'Protótipo 1' : 'Protótipo 2' }));
const photo = (label, color) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="${color}"/><rect x="110" y="110" width="580" height="380" rx="40" fill="#172033" stroke="#b9aaff" stroke-width="4"/><text x="400" y="300" text-anchor="middle" fill="#e9e5ff" font-size="32" font-family="sans-serif">${label}</text><text x="400" y="350" text-anchor="middle" fill="#9facc3" font-size="20" font-family="sans-serif">IMAGEM DE TESTE · DADOS FICTÍCIOS</text></svg>`)}`;
const gallery = [{ id: 'demo-one', image: photo('Montagem de demonstração', '#1c273c'), title: 'Montagem de demonstração', detail: 'Imagem ilustrativa para conferir a galeria.', date: '2026-11-18', showInPublicGallery: true }, { id: 'demo-two', image: photo('Teste de demonstração', '#28213c'), title: 'Teste de demonstração', detail: 'Segunda imagem ilustrativa para testar a navegação.', date: '2026-11-17', showInPublicGallery: true }];

function Harness() {
  const [role, setRole] = useState('admin');
  const [view, setView] = useState('competition');
  const [menu, setMenu] = useState(false);
  const [mode, setMode] = useState('success');
  const [notice, setNotice] = useState('');
  const [record, setRecord] = useState(() => { try { return JSON.parse(browserStorage.getItem(recordKey)) || seedRecord(); } catch { return seedRecord(); } });
  const updateRecord = (next) => { setRecord(next); browserStorage.setItem(recordKey, JSON.stringify(next)); };
  const navigate = (id) => { if (tabs.some((tab) => tab.id === id)) { setView(id); setNotice(''); } else setNotice(`Navegação solicitada: ${id}`); };
  const reset = () => { browserStorage.removeItem(competitionDraftKey(`competition-ui:admin:${season}`)); browserStorage.removeItem(competitionDraftKey(`competition-ui:student:${season}`)); updateRecord(seedRecord()); setNotice('Demonstração restaurada.'); setMode('success'); setView('reload'); requestAnimationFrame(() => setView('competition')); };
  if (view === 'public') return <PublicTeamView students={members} adminProfile={{ name: 'Técnico de demonstração' }} projectSummary={{ title: 'Projeto de demonstração', problem: 'Cenário fictício para conferir a vitrine.' }} outreachEvents={[]} galleryPhotos={gallery} robotVersions={[]} attachments={[]} showcaseSettings={DEFAULT_PUBLIC_SHOWCASE_SETTINGS} visualTheme="classic" onBackToLogin={() => setView('competition')} onOpenTvMode={() => setNotice('Modo TV solicitado')} onToggleTheme={() => setNotice('Tema solicitado')} />;
  return <div className="newgears-workspace min-h-screen"><WorkspaceSidebar tabs={tabs} activeId={view} onNavigate={navigate} open={menu} onClose={() => setMenu(false)} profile={{ name: 'Equipe de demonstração', role: 'Dados fictícios', subtitle: 'Sem conexão com o banco' }} avatar={<UserRound size={25} />} brand={<LogoNewGears />} accountKey="competition-ui" onLogout={() => setView('overview')} />
    <div className="newgears-workspace-page" data-workspace-page><header className="newgears-topbar flex items-center justify-between gap-3"><div className="flex items-center gap-2"><button type="button" className="workspace-menu-toggle" aria-label="Abrir menu" onClick={() => setMenu(true)}><Menu size={20} /></button><div className="workspace-topbar-heading"><small>Prévia · dados fictícios</small><h1>{view === 'overview' ? 'Visão geral' : 'Central de competição'}</h1></div></div><div className="ng-topbar-actions"><WorkspaceConnectionStatus /><WorkspaceSearch tabs={tabs} activeId={view} onNavigate={navigate} /></div></header><WorkspaceConnectionNotice />
    <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-5 py-3 text-xs"><label>Perfil de teste <select aria-label="Perfil de teste" value={role} onChange={(event) => setRole(event.target.value)}><option value="admin">Técnico</option><option value="student">Aluno</option></select></label><button className="ng-button" onClick={() => setMode(mode === 'failure' ? 'success' : 'failure')}>Simular falha</button><button className="ng-button" onClick={() => updateRecord({ ...record, revision: record.revision + 1, mutationId: 'remote-change', plan: { ...record.plan, event: { ...record.plan.event, category: 'Atualizada em outro computador' } } })}>Simular edição externa</button><button className="ng-button" onClick={() => setView('public')}>Ver vitrine de teste</button><button className="ng-button" onClick={reset}>Restaurar demonstração</button></div>
    <main className="newgears-stage" id="workspace-content">{notice && <p role="status">{notice}</p>}{view === 'competition' && <CompetitionHubView key={`${role}:${season}`} record={record} canManage={role === 'admin'} scope={`competition-ui:${role}:${season}`} seasonName="Temporada de demonstração 2027" students={members} scoreHistory={runs} error={mode === 'failure' ? { message: 'Falha simulada de rede; os dados da equipe não foram confirmados novamente.' } : null} onRetry={() => setMode('success')} onNavigate={navigate} onSave={async ({ plan, expectedRevision, mutationId }) => { if (mode === 'failure') throw Error('Falha simulada no envio.'); if (expectedRevision !== record.revision) throw Error('A versão mudou em outro computador.'); const next = { ...record, plan: validateCompetitionPlan(plan), mutationId, revision: record.revision + 1, updatedAt: new Date().toISOString() }; updateRecord(next); return next; }} />}{view === 'overview' && <WorkspaceBriefing technical students={members} tasks={[]} events={[]} today="2026-11-18" season="Temporada de demonstração" onNavigate={navigate} onNewTask={() => setNotice('Nova tarefa solicitada')} onNewEvent={() => setNotice('Novo evento solicitado')} />}</main>
    </div><WorkspaceMobileNav activeId={view} onNavigate={navigate} />
  </div>;
}
const fixtureContainer = document.getElementById('root');
const fixtureRoot = fixtureContainer.__newgearsCompetitionFixtureRoot || (fixtureContainer.__newgearsCompetitionFixtureRoot = createRoot(fixtureContainer));
fixtureRoot.render(<Harness />);
