import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { CloudOff, Save, Trash2 } from 'lucide-react';
import { GearShopContext } from '../hooks/useGearShopContext';
import { captureDraftFields, clearSubmittedDraft, formDraftKey, readFormDraft, restoreDraftFields, writeFormDraft } from '../utils/formDrafts';

export default function DraftForm({ kind, recordId, scope, ...props }) {
  const experience = useContext(GearShopContext);
  const key = formDraftKey(scope || experience?.draftScope || 'local', kind, recordId);
  return <DraftFormFields key={key} storageKey={key} kind={kind} {...props} />;
}

function DraftFormFields({ storageKey: key, kind, values, onSubmit, onDiscard, children, ...props }) {
  const [initial] = useState(() => { try { return readFormDraft(localStorage, key); } catch { return null; } });
  const [notice, setNotice] = useState(initial ? 'Rascunho recuperado. Você pode continuar de onde parou.' : 'Seu texto é salvo automaticamente neste navegador.');
  const [storageError, setStorageError] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState(initial?.files || []);
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
    if (values === undefined || restoring.current) return;
    const fields = captureDraftFields(form.current);
    if (JSON.stringify(fields) === JSON.stringify(latest.current?.fields || baseline.current)) return;
    const next = { version: 1, requestId: latest.current?.requestId || crypto.randomUUID(), revision: crypto.randomUUID(), savedAt: new Date().toISOString(), fields, files };
    latest.current = next;
    try {
      if (!writeFormDraft(localStorage, key, next)) queueMicrotask(() => setStorageError(true));
    } catch { queueMicrotask(() => setStorageError(true)); }
  });

  const persist = () => {
    if (restoring.current) return latest.current;
    const selected = [...form.current.querySelectorAll('input[type=file]')].flatMap((input) => [...input.files].map((file) => file.name));
    const next = {
      version: 1, requestId: latest.current?.requestId || crypto.randomUUID(), revision: crypto.randomUUID(),
      savedAt: new Date().toISOString(), fields: captureDraftFields(form.current), files: selected.length ? selected : files,
    };
    latest.current = next;
    let stored = false;
    try { stored = writeFormDraft(localStorage, key, next); } catch { /* Storage can be blocked by the browser. */ }
    setStorageError(!stored);
    if (stored) setNotice('Rascunho salvo neste navegador.');
    if (selected.length) setFiles(selected);
    return next;
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
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    const submitted = persist();
    if (navigator.onLine === false) { setSubmitError('Você está sem conexão. O texto foi mantido; tente salvar novamente quando a internet voltar.'); return; }
    busy.current = true; setSaving(true); setSubmitError('');
    try {
      const confirmed = await onSubmit(event, { draftId: submitted.requestId });
      if (confirmed === true) {
        completion.current = { fields: latest.current?.revision !== submitted.revision ? latest.current?.fields : null };
        try {
          clearSubmittedDraft(localStorage, key, submitted);
          if (latest.current?.requestId === submitted.requestId && latest.current?.revision === submitted.revision) {
            latest.current = null; setFiles([]); setNotice('Registro confirmado. Nenhum rascunho pendente.');
          } else setNotice('Registro confirmado. Suas alterações mais recentes continuam como rascunho.');
        } catch {
          setStorageError(true);
          if (latest.current?.revision === submitted.revision) latest.current = null;
        }
      }
    } catch { setSubmitError('Não foi possível confirmar o envio. Seu texto foi mantido para tentar novamente.'); }
    finally { busy.current = false; setSaving(false); }
  };

  return <form {...props} ref={form} onSubmit={submit} onInputCapture={persist} onChangeCapture={persist} aria-busy={saving} data-draft-kind={kind}>
    <div className="mb-4 w-full rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-[11px] leading-relaxed text-cyan-100">
      <div className="flex items-start justify-between gap-3"><p role="status" className="flex items-start gap-2"><Save size={14} className="mt-0.5 shrink-0" />{notice}</p><button type="button" disabled={saving} onClick={discard} aria-label="Descartar rascunho" className="shrink-0 rounded p-1 text-slate-400 hover:text-white disabled:opacity-40"><Trash2 size={14} /></button></div>
      {files.length ? <p className="mt-2 text-amber-100">Fotos e arquivos precisam ser selecionados novamente ao reabrir: {files.join(', ')}.</p> : null}
      {storageError ? <p role="alert" className="mt-2 text-amber-100">Não consegui guardar o rascunho neste navegador. Mantenha esta página aberta até confirmar o registro.</p> : null}
      {submitError ? <p role="alert" className="mt-2 flex items-start gap-2 text-amber-100"><CloudOff size={14} className="shrink-0" />{submitError}</p> : null}
      {saving ? <p role="status" className="mt-2">Aguardando confirmação do registro…</p> : null}
    </div>
    {children}
  </form>;
}
