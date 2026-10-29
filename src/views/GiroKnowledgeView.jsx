import { useEffect, useId, useRef, useState } from 'react';
import { Archive, BookOpen, FilePlus2, LoaderCircle, Pencil, Save, Search, Upload, X } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import { giroKnowledgeError } from '../services/giroKnowledge';
import { GIRO_MATERIAL_CATEGORIES, GIRO_MATERIAL_MAX_TEXT } from '../utils/giroKnowledge';
import { importGiroMaterial } from '../utils/giroMaterialImport';
import GiroFeedbackReview from '../components/GiroFeedbackReview';
import '../components/GiroKnowledge.css';
import '../components/GiroEnhancements.css';

const newDraft = () => ({ title: '', category: 'season', status: 'draft', sourceURL: '', tags: '', fileName: '', pages: [{ number: 1, text: '' }] });
const statusLabel = { published: 'Publicado', draft: 'Rascunho', archived: 'Arquivado' };

function MaterialEditor({ material, initialDraft, onSave, onCancel, saving }) {
  const [draft, setDraft] = useState(() => material ? { ...material, pages: material.pages.map((page) => ({ ...page })) } : initialDraft || newDraft());
  const [pageIndex, setPageIndex] = useState(0);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const importer = useRef(null);
  const fileInput = useRef(null);
  const prefix = useId();
  useEffect(() => () => { importer.current?.abort(); }, []);
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const textLength = draft.pages.reduce((sum, page) => sum + page.text.length, 0);
  const importing = Boolean(progress);
  const importFile = async (file) => {
    if (saving || importer.current) return;
    const abort = new AbortController(); importer.current = abort; setProgress('Lendo arquivo…'); setError(''); setWarning('');
    try {
      const result = await importGiroMaterial(file, { signal: abort.signal, onProgress: (page, total) => setProgress(`Lendo página ${page} de ${total}…`) });
      if (abort.signal.aborted) return;
      setDraft((current) => ({ ...current, ...result, title: current.title || file.name.replace(/\.[^.]+$/, '').slice(0, 180) }));
      setPageIndex(0); setWarning(result.warning || 'Texto importado. Revise o conteúdo antes de publicar.');
    } catch (issue) { if (!abort.signal.aborted) setError(issue.message || 'Não foi possível ler este arquivo. Tente uma cópia com texto selecionável.'); }
    finally { if (importer.current === abort) { importer.current = null; setProgress(''); } }
  };
  return <form className="giro-knowledge__editor" onSubmit={async (event) => { event.preventDefault(); setError(''); try { await onSave(draft); } catch (issue) { setError(giroKnowledgeError(issue)); } }}>
    <div className="giro-knowledge__editor-heading"><div><p className="giro-library__eyebrow">Conhecimento da temporada</p><h3>{material ? 'Editar material' : 'Adicionar material'}</h3></div><button type="button" onClick={onCancel} disabled={saving} aria-label="Fechar editor"><X size={20} /></button></div>
    <fieldset disabled={saving || importing}>
      <div className="giro-knowledge__import"><Upload size={24} /><div><strong>Importe a rúbrica ou o material da temporada</strong><p>PDF com texto selecionável, TXT ou Markdown · até 15 MB. O conteúdo será mostrado abaixo para revisão.</p></div><button type="button" onClick={() => { if (textLength > 0 && !window.confirm('Substituir o texto deste editor pelo conteúdo do arquivo? O material salvo só será alterado ao salvar.')) return; fileInput.current?.click(); }}>Selecionar arquivo</button><input ref={fileInput} type="file" accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown" hidden onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void importFile(file); }} /></div>
      <label htmlFor={`${prefix}-title`}>Título<input id={`${prefix}-title`} required minLength={3} maxLength={180} value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder="Ex.: Rúbrica de inovação — temporada atual" /></label>
      <div className="giro-knowledge__row"><label htmlFor={`${prefix}-category`}>Categoria<select id={`${prefix}-category`} value={draft.category} onChange={(event) => update('category', event.target.value)}>{Object.entries(GIRO_MATERIAL_CATEGORIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label htmlFor={`${prefix}-status`}>Disponibilidade<select id={`${prefix}-status`} value={draft.status} onChange={(event) => update('status', event.target.value)}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
      <label htmlFor={`${prefix}-tags`}>Palavras-chave<input id={`${prefix}-tags`} maxLength={500} value={draft.tags} onChange={(event) => update('tags', event.target.value)} placeholder="Ex.: identificar, pesquisar, criar, compartilhar" /></label>
      <label htmlFor={`${prefix}-source`}>Link da fonte original <span>(opcional)</span><input id={`${prefix}-source`} type="url" maxLength={2000} value={draft.sourceURL} onChange={(event) => update('sourceURL', event.target.value)} placeholder="https://…" /><small>O link serve como referência. Para o Giro consultar, importe ou cole o conteúdo.</small></label>
      <div className="giro-knowledge__page-control"><label htmlFor={`${prefix}-page`}>Revisar página<select id={`${prefix}-page`} value={pageIndex} onChange={(event) => setPageIndex(Number(event.target.value))}>{draft.pages.map((page, index) => <option key={page.number} value={index}>{page.number} de {draft.pages.length}</option>)}</select></label><span>{draft.fileName || 'Texto manual'} · {textLength.toLocaleString('pt-BR')}/{GIRO_MATERIAL_MAX_TEXT.toLocaleString('pt-BR')} caracteres</span></div>
      <label htmlFor={`${prefix}-text`}>Conteúdo consultado pelo Giro<textarea id={`${prefix}-text`} rows={15} maxLength={GIRO_MATERIAL_MAX_TEXT} value={draft.pages[pageIndex]?.text || ''} onChange={(event) => setDraft((current) => ({ ...current, pages: current.pages.map((page, index) => index === pageIndex ? { ...page, text: event.target.value } : page) }))} placeholder="Cole as orientações aqui ou importe um documento. O Giro vai buscar trechos neste texto." /></label>
    </fieldset>
    {importing && <div role="status" className="giro-knowledge__notice"><LoaderCircle size={16} />{progress}<button type="button" onClick={() => { importer.current?.abort(); }}>Cancelar importação</button></div>}
    {warning && <p className="giro-knowledge__notice">{warning}</p>}
    {error && <p role="alert" className="giro-knowledge__error">{error}</p>}
    <p className="giro-library__muted">{draft.status === 'published' ? 'Ao salvar, este conteúdo ficará disponível para toda a equipe nesta temporada.' : 'Rascunhos e materiais arquivados ficam disponíveis apenas para o técnico.'} O texto é salvo na biblioteca; o arquivo original não é armazenado.</p>
    <div className="giro-knowledge__actions"><button type="button" disabled={saving} onClick={onCancel}>Cancelar</button><button type="submit" className="giro-knowledge__primary" disabled={saving || importing}>{saving ? <LoaderCircle size={16} /> : <Save size={16} />}{saving ? 'Salvando…' : draft.status === 'published' ? 'Salvar e publicar' : 'Salvar material'}</button></div>
  </form>;
}

export default function GiroKnowledgeView({ seasonName }) {
  const { user, knowledge } = useGearShopContext();
  const [editor, setEditor] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const running = useRef(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  if (user?.type !== 'admin') return null;
  const save = async (draft) => {
    if (running.current) return;
    running.current = true; setSaving(true);
    try { await knowledge.save({ id: editor?.material?.id, expectedUpdatedAt: editor?.material?.updatedAt, expectedRevision: editor?.material?.revision, material: draft }); setEditor(null); setNotice(draft.status === 'published' ? 'Material publicado! O Giro já pode consultar este conteúdo.' : 'Material salvo. Ele só entra nas consultas quando estiver publicado.'); }
    finally { running.current = false; setSaving(false); }
  };
  const archive = async (material) => {
    if (running.current) return;
    running.current = true; setSaving(true); setError('');
    try { await knowledge.save({ id: material.id, expectedUpdatedAt: material.updatedAt, expectedRevision: material.revision, material: { ...material, status: 'archived' } }); setNotice('Material arquivado. Você pode editar e publicar novamente quando quiser.'); }
    catch (issue) { setError(giroKnowledgeError(issue)); }
    finally { running.current = false; setSaving(false); }
  };
  const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const visible = knowledge.materials.filter((item) => (statusFilter === 'all' || item.status === statusFilter) && normalize(`${item.title} ${item.tags} ${GIRO_MATERIAL_CATEGORIES[item.category]}`).includes(normalize(search.trim()))).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  return <div className="giro-knowledge">
    <header className="giro-knowledge__hero"><div><p className="giro-library__eyebrow"><BookOpen size={14} />Biblioteca do Giro · {seasonName}</p><h2>O conhecimento começa com a equipe.</h2><p>Publique rúbricas, orientações do torneio e materiais da temporada. O Giro usa os trechos relevantes como referência para explicar e tirar dúvidas, indicando os documentos e as páginas citadas.</p></div><button type="button" className="giro-knowledge__primary" disabled={Boolean(editor) || saving || knowledge.loading || Boolean(knowledge.error)} onClick={() => { setNotice(''); setEditor({ key: 'new', material: null }); }}><FilePlus2 size={18} />Adicionar material</button></header>
    <div className="giro-knowledge__stats"><span><strong>{knowledge.materials.filter((item) => item.status === 'published').length}</strong> publicados</span><span><strong>{knowledge.materials.filter((item) => item.status === 'draft').length}</strong> rascunhos</span><span><strong>{knowledge.systemMaterials.length}</strong> registros técnicos do sistema</span></div>
    {knowledge.loading && <p role="status" className="giro-knowledge__notice">Carregando biblioteca da temporada…</p>}
    {knowledge.error && <div role="alert" className="giro-knowledge__error">{knowledge.error}<button type="button" onClick={knowledge.retry}>Tentar novamente</button></div>}
    {notice && <p role="status" className="giro-knowledge__notice">{notice}</p>}
    {error && <p role="alert" className="giro-knowledge__error">{error}</p>}
    {editor && <MaterialEditor key={editor.key} material={editor.material} initialDraft={editor.initialDraft} saving={saving} onSave={save} onCancel={() => { if (window.confirm('Fechar o editor? As alterações ainda não salvas serão descartadas.')) setEditor(null); }} />}
    {!editor && <GiroFeedbackReview onPrepare={(initialDraft) => { setEditor({ key: crypto.randomUUID(), material: null, initialDraft }); setNotice('Orientação preparada como rascunho. Revise as fontes antes de publicar.'); }} />}
    <div className="giro-knowledge__filters"><label className="giro-library__search"><Search size={17} /><input aria-label="Filtrar biblioteca do Giro" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar material ou palavra-chave" /></label><select aria-label="Filtrar disponibilidade" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Todos os materiais</option>{Object.entries(statusLabel).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
    {!knowledge.loading && !knowledge.error && !visible.length && <div className="giro-knowledge__empty"><BookOpen size={32} /><h3>{knowledge.materials.length ? 'Nenhum material neste filtro.' : 'Vamos alimentar o Giro?'}</h3><p>Comece pela rúbrica, pelo regulamento do torneio ou pelo guia da temporada. Importe o PDF, revise o texto e publique para a equipe consultar.</p></div>}
    <div className="giro-knowledge__list">{visible.map((material) => <article key={material.id}><div><span className={`giro-knowledge__badge giro-knowledge__badge--${material.status}`}>{statusLabel[material.status]}</span><small>{GIRO_MATERIAL_CATEGORIES[material.category]}</small><h3>{material.title}</h3><p>{material.pages.length} página(s) · {(material.textLength || 0).toLocaleString('pt-BR')} caracteres · {new Date(material.updatedAt).toLocaleDateString('pt-BR')}</p>{material.tags && <p>{material.tags}</p>}</div><div className="giro-knowledge__list-actions"><button type="button" disabled={Boolean(editor) || saving || Boolean(knowledge.error)} onClick={() => { setNotice(''); setEditor({ key: material.id, material }); }}><Pencil size={15} />Revisar / editar</button>{material.status !== 'archived' && <button type="button" disabled={Boolean(editor) || saving || Boolean(knowledge.error)} onClick={() => void archive(material)}><Archive size={15} />Arquivar</button>}</div></article>)}</div>
    <p className="giro-library__muted">As consultas usam apenas materiais publicados da temporada atual e os campos técnicos do projeto e do robô. Notas, senhas e perfis dos alunos não entram na biblioteca.</p>
  </div>;
}
