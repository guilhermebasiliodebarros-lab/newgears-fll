import { useEffect, useState } from 'react';
import { Check, MessageSquareText, NotebookPen } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import { reviewGiroFeedback, subscribeGiroFeedback } from '../services/giroFeedback';
import { giroKnowledgeError } from '../services/giroKnowledge';
import { giroFeedbackDraft } from '../utils/giroFeedback';
import GiroAIMessage from './GiroAIMessage';

function FeedbackItem({ item, onPrepare, onReview }) {
  const [correction, setCorrection] = useState(item.correction || '');
  const [state, setState] = useState({ saving: false, error: '' });
  const review = async () => {
    if (state.saving) return;
    setState({ saving: true, error: '' });
    try { await onReview(item, correction); }
    catch (error) { setState({ saving: false, error: giroKnowledgeError(error) }); }
  };
  return <article className="giro-feedback-review__item"><div className="giro-feedback-review__meta"><strong>{item.rating === 'incorrect' ? 'Resposta com possível erro' : 'Resposta que ajudou'}</strong><span>{item.status === 'reviewed' ? 'Revisada' : 'Aguardando revisão'} · {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span></div><h4>{item.question}</h4><details><summary>Ver resposta e fontes</summary><GiroAIMessage text={item.answer} />{item.sources?.map((source, index) => <p key={index}>{source.title} · página {source.page}</p>)}</details>{item.note && <p className="giro-feedback-review__note">Comentário: {item.note}</p>}
    <label>Orientação revisada pelo técnico<textarea aria-label={`Orientação revisada: ${item.question}`} rows={3} maxLength={4000} value={correction} disabled={state.saving || item.status === 'reviewed'} onChange={(event) => setCorrection(event.target.value)} placeholder="Escreva a orientação correta e suas fontes. Só materiais publicados entram nas consultas." /></label>
    <div className="giro-knowledge__actions">{item.status !== 'reviewed' && <button type="button" disabled={state.saving} onClick={review}><Check size={14} />{state.saving ? 'Salvando…' : 'Marcar como revisada'}</button>}<button type="button" disabled={correction.trim().length < 20 || state.saving} onClick={() => onPrepare(giroFeedbackDraft(item, correction))}><NotebookPen size={14} />Preparar material para a biblioteca</button></div>{state.error && <p role="alert" className="giro-knowledge__error">{state.error}</p>}
  </article>;
}

export default function GiroFeedbackReview({ onPrepare }) {
  const { db, user, knowledge } = useGearShopContext();
  const [state, setState] = useState({ items: [], loading: true, error: '' });
  const [filter, setFilter] = useState('open');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeGiroFeedback({ db, user, seasonId: knowledge.seasonId, onData: (items) => { if (active) setState({ items, loading: false, error: '' }); }, onError: (error) => { if (active) setState({ items: [], loading: false, error: giroKnowledgeError(error) }); } });
    return () => { active = false; unsubscribe(); };
  }, [db, user, knowledge.seasonId, retry]);
  const visible = state.items.filter((item) => filter === 'all' || item.status === filter);
  return <section className="giro-feedback-review"><header><div><h3><MessageSquareText size={20} />Avaliações das respostas</h3><p>Revise os relatos da equipe. Uma correção só entra nas consultas depois de ser salva e publicada na biblioteca.</p></div><select aria-label="Filtrar avaliações" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="open">Aguardando revisão</option><option value="reviewed">Revisadas</option><option value="all">Todas</option></select></header>
    {state.loading && <p role="status">Carregando avaliações…</p>}{state.error && <p role="alert" className="giro-knowledge__error">{state.error}<button type="button" onClick={() => setRetry((value) => value + 1)}>Tentar novamente</button></p>}{!state.loading && !state.error && !visible.length && <p>Nenhuma avaliação neste filtro.</p>}
    {visible.map((item) => <FeedbackItem key={`${item.id}:${item.status}`} item={item} onPrepare={onPrepare} onReview={(entry, correction) => reviewGiroFeedback({ db, user, seasonId: knowledge.seasonId, id: entry.id, correction })} />)}
  </section>;
}
