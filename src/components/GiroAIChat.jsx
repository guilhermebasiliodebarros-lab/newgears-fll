import { useEffect, useId, useRef, useState } from 'react';
import { BookOpen, Check, Copy, LoaderCircle, MessageCircle, RefreshCw, Send, Settings2, Sparkles, Square, Trash2, Volume2, X } from 'lucide-react';
import useGearShopContext from '../hooks/useGearShopContext';
import useGiroAI from '../hooks/useGiroAI';
import useGiroSpeech from '../hooks/useGiroSpeech';
import { GIRO_AI_MAX_QUESTION, GIRO_AI_SUGGESTIONS, giroSpeechText } from '../utils/giroAI';
import GearMascot from './GearMascot';
import GiroAIMessage from './GiroAIMessage';
import GiroMaterialLibrary from './GiroMaterialLibrary';
import GiroAnswerFeedback from './GiroAnswerFeedback';
import GiroMediaInput from './GiroMediaInput';
import './GiroAIChat.css';
import './GiroKnowledge.css';
import './GiroEnhancements.css';

export default function GiroAIChat({ onClose }) {
  const { account, draftScope, knowledge, aiContext, workshop, user, onOpenKnowledge } = useGearShopContext();
  const chat = useGiroAI(draftScope || account.studentId || 'technical', knowledge, aiContext);
  const titleId = useId();
  const dialog = useRef(null);
  const bottom = useRef(null);
  const input = useRef(null);
  const [copied, setCopied] = useState('');
  const [copyError, setCopyError] = useState('');
  const [library, setLibrary] = useState(null);
  const [images, setImages] = useState([]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [mediaSession, setMediaSession] = useState(0);
  const lastAnswer = chat.messages.filter((item) => item.role === 'assistant').at(-1);
  const speech = useGiroSpeech(lastAnswer ? giroSpeechText(lastAnswer.text) : '', lastAnswer?.id, account.studentId || 'tecnico');
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    input.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' }); }, [chat.messages.length, chat.pending, chat.error]);
  const copy = async (message) => {
    try { await navigator.clipboard.writeText(message.text); setCopied(message.id); setCopyError(''); }
    catch { setCopyError('Não foi possível copiar. Você pode selecionar o texto da resposta.'); }
  };
  const ready = chat.ready;
  const openLibrary = (source = {}) => { speech.stop(); setLibrary(source); };
  const clearConversation = () => { speech.stop(); chat.clear(); setImages([]); setMediaBusy(false); setMediaSession((value) => value + 1); setLibrary(null); requestAnimationFrame(() => input.current?.focus()); };
  return <dialog ref={dialog} className="giro-ai" aria-labelledby={titleId} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } }} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === dialog.current) { const bounds = dialog.current.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}>
    <header className="giro-ai__header"><div className="giro-ai__mascot"><GearMascot equipment={account.equipped} mood={chat.pending ? 'work' : 'wave'} speaking={speech.speaking} expression={workshop?.expression} decorative /></div><div><p><Sparkles size={12} />New Gears</p><h2 id={titleId}>Giro IA</h2><span>Vamos transformar dúvidas em descobertas.</span></div><button type="button" onClick={onClose} aria-label="Fechar Giro IA"><X size={20} /></button></header>
    <div className="giro-ai__toolbar"><button type="button" onClick={() => library ? setLibrary(null) : openLibrary()} aria-pressed={Boolean(library)}><BookOpen size={15} />{library ? 'Conversa' : `Materiais (${knowledge.published.length})`}</button>{user?.type === 'admin' && onOpenKnowledge && <button type="button" onClick={() => { onClose(); onOpenKnowledge(); }}><Settings2 size={14} />Gerenciar biblioteca</button>}<button type="button" onClick={clearConversation}><Trash2 size={14} />Nova conversa</button></div>
    {!library && <div className="giro-ai__toolbar"><label><input type="checkbox" checked={chat.useKnowledge} disabled={Boolean(chat.pending)} onChange={(event) => chat.setUseKnowledge(event.target.checked)} /><BookOpen size={14} />Usar materiais da equipe</label><span>Respostas com inteligência artificial</span></div>}
    <div className="giro-ai__conversation" aria-label={library ? 'Biblioteca do Giro' : 'Conversa com Giro IA'}>
      {library ? <GiroMaterialLibrary materials={knowledge.published} initialSource={library.materialId ? library : null} onReturn={() => { setLibrary(null); requestAnimationFrame(() => input.current?.focus()); }} /> : <>
        {!chat.messages.length && <section className="giro-ai__welcome"><div><MessageCircle size={28} /></div><h3>O que vamos descobrir?</h3><p>Converse comigo sobre robô, programação, projeto de inovação, apresentações e outras dúvidas. Também posso explicar os trechos relevantes dos materiais publicados pela equipe e indicar suas fontes. Para regras do torneio, confira os documentos da temporada.</p><div className="giro-ai__suggestions">{GIRO_AI_SUGGESTIONS.map((question) => <button type="button" key={question} disabled={Boolean(chat.pending)} onClick={() => { chat.setDraft(question); input.current?.focus(); }}>{question}</button>)}</div></section>}
        {chat.messages.map((message, messageIndex) => <article key={message.id} className={`giro-ai__message giro-ai__message--${message.role}`}><p className="giro-ai__author">{message.role === 'assistant' ? 'Giro IA' : 'Você'}{message.role === 'assistant' && <span><Sparkles size={11} />Resposta da IA</span>}</p><GiroAIMessage text={message.text} />
          {message.media?.length > 0 && <p className="giro-ai__media-history">{message.media.length} foto(s) enviada(s) · anexe novamente para uma nova análise visual</p>}
          {message.sources?.length > 0 && <div className="giro-ai__sources"><p>Materiais citados · abra para conferir o contexto atual</p>{message.sources.map((source, index) => <button type="button" key={`${source.materialId}:${source.page}:${index}`} onClick={() => openLibrary(source)}><BookOpen size={13} />{source.number || index + 1}. {source.title}{source.system ? ' · sistema' : ` · página ${source.page}`}</button>)}</div>}
          {message.role === 'assistant' && <div className="giro-ai__message-actions"><button type="button" onClick={() => copy(message)}>{copied === message.id ? <Check size={13} /> : <Copy size={13} />}{copied === message.id ? 'Copiado' : 'Copiar'}</button>{lastAnswer?.id === message.id && speech.supported && <button type="button" aria-pressed={speech.playing} onClick={speech.playing ? speech.stop : speech.speak}>{speech.playing ? <Square size={13} /> : <Volume2 size={14} />}{speech.playing ? 'Parar leitura' : 'Ouvir resposta'}</button>}</div>}
          {message.role === 'assistant' && <GiroAnswerFeedback message={message} question={chat.messages.slice(0, messageIndex).filter((item) => item.role === 'user').at(-1)?.text} />}
        </article>)}
        {chat.pending && <><article className="giro-ai__message giro-ai__message--user"><p className="giro-ai__author">Você</p><p>{chat.pending}</p></article><p role="status" className="giro-ai__thinking"><LoaderCircle size={17} />O Giro está preparando sua resposta…</p></>}
        {chat.error && <p role="alert" className="giro-ai__error">{chat.error}</p>}
        {copyError && <p role="alert" className="giro-ai__error">{copyError}</p>}
        {speech.error && <p role="alert" className="giro-ai__error">{speech.error}</p>}
        <div ref={bottom} />
      </>}
    </div>
    {!library && <footer className="giro-ai__footer">
      {!ready && <div className="giro-ai__connection" role="status"><p>{chat.connectionError || chat.status?.message || (chat.useKnowledge && knowledge.error ? `${knowledge.error} Você pode desativar “Usar materiais da equipe” para perguntas gerais.` : chat.useKnowledge && knowledge.loading ? 'Carregando os materiais da equipe…' : 'Conectando ao Giro IA…')}</p>{(chat.status || chat.connectionError || knowledge.error) && <button type="button" onClick={chat.reconnect}><RefreshCw size={13} />Tentar novamente</button>}</div>}
      {chat.storageError && <p role="alert" className="giro-ai__storage">O navegador não conseguiu guardar esta conversa. Mantenha a janela aberta para continuar.</p>}
      <GiroMediaInput key={mediaSession} images={images} onImages={setImages} onTranscript={chat.appendTranscript} disabled={Boolean(chat.pending)} onBusy={setMediaBusy} />
      <form onSubmit={async (event) => { event.preventDefault(); if (mediaBusy) return; speech.stop(); if (await chat.send(images)) setImages([]); }}><label className="sr-only" htmlFor={`${titleId}-question`}>Sua pergunta para o Giro IA</label><textarea autoFocus ref={input} id={`${titleId}-question`} value={chat.draft} disabled={Boolean(chat.pending)} maxLength={GIRO_AI_MAX_QUESTION} rows={2} placeholder="Pergunte ao Giro…" onChange={(event) => chat.setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form.requestSubmit(); } }} />{chat.pending ? <button type="button" className="giro-ai__send" onClick={chat.cancel} aria-label="Cancelar resposta do Giro IA"><Square size={18} /></button> : <button type="submit" className="giro-ai__send" disabled={!ready || mediaBusy || (!chat.draft.trim() && !images.length)} aria-label="Enviar pergunta ao Giro IA"><Send size={19} /></button>}</form>
      <p className="giro-ai__hint">{chat.draft.length}/{GIRO_AI_MAX_QUESTION} · Confira as fontes: a IA pode errar · Histórico neste navegador</p>
    </footer>}
  </dialog>;
}
