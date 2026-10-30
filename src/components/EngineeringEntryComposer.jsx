import { useContext, useState } from 'react';
import { GearShopContext } from '../hooks/useGearShopContext';
import { FilePenLine } from 'lucide-react';
import { buildEngineeringEntry, ENGINEERING_TYPES } from '../utils/engineeringNotebook';
import { localReportDate } from '../utils/weeklyReports';
import './TeamLearning.css';

export default function EngineeringEntryComposer({ onInsert, responsible = '' }) {
  const experience = useContext(GearShopContext);
  const [inserted, setInserted] = useState(false);
  const [form, setForm] = useState(() => ({ type: 'robot-test', date: localReportDate(), responsible: responsible || experience?.student?.name || '', objective: '', configuration: '', hypothesis: '', change: '', result: '', nextStep: '', attempts: '', successes: '', score: '' }));
  const [error, setError] = useState('');
  const patch = (key, value) => { setInserted(false); setForm((current) => ({ ...current, [key]: value })); };
  return <details className="learning-panel mt-5"><summary className="cursor-pointer text-sm font-bold text-violet-200">Registro rápido de engenharia · teste, código, problema ou estratégia</summary>
    <p className="learning-muted mt-3">Organize o teste aqui e insira no rascunho abaixo. Revise o texto e publique pelo botão habitual do diário. Nenhum registro é enviado só por preencher estes campos.</p>
    <div className="learning-form-grid"><label>Tipo de registro<select aria-label="Tipo de registro" value={form.type} onChange={(event) => patch('type', event.target.value)}>{ENGINEERING_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Data do treino<input type="date" value={form.date} onChange={(event) => patch('date', event.target.value)} /></label><label>Responsáveis<input value={form.responsible} maxLength={300} onChange={(event) => patch('responsible', event.target.value)} /></label></div>
    <div className="learning-form-grid">{[['objective', 'Objetivo *'], ['configuration', 'Configuração, versão, garra ou saída'], ['hypothesis', 'Problema encontrado ou hipótese'], ['change', 'Alteração de código ou solução aplicada'], ['result', 'Resultado observado *'], ['nextStep', 'Próximo passo *']].map(([key, label]) => <label key={key}>{label}<textarea aria-label={label} rows={2} maxLength={1500} value={form[key]} onChange={(event) => patch(key, event.target.value)} /></label>)}</div>
    <div className="learning-form-grid">{[['successes', 'Acertos', 1000], ['attempts', 'Tentativas', 1000], ['score', 'Pontos observados no treino', 10000]].map(([key, label, max]) => <label key={key}>{label}<input aria-label={label} type="number" min="0" max={max} step="1" value={form[key]} onChange={(event) => patch(key, event.target.value)} /></label>)}</div>
    {inserted && <p role="status" className="learning-hint">Modelo inserido no rascunho abaixo. Revise e publique pelo diário.</p>}
    <p className="learning-muted mt-3">Somente o texto já inserido no rascunho é recuperado depois de atualizar a página.</p>
    {error && <p role="alert" className="learning-hint">{error}</p>}
    <button type="button" className="ng-button mt-4" onClick={() => { try { onInsert(buildEngineeringEntry(form)); setInserted(true); setError(''); } catch (issue) { setError(issue.message); } }}><FilePenLine size={15} />Inserir no rascunho do diário</button>
  </details>;
}
