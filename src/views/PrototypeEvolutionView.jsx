import { useEffect, useMemo, useState } from 'react';
import { Camera, CheckCircle2, Clock3, GitBranch, Image as ImageIcon, Lightbulb, LoaderCircle, MessageSquareQuote, Plus, RefreshCw, Sparkles, Target, TrendingUp } from 'lucide-react';

const getLocalDateInputValue = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const EMPTY_DRAFT = {
  version: '',
  focus: '',
  date: getLocalDateInputValue(),
  participants: '',
  feedback: '',
  improvement: '',
  result: '',
  nextStep: '',
};

const formatDate = (value) => {
  if (!value) return 'Data não informada';
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(parsed);
};

const Field = ({ label, name, value, onChange, placeholder, required = false, rows = 1 }) => (
  <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
    {label}
    {rows > 1 ? (
      <textarea name={name} value={value} onChange={onChange} required={required} rows={rows} maxLength={1200} placeholder={placeholder} className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case leading-relaxed text-white outline-none placeholder:text-gray-600 focus:border-emerald-400" />
    ) : (
      <input name={name} value={value} onChange={onChange} required={required} maxLength={100} placeholder={placeholder} className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm font-normal normal-case text-white outline-none placeholder:text-gray-600 focus:border-emerald-400" />
    )}
  </label>
);

export default function PrototypeEvolutionView({ iterations = [], onSave }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const sortedIterations = useMemo(
    () => [...iterations].sort((left, right) => new Date(right.date || right.createdAt || 0) - new Date(left.date || left.createdAt || 0)),
    [iterations],
  );
  const iterationCount = iterations.length;
  const feedbackCount = iterations.filter((item) => item.feedback?.trim()).length;
  const photoCount = iterations.filter((item) => item.photo).length;

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const updateDraft = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
    setSaveError('');
    setSaveSuccess(false);
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    setPhoto(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
    setSaveError('');
    setSaveSuccess(false);
    event.target.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const saved = await onSave({ ...draft, photo });
      if (!saved) {
        setSaveError('Não foi possível salvar esta versão. Confira a conexão e tente novamente.');
        return;
      }
      setDraft({ ...EMPTY_DRAFT, date: getLocalDateInputValue() });
      setPhoto(null);
      setPreviewUrl('');
      setSaveSuccess(true);
    } catch {
      setSaveError('Não foi possível salvar esta versão. Confira a conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="newgears-major-panel overflow-hidden rounded-[28px] border border-emerald-400/20 bg-gradient-to-br from-[#10251e] via-[#151a22] to-[#111722] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200/80"><GitBranch size={14} />Criar · Iterar · Comunicar</p>
            <h2 className="mt-3 text-3xl font-black text-white">Evolução do protótipo</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">Registrem cada versão com foto, feedback e melhoria aplicada. A linha do tempo transforma o processo de criação em evidências prontas para apresentar aos juízes.</p>
          </div>
          <div className="grid min-w-[260px] grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><p className="text-[9px] font-bold uppercase tracking-wide text-gray-500">Versões</p><p className="mt-2 text-2xl font-black text-white">{iterationCount}</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><p className="text-[9px] font-bold uppercase tracking-wide text-gray-500">Feedbacks</p><p className="mt-2 text-2xl font-black text-white">{feedbackCount}</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><p className="text-[9px] font-bold uppercase tracking-wide text-gray-500">Fotos</p><p className="mt-2 text-2xl font-black text-white">{photoCount}</p></div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr,1.1fr]">
        <form onSubmit={handleSubmit} className="h-fit space-y-4 rounded-[24px] border border-white/10 bg-[#141925] p-5 md:p-6">
          <div className="mb-1 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200"><Plus size={19} /></div><div><h3 className="text-lg font-black text-white">Registrar uma versão</h3><p className="text-[11px] text-gray-500">Um registro para cada mudança importante.</p></div></div>
          <div className="grid gap-3 sm:grid-cols-[1fr,170px]">
            <Field label="Versão" name="version" value={draft.version} onChange={updateDraft} required placeholder="Ex.: Protótipo 2" />
            <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Data<input type="date" name="date" value={draft.date} onChange={updateDraft} required className="mt-1 w-full rounded-xl border border-white/10 bg-[#10141e] px-3 py-2.5 text-sm font-normal normal-case text-white outline-none focus:border-emerald-400" /></label>
          </div>
          <Field label="Nome desta etapa" name="focus" value={draft.focus} onChange={updateDraft} required placeholder="Ex.: modelo com encaixe ajustável" />
          <Field label="Quem participou desta versão?" name="participants" value={draft.participants} onChange={updateDraft} placeholder="Nomes dos alunos que contribuíram" />
          <label className="block space-y-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Foto do protótipo <span className="font-normal normal-case text-gray-500">(opcional, JPG ou PNG)</span>
            <span className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-white/15 bg-black/20 p-3">
            <input type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} className="min-w-0 flex-1 text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-400/10 file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-emerald-100" />
              {previewUrl ? <img src={previewUrl} alt="Prévia da versão do protótipo" className="h-16 w-20 rounded-lg border border-white/10 object-cover" /> : <Camera size={20} className="text-gray-600" />}
            </span>
          </label>
          <Field label="Feedback recebido · de quem e o que sugeriu?" name="feedback" value={draft.feedback} onChange={updateDraft} rows={3} placeholder="Ex.: uma pessoa que testou sugeriu aumentar a estabilidade da base." />
          <Field label="Melhoria aplicada · o que mudou?" name="improvement" value={draft.improvement} onChange={updateDraft} rows={3} required placeholder="Ex.: alargamos a base e mudamos o ponto de fixação." />
          <Field label="Resultado observado" name="result" value={draft.result} onChange={updateDraft} rows={2} placeholder="O que o novo teste mostrou?" />
          <Field label="Próximo passo" name="nextStep" value={draft.nextStep} onChange={updateDraft} rows={2} placeholder="O que a equipe quer testar depois?" />
          {saveError ? <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-100"><RefreshCw size={14} />{saveError}</div> : null}
          {saveSuccess ? <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-emerald-100"><CheckCircle2 size={14} />Versão registrada na linha do tempo.</div> : null}
          <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-black text-[#07110d] transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60">{saving ? <><LoaderCircle size={16} className="animate-spin" />Salvando versão…</> : <><Plus size={16} />Adicionar à evolução</>}</button>
        </form>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200/70">Histórico visual</p><h3 className="mt-1 text-xl font-black text-white">Versões e melhorias</h3></div><span className="text-xs text-gray-500">{iterationCount} registro(s)</span></div>
          {sortedIterations.length ? sortedIterations.map((item, index) => (
            <article key={item.id} className="overflow-hidden rounded-[24px] border border-white/10 bg-[#141925] shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
                  <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-black/15 px-4 py-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-xs font-black text-emerald-100">{sortedIterations.length - index}</span><div><p className="text-sm font-black text-white">{item.version || 'Versão'} · {item.focus}</p><p className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-500"><Clock3 size={11} />{formatDate(item.date)} · registro de {item.author || 'Equipe'}{item.participants ? ` · participaram ${item.participants}` : ''}</p></div></div></div>
              <div className="grid md:grid-cols-[minmax(0,0.85fr),minmax(0,1.15fr)]">
                {item.photo ? <div className="min-h-[210px] bg-black/30"><img src={item.photo} alt={`Foto de ${item.version || 'versão'}: ${item.focus || 'protótipo'}`} className="h-full max-h-[360px] min-h-[210px] w-full object-cover" /></div> : <div className="flex min-h-[160px] items-center justify-center bg-black/20 text-gray-600"><ImageIcon size={32} /></div>}
                <div className="space-y-3 p-4">
                  {item.feedback ? <div className="flex gap-2"><MessageSquareQuote size={15} className="mt-0.5 shrink-0 text-amber-200" /><p className="text-xs leading-relaxed text-gray-300"><span className="font-bold text-amber-100">Feedback:</span> {item.feedback}</p></div> : null}
                  {item.improvement ? <div className="flex gap-2"><Sparkles size={15} className="mt-0.5 shrink-0 text-emerald-200" /><p className="text-xs leading-relaxed text-gray-300"><span className="font-bold text-emerald-100">Melhoria:</span> {item.improvement}</p></div> : null}
                  {item.result ? <div className="flex gap-2"><TrendingUp size={15} className="mt-0.5 shrink-0 text-cyan-200" /><p className="text-xs leading-relaxed text-gray-300"><span className="font-bold text-cyan-100">Resultado:</span> {item.result}</p></div> : null}
                  {item.nextStep ? <div className="flex gap-2"><Target size={15} className="mt-0.5 shrink-0 text-purple-200" /><p className="text-xs leading-relaxed text-gray-300"><span className="font-bold text-purple-100">Próximo passo:</span> {item.nextStep}</p></div> : null}
                </div>
              </div>
            </article>
          )) : <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 p-10 text-center"><Lightbulb className="mx-auto text-emerald-200/60" size={28} /><p className="mt-3 text-sm font-bold text-gray-300">A evolução do protótipo começa com a primeira versão.</p><p className="mt-1 text-xs text-gray-500">Adicionem uma foto, contem o que mudou e registrem o que aprenderam.</p></div>}
        </section>
      </section>
    </div>
  );
}
