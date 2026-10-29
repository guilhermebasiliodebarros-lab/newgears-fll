import { useState, useSyncExternalStore } from 'react';
import { Activity, CheckCircle2, Download, RefreshCw, ShieldCheck } from 'lucide-react';
import { auth } from '../firebase';
import { clearDiagnostics, diagnosticsSnapshot, retryDiagnostics, subscribeDiagnostics } from '../services/clientDiagnostics';
import { DIAGNOSTIC_LABELS } from '../utils/clientDiagnostics';
import { downloadBlob } from '../utils/download';

export default function DiagnosticsPanel({ user }) {
  const local = useSyncExternalStore(subscribeDiagnostics, diagnosticsSnapshot);
  const [source, setSource] = useState('local');
  const [remote, setRemote] = useState([]);
  const [state, setState] = useState({ loading: false, error: '' });
  const rows = source === 'local' ? local : remote;
  const loadCentral = async () => {
    if (state.loading) return;
    setState({ loading: true, error: '' });
    try {
      if (!auth.currentUser || user?.type !== 'admin') throw Error('Entre pelo acesso autenticado do técnico para consultar outros computadores.');
      const response = await fetch('/api/diagnostics', { headers: { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` } });
      const data = await response.json();
      if (!response.ok) throw Error('O histórico compartilhado ainda não está disponível para esta conta.');
      setRemote(data.records || []); setSource('central'); setState({ loading: false, error: '' });
    } catch (error) { setState({ loading: false, error: error.message }); }
  };
  return <section className="ng-panel space-y-5" aria-label="Estabilidade do sistema">
    <div className="ng-section-header"><div><p className="ng-eyebrow"><Activity size={14} />Estabilidade</p><h2>Acompanhe as ocorrências do sistema</h2><p>Falhas de tela, carregamento e conexão são registradas automaticamente para ajudar na correção.</p></div><ShieldCheck className="text-cyan-200" size={28} /></div>
    <div className="ng-status-note"><ShieldCheck size={16} /><p>O registro técnico contém área, tipo de falha, versão e navegador. Textos digitados, notas, senhas e conversas ficam fora do envio.</p></div>
    <div className="ng-tabs"><button type="button" aria-pressed={source === 'local'} onClick={() => setSource('local')}>Este computador</button><button type="button" disabled={state.loading} aria-pressed={source === 'central'} onClick={loadCentral}>{state.loading ? 'Consultando…' : 'Outros computadores'}</button></div>
    {state.error && <p role="alert" className="ng-error">{state.error}</p>}
    <div className="grid gap-3 sm:grid-cols-3">{[['Ocorrências', rows.length], ['Repetições', rows.reduce((sum, row) => sum + row.count, 0)], ['Áreas', new Set(rows.map((row) => row.area)).size]].map(([label, value]) => <div key={label} className="ng-metric"><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="ng-toolbar"><p className="text-xs text-slate-400">{source === 'local' ? 'Até 40 ocorrências recentes deste navegador.' : 'Até 100 ocorrências recebidas de outros computadores.'}</p><div className="flex flex-wrap gap-2"><button type="button" className="ng-button ng-button--secondary" onClick={() => { void retryDiagnostics(); }}><RefreshCw size={14} />Reenviar pendentes</button><button type="button" className="ng-button ng-button--secondary" disabled={!rows.length} onClick={() => downloadBlob(new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }), 'ocorrencias-newgears.json')}><Download size={14} />Baixar registro</button></div></div>
    {!rows.length ? <div className="ng-empty"><CheckCircle2 size={28} /><h3>Nenhuma ocorrência registrada</h3><p>Os próximos registros aparecerão aqui automaticamente.</p></div> : <div className="space-y-3">{rows.map((row) => <article key={row.id} className="ng-incident"><div><span className="ng-eyebrow">{row.area} · {row.browser} · {row.device === 'mobile' ? 'Celular' : 'Computador'}</span><h3>{DIAGNOSTIC_LABELS[row.code] || 'Ocorrência registrada'}</h3><p>{new Date(row.occurredAt).toLocaleString('pt-BR')} · {row.count} vez(es)</p><code>NG-{row.fingerprint} · versão {row.build}</code></div><span className="ng-badge">{source === 'central' || row.sent ? 'Recebida' : 'Aguardando envio'}</span></article>)}</div>}
    {source === 'local' && local.length > 0 && <button type="button" className="text-xs text-slate-400 underline" onClick={clearDiagnostics}>Limpar histórico deste computador</button>}
  </section>;
}
