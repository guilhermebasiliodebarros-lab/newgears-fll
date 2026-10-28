import { useId, useState } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, Search } from 'lucide-react';
import { GIRO_MATERIAL_CATEGORIES } from '../utils/giroKnowledge';
import { safeGiroURL } from '../utils/giroAI';

export function GiroMaterialReader({ material, initialPage = 1, onBack }) {
  const [pageNumber, setPageNumber] = useState(initialPage);
  const selectId = useId();
  const page = material?.pages?.find((item) => item.number === pageNumber) || material?.pages?.[0];
  const url = safeGiroURL(material?.sourceURL);
  return <section className="giro-library__reader">
    <button type="button" className="giro-library__back" onClick={onBack}><ArrowLeft size={15} />Voltar</button>
    {!material ? <p role="status">Este material foi retirado da biblioteca ou não está mais disponível nesta temporada. Faça uma nova consulta para usar as fontes atuais.</p> : <>
      <p className="giro-library__eyebrow">{material.system ? 'Registro do sistema' : GIRO_MATERIAL_CATEGORIES[material.category]}</p>
      <h3>{material.title}</h3>
      {!material.system && <p className="giro-library__muted">{material.fileName || 'Conteúdo cadastrado pelo técnico'} · Atualizado em {material.updatedAt ? new Date(material.updatedAt).toLocaleDateString('pt-BR') : '—'}</p>}
      {url && <a href={url} target="_blank" rel="noopener noreferrer" className="giro-library__back"><ExternalLink size={14} />Abrir fonte original</a>}
      {material.pages?.length > 1 && <label className="giro-library__page" htmlFor={selectId}>Página<select id={selectId} value={page?.number || 1} onChange={(event) => setPageNumber(Number(event.target.value))}>{material.pages.map((item) => <option key={item.number} value={item.number}>{item.number}</option>)}</select>de {material.pages.length}</label>}
      <pre className="giro-library__text">{page?.text || 'Esta página não contém texto selecionável.'}</pre>
    </>}
  </section>;
}

export default function GiroMaterialLibrary({ materials, initialSource, onReturn }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(initialSource || null);
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const visible = materials.filter((material) => normalize(`${material.title} ${material.tags || ''} ${GIRO_MATERIAL_CATEGORIES[material.category] || ''}`).includes(normalize(search.trim())));
  if (selected) return <GiroMaterialReader key={`${selected.materialId}:${selected.page}`} material={materials.find((item) => item.id === selected.materialId)} initialPage={selected.page} onBack={() => setSelected(null)} />;
  return <section className="giro-library__browse">
    <button type="button" className="giro-library__back" onClick={onReturn}><ArrowLeft size={15} />Voltar à conversa</button>
    <h3>Materiais disponíveis</h3><p className="giro-library__muted">Conteúdos publicados nesta temporada e registros técnicos da equipe.</p>
    <label className="giro-library__search"><Search size={16} /><input aria-label="Filtrar materiais" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Título, categoria ou palavra-chave" /></label>
    {!visible.length && <p className="giro-library__muted">{materials.length ? 'Nenhum material corresponde ao filtro.' : 'O técnico ainda não publicou materiais nesta temporada.'}</p>}
    <div className="giro-library__cards">{visible.map((material) => <button type="button" key={material.id} onClick={() => setSelected({ materialId: material.id, page: 1 })}><BookOpen size={18} /><span><strong>{material.title}</strong><small>{material.system ? 'Registro do sistema' : `${GIRO_MATERIAL_CATEGORIES[material.category]} · ${material.pages.length} página(s)`}</small></span></button>)}</div>
  </section>;
}
