import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { CloudOff, Trash2 } from 'lucide-react';
import SaveStatus from './SaveStatus';
import { GearShopContext } from '../hooks/useGearShopContext';
import { captureDraftFields, clearSubmittedDraft, formDraftKey, readFormDraft, restoreDraftFields, writeFormDraft } from '../utils/formDrafts';

export default function DraftForm({ kind, recordId, scope, ...props }) {
  const experience = useContext(GearShopContext);
  const key = formDraftKey(scope || experience?.draftScope || 'local', kind, recordId);
  return <DraftFormFields key={key} storageKey={key} kind={kind} {...props} />;
}

function DraftFormFields({ storageKey: key, kind, values, fileNamesOverride, onSubmit, onDiscard, children, ...props }) {
  const [initial] = useState(() => { try { return readFormDraft(localStorage, key); } catch { return null; } });
  const [notice, setNotice] = useState(initial ? 'Rascunho recuperado neste dispositivo. Ainda não foi enviado.' : 'Seu texto será guardado como rascunho neste dispositivo.');
  const [saveState, setSaveState] = useState(initial ? 'draft' : 'idle');
  const [savedAt, setSavedAt] = useState(initial?.savedAt || '');
  const [storageError, setStorageError] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState(initial?.files || []);
  const effectiveFiles = fileNamesOverride ?? files;
  const form = useRef(null);
  const baseline = useRef(null);
  const restoring = useRef(false);
  const busy = useRef(false);
  const latest = useRef(initial);
  const completion = useRef(null);

  useLayoutEffect(() => {
    if (!baseline.current) baseline.current = captureDraftFields(form.current);
    if (!initial) return;
    restoring.current = true;
    restoreDraftFields(form.current, initial.fields);
    restoring.current = false;
  }, [initial]);

  // Controlled fields can also change through prompt buttons or a stopwatch.
  // Persist those changes even when no native input event was generated.
  useLayoutEffect(() => {
    if (completion.current) {
      const preserved = completion.current.fields;
      completion.current = null;
      if (preserved) {
        restoring.current = true;
        restoreDraftFields(form.current, preserved);
        restoring.current = false;
      } else baseline.current = captureDraftFields(form.current);
      return;
    }
    if (values === undefined || restoring.current || busy.current) return;
    const fields = captureDraftFields(form.current);
    if (JSON.stringify(fields) === JSON.stringify(latest.current?.fields || baseline.current) && JSON.stringify(effectiveFiles) === JSON.stringify(latest.current?.files || [])) return;
    const next = { version: 1, requestId: latest.current?.requestId || crypto.randomUUID(), revision: crypto.randomUUID(), savedAt: new Date().toISOString(), fields, files: effectiveFiles };
    latest.current = next;
    try {
      const stored = writeFormDraft(localStorage, key, next);
      queueMicrotask(() => { setStorageError(!stored); if (stored) { setSaveState('draft'); setSavedAt(next.savedAt); setNotice('Rascunho salvo neste dispositivo. Ainda não foi enviado.'); } else setSaveState('unavailable'); });
    } catch { queueMicrotask(() => { setStorageError(true); setSaveState('unavailable'); }); }
  });

  const persist = () => {
    if (restoring.current || !form.current) return latest.current;
    const selected = [...form.current.querySelectorAll('input[type=file]')].flatMap((input) => [...input.files].map((file) => file.name));
    const fields = captureDraftFields(form.current);
    const nextFiles = selected.length ? selected : effectiveFiles;
    const unchanged = latest.current && JSON.stringify(fields) === JSON.stringify(latest.current.fields) && JSON.stringify(nextFiles) === JSON.stringify(latest.current.files);
    const next = unchanged ? latest.current : {
      version: 1, requestId: latest.current?.requestId || crypto.randomUUID(), revision: crypto.randomUUID(),
      savedAt: new Date().toISOString(), fields, files: nextFiles,
    };
    latest.current = next;
    let stored = false;
    try { stored = writeFormDraft(localStorage, key, next); } catch { /* Storage can be blocked by the browser. */ }
    setStorageError(!stored);
    if (stored) { setNotice('Rascunho salvo neste dispositivo. Ainda não foi enviado.'); setSaveState('draft'); setSavedAt(next.savedAt); }
    else setSaveState('unavailable');
    if (selected.length) setFiles(selected);
    return next;
  };
  const captureChange = () => {
    persist();
    // Controlled fields derived from the edited control (such as task links)
    // are updated after React handles the native event.
    queueMicrotask(() => { if (busy.current) persist(); });
  };

  const discard = () => {
    try { localStorage.removeItem(key); } catch { setStorageError(true); return; }
    restoring.current = true;
    restoreDraftFields(form.current, baseline.current || []);
    for (const input of form.current.querySelectorAll('input[type=file]')) input.value = '';
    onDiscard?.();
    restoring.current = false;
    latest.current = null;
    completion.current = { fields: null };
    setFiles([]); setStorageError(false); setSubmitError('');
    setNotice('Rascunho descartado. Você pode começar novamente.');
    setSaveState('idle'); setSavedAt('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    const submitted = persist();
    if (navigator.onLine === false) { setSaveState('error'); setSubmitError('Você está sem conexão. O texto foi mantido; tente salvar novamente quando a internet voltar.'); return; }
    busy.current = true; setSaving(true); setSubmitError('');
    try {
      const confirmed = await onSubmit(event, { draftId: submitted.requestId });
      if (confirmed === true) {
        setSaveState('confirmed');
        completion.current = { fields: latest.current?.revision !== submitted.revision ? latest.current?.fields : null };
        try {
          clearSubmittedDraft(localStorage, key, submitted);
          if (latest.current?.requestId === submitted.requestId && latest.current?.revision === submitted.revision) {
            latest.current = null; setFiles([]); setNotice('Confirmado no sistema. Nenhum rascunho pendente.');
          } else { setSaveState('draft'); setNotice('Registro confirmado no sistema. Suas alterações mais recentes continuam como rascunho neste dispositivo.'); }
        } catch {
          setStorageError(true);
          setNotice('Confirmado no sistema. Não foi possível limpar o rascunho deste dispositivo.');
          if (latest.current?.revision === submitted.revision) latest.current = null;
        }
      } else { setSaveState('error'); setSubmitError('O envio não foi confirmado no sistema. Seu texto foi mantido para tentar novamente.'); }
    } catch (error) { setSaveState('error'); setSubmitError(error.message || 'Não foi possível confirmar o envio. Seu texto foi mantido para tentar novamente.'); }
    finally { busy.current = false; setSaving(false); }
  };

  return <form {...props} ref={form} onSubmit={submit} onInputCapture={captureChange} onChangeCapture={captureChange} onClickCapture={() => { if (busy.current) queueMicrotask(persist); }} aria-busy={saving} data-draft-kind={kind}>
    <div className="mb-4 w-full rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-[11px] leading-relaxed text-cyan-100">
      <div className="flex items-start justify-between gap-3"><SaveStatus state={saving ? 'sending' : saveState} message={saving || ['error', 'unavailable'].includes(saveState) ? undefined : notice} savedAt={savedAt} /><button type="button" disabled={saving} onClick={discard} aria-label="Descartar rascunho" className="shrink-0 rounded p-1 text-slate-400 hover:text-white disabled:opacity-40"><Trash2 size={14} /></button></div>
      {effectiveFiles.length ? <p className="mt-2 text-amber-100">Fotos e arquivos precisam ser selecionados novamente ao reabrir: {effectiveFiles.join(', ')}.</p> : null}
      {storageError ? <p role="alert" className="mt-2 text-amber-100">Não consegui guardar o rascunho neste navegador. Mantenha esta página aberta até confirmar o registro.</p> : null}
      {submitError ? <p role="alert" className="mt-2 flex items-start gap-2 text-amber-100"><CloudOff size={14} className="shrink-0" />{submitError}</p> : null}
    </div>
    {children}
  </form>;
}
