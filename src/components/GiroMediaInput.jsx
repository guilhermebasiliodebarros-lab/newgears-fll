import { useEffect, useRef, useState } from 'react';
import { AudioLines, ImagePlus, LoaderCircle, Mic, Square, X } from 'lucide-react';
import { GIRO_AUDIO_MAX_SECONDS, mixGiroAudio, prepareGiroImage } from '../utils/giroMedia';

export default function GiroMediaInput({ images, onImages, onTranscript, disabled, onBusy }) {
  const [state, setState] = useState({ busy: false, text: '', error: '' });
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audio, setAudio] = useState(null);
  const photoInput = useRef(null);
  const audioInput = useRef(null);
  const recorder = useRef(null);
  const stream = useRef(null);
  const worker = useRef(null);
  const audioPreview = useRef(null);
  const active = useRef(true);
  const operation = useRef(0);
  const pending = useRef(false);
  const clearStream = () => { stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; };
  useEffect(() => {
    active.current = true;
    const lifecycle = operation;
    return () => { active.current = false; lifecycle.current++; worker.current?.terminate(); if (recorder.current?.state === 'recording') recorder.current.stop(); clearStream(); };
  }, []);
  useEffect(() => {
    onBusy?.(state.busy || recording);
    return () => onBusy?.(false);
  }, [state.busy, recording, onBusy]);
  useEffect(() => {
    if (!recording) return;
    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      setSeconds(elapsed);
      if (elapsed >= GIRO_AUDIO_MAX_SECONDS && recorder.current?.state === 'recording') recorder.current.stop();
    }, 250);
    return () => clearInterval(timer);
  }, [recording]);
  useEffect(() => {
    if (!audio) return;
    const url = URL.createObjectURL(audio);
    const element = audioPreview.current;
    if (element) element.src = url;
    return () => URL.revokeObjectURL(url);
  }, [audio]);
  const attachPhoto = async (file) => {
    if (pending.current || disabled) return;
    if (images.length >= 2) { setState({ busy: false, text: '', error: 'Envie até duas fotos por pergunta.' }); return; }
    pending.current = true; const token = ++operation.current;
    setState({ busy: true, text: 'Preparando foto…', error: '' });
    try {
      const result = await prepareGiroImage(file);
      if (active.current && operation.current === token) { onImages([...images, result]); setState({ busy: false, text: '', error: '' }); }
    } catch (error) { if (active.current && operation.current === token) setState({ busy: false, text: '', error: error.message || 'Não foi possível abrir essa foto.' }); }
    finally { if (operation.current === token) pending.current = false; }
  };
  const selectAudio = (file) => {
    if (!file?.size || file.size > 15 * 1024 * 1024 || (!file.type.startsWith('audio/') && !/\.(wav|mp3|m4a|ogg|webm|aac|flac)$/i.test(file.name || ''))) { setState({ busy: false, text: '', error: 'Escolha um arquivo de áudio de até 15 MB e 60 segundos.' }); return; }
    setAudio(file); setState({ busy: false, text: '', error: '' });
  };
  const startRecording = async () => {
    if (pending.current || disabled) return;
    pending.current = true; const token = ++operation.current;
    setState({ busy: true, text: 'Aguardando o microfone…', error: '' });
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('A gravação exige HTTPS ou localhost e um navegador com microfone. Você pode anexar um áudio.');
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!active.current || token !== operation.current) { media.getTracks().forEach((track) => track.stop()); return; }
      stream.current = media;
      const capture = new MediaRecorder(media); const chunks = [];
      capture.ondataavailable = ({ data }) => { if (data.size) chunks.push(data); };
      capture.onstop = () => { clearStream(); if (active.current) { setRecording(false); setAudio(new Blob(chunks, { type: capture.mimeType || 'audio/webm' })); } };
      capture.onerror = () => { clearStream(); if (active.current) { setRecording(false); setState({ busy: false, text: '', error: 'A gravação foi interrompida. Tente novamente.' }); } };
      recorder.current = capture; capture.start(); setSeconds(0); setRecording(true); setAudio(null); setState({ busy: false, text: '', error: '' });
    } catch (error) { clearStream(); if (active.current) setState({ busy: false, text: '', error: error.name === 'NotAllowedError' ? 'Microfone não autorizado. Libere o acesso no navegador ou anexe um áudio.' : error.message }); }
    finally { pending.current = false; }
  };
  const cancelTranscription = () => { operation.current++; worker.current?.terminate(); worker.current = null; pending.current = false; setState({ busy: false, text: '', error: '' }); };
  const transcribe = async () => {
    if (!audio || pending.current || disabled) return;
    pending.current = true; const token = ++operation.current;
    setState({ busy: true, text: 'Lendo áudio…', error: '' });
    let context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error('Este navegador não consegue preparar o áudio. Tente o Chrome ou o Edge atualizado.');
      context = new AudioContext();
      const decoded = await context.decodeAudioData(await audio.arrayBuffer());
      const samples = mixGiroAudio(Array.from({ length: decoded.numberOfChannels }, (_, index) => decoded.getChannelData(index)), decoded.sampleRate);
      if (!active.current || token !== operation.current) return;
      worker.current ??= new Worker(new URL('../workers/giroTranscribe.js', import.meta.url), { type: 'module' });
      worker.current.onmessage = ({ data }) => {
        if (!active.current || token !== operation.current) return;
        if (data.type === 'progress') { setState({ busy: true, text: data.text, error: '' }); return; }
        pending.current = false;
        if (data.type === 'complete' && data.text) {
          if (onTranscript(data.text) === false) { setState({ busy: false, text: '', error: 'A transcrição e a pergunta ultrapassam 4.000 caracteres. Encurte a pergunta ou o áudio.' }); return; }
          setAudio(null); setState({ busy: false, text: 'Transcrição adicionada à pergunta. Revise antes de enviar.', error: '' });
        }
        else setState({ busy: false, text: '', error: data.text || 'Não identifiquei fala. Tente gravar mais perto do microfone.' });
      };
      worker.current.onerror = () => { if (active.current && token === operation.current) { pending.current = false; worker.current?.terminate(); worker.current = null; setState({ busy: false, text: '', error: 'A transcrição não iniciou. Confira sua conexão ou tente outro navegador.' }); } };
      setState({ busy: true, text: 'Preparando transcrição… O primeiro uso baixa o recurso de voz.', error: '' });
      worker.current.postMessage({ audio: samples }, [samples.buffer]);
    } catch (error) { if (active.current && token === operation.current) { pending.current = false; setState({ busy: false, text: '', error: error.message || 'Formato de áudio não reconhecido neste navegador.' }); } }
    finally { if (context) await context.close().catch(() => {}); }
  };
  return <div className="giro-ai__media">
    <div className="giro-ai__media-actions"><button type="button" disabled={disabled || state.busy || recording || images.length >= 2} onClick={() => photoInput.current?.click()}><ImagePlus size={16} />Foto</button><button type="button" disabled={disabled || state.busy || recording} onClick={() => audioInput.current?.click()}><AudioLines size={16} />Áudio</button>{recording ? <button type="button" className="giro-ai__recording" onClick={() => recorder.current?.stop()}><Square size={14} />Parar · {seconds}s / 60s</button> : <button type="button" disabled={disabled || state.busy} onClick={startRecording}><Mic size={16} />Gravar</button>}</div>
    <input hidden ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void attachPhoto(file); }} /><input hidden ref={audioInput} type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.flac" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) selectAudio(file); }} />
    {images.length > 0 && <div className="giro-ai__previews">{images.map((image, index) => <figure key={`${image.name}:${index}`}><img src={image.dataURL} alt={`Foto anexada: ${image.name}`} /><figcaption>{image.name}</figcaption><button type="button" disabled={disabled || state.busy} aria-label={`Remover foto ${index + 1}`} onClick={() => onImages(images.filter((_, position) => index !== position))}><X size={13} /></button></figure>)}</div>}
    {audio && <div className="giro-ai__audio-preview"><audio ref={audioPreview} controls aria-label="Ouvir áudio antes de transcrever" /><p>Até 60 segundos. A fala é transcrita neste dispositivo. No primeiro uso, o recurso de voz precisa ser baixado e pode demorar.</p><div><button type="button" disabled={disabled || state.busy} onClick={transcribe}>Transcrever para a pergunta</button><button type="button" disabled={state.busy} onClick={() => setAudio(null)}>Descartar áudio</button></div></div>}
    {state.text && <p role="status">{state.busy && <LoaderCircle size={13} />}{state.text}{state.busy && <button type="button" onClick={cancelTranscription}>Cancelar</button>}</p>}{state.error && <p role="alert" className="giro-ai__error">{state.error}</p>}
    {images.length > 0 && <p>As fotos serão enviadas à NVIDIA com esta pergunta. Elas não ficam salvas no histórico.</p>}
  </div>;
}
