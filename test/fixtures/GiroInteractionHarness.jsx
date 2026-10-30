import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GearShopContext } from '../../src/hooks/useGearShopContext';
import GearCompanion from '../../src/components/GearCompanion';
import { gearProfile } from '../../src/utils/gearShop';
import '../../src/index.css';
import '../../src/components/GearExperience.css';
import '../../src/components/WorkspaceDesign.css';

// Render the real components without App, Firestore listeners, or a real account.
export default function Harness() {
  const [student, setStudent] = useState({ id: 'fixture', name: 'Aluno de teste', xp: 100, badges: [] });
  const [tasks, setTasks] = useState([{ id: 'test-task', status: 'doing', participants: [{ id: 'fixture', name: 'Aluno de teste' }] }]);
  const [page, setPage] = useState('kanban');
  return <GearShopContext.Provider value={{ account: gearProfile('fixture'), student, technicianMode: false, pending: [], workshop: { expression: 'auto' }, draftScope: 'giro-ui-regression-fixture', companionContext: { page, tasks, events: [], today: '2026-10-30' }, onNavigate: setPage, onOpenShop: () => setPage('shop'), knowledge: { published: [], index: [], loading: false, error: '', seasonId: 'fixture', retry: () => {} }, aiContext: { season: 'Teste local' }, user: { type: 'student', studentId: 'fixture' } }}>
    <main className="newgears-workspace" style={{ minHeight: '100vh', padding: 24 }}><h1>Teste isolado do Giro</h1><p data-test-page>{page}</p>
      <button type="button" onClick={() => setStudent((current) => ({ ...current, xp: current.xp + 25 }))}>Receber XP fictício</button>
      <button type="button" onClick={() => setTasks((current) => current.map((task) => ({ ...task, status: 'done' })))}>Concluir tarefa fictícia</button>
    </main><GearCompanion />
  </GearShopContext.Provider>;
}

createRoot(document.getElementById('root')).render(<StrictMode><Harness /></StrictMode>);
