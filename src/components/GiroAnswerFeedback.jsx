import { useState } from 'react';
import { Check, ThumbsDown, ThumbsUp } from 'lucide-react';
import { auth } from '../firebase';
import useGearShopContext from '../hooks/useGearShopContext';
import { saveGiroFeedback } from '../services/giroFeedback';
import { giroKnowledgeError } from '../services/giroKnowledge';

export default function GiroAnswerFeedback({ message, question }) {
  const { db, user, knowledge } = useGearShopContext();
  const [rating, setRating] = useState('');
  const [note, setNote] = useState('');
  const [state, setState] = useState({ saving: false, saved: false, error: '' });
  if (!question) return null;
  const submit = async (event) => {
    event.preventDefault();
    if (state.saving || state.saved) return;
    setState({ saving: true, saved: false, error: '' });
    try {
      const ownerId = auth.currentUser?.uid || String(user?.studentId || user?.uid || 'local-technical');
      await saveGiroFeedback({ db, user, ownerId, seasonId: knowledge.seasonId, id: message.id, feedback: { rating, note, question, answer: message.text, sources: message.sources } });
      setState({ saving: false, saved: true, error: '' });
    } catch (error) { setState({ saving: false, saved: false, error: giroKnowledgeError(error) }); }
  };
  return <div className="giro-ai__feedback">
    {state.saved ? <p role="status"><Check size={14} />Avaliação enviada para revisão do técnico.</p> : <>
      <div><span>Esta resposta ajudou?</span><button type="button" aria-pressed={rating === 'helpful'} disabled={state.saving} onClick={() => setRating('helpful')}><ThumbsUp size={14} />Ajudou</button><button type="button" aria-pressed={rating === 'incorrect'} disabled={state.saving} onClick={() => setRating('incorrect')}><ThumbsDown size={14} />Tem erro</button></div>
      {rating && <form onSubmit={submit}><label>O que devemos revisar? <span>(opcional)</span><textarea aria-label="Comentário sobre a resposta" value={note} maxLength={1000} disabled={state.saving} onChange={(event) => setNote(event.target.value)} placeholder={rating === 'incorrect' ? 'Conte qual parte parece incorreta e indique a fonte, se tiver.' : 'Conte o que ajudou você.'} /></label><p>O técnico recebe esta pergunta, a resposta e seu comentário. Isso não treina a IA automaticamente.</p><div><button type="button" disabled={state.saving} onClick={() => setRating('')}>Cancelar</button><button type="submit" disabled={state.saving}>{state.saving ? 'Enviando…' : 'Enviar avaliação'}</button></div></form>}
      {state.error && <p role="alert">{state.error}</p>}
    </>}
  </div>;
}
