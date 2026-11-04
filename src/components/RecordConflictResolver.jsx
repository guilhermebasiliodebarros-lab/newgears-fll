import { useId, useState } from 'react';
import { compareRecordVersions, resolveRecordVersions } from '../utils/recordConflicts';

const display = (value, field, format) => format?.(value, field) ?? (value === null || value === undefined || value === '' ? 'Sem preenchimento' : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value));
export default function RecordConflictResolver({ conflict, labels = {}, format, onResolve, onCancel }) {
  const [choices, setChoices] = useState({});
  const id = useId();
  const rows = compareRecordVersions(conflict);
  const ready = rows.every((row) => !row.needsChoice || choices[row.field]);
  return <section aria-label="Comparar alterações" className="space-y-3 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-4">
    <h3 className="text-base font-bold text-amber-100">Este registro mudou em outro acesso</h3>
    <p className="text-xs leading-relaxed text-slate-300">Sua escrita foi mantida. Compare as versões e escolha o conteúdo dos campos alterados. As escolhas voltam ao formulário para você conferir e salvar novamente.</p>
    {rows.filter((row) => row.mineChanged || row.currentChanged).map((row) => <fieldset key={row.field} className="min-w-0 rounded-xl border border-white/15 p-3">
      <legend className="px-1 text-sm font-bold text-white">{labels[row.field] || row.field}</legend>
      <details className="mb-2 text-xs text-slate-400"><summary className="cursor-pointer">Versão original</summary><pre className="mt-2 whitespace-pre-wrap break-words font-sans">{display(row.original, row.field, format)}</pre></details>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>{[['current', 'Versão atual no sistema', row.current], ['mine', 'Sua versão', row.proposed]].map(([choice, title, value]) => <label key={choice} className="block min-w-0 rounded-lg border border-white/10 p-3 text-xs text-slate-200"><span className="flex min-h-8 items-center gap-2 font-bold"><input type="radio" name={`${id}-${row.field}`} value={choice} checked={(choices[row.field] || (!row.needsChoice && row.suggested)) === choice} onChange={() => setChoices((current) => ({ ...current, [row.field]: choice }))} />{title}</span><pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words font-sans leading-relaxed">{display(value, row.field, format)}</pre></label>)}</div>
      {row.needsChoice && !choices[row.field] && <p className="mt-2 text-xs text-amber-200">As duas versões alteraram este campo. Escolha qual manter.</p>}
    </fieldset>)}
    {!rows.some((row) => row.mineChanged || row.currentChanged) && <p className="text-xs text-slate-300">O conteúdo desses campos continua igual. Atualize a referência para salvar novamente.</p>}
    <div className="flex flex-wrap gap-2"><button type="button" disabled={!ready} onClick={() => onResolve(resolveRecordVersions(conflict, choices))} className="ng-button min-h-11 bg-amber-300 text-slate-950 disabled:opacity-40">Aplicar escolhas ao formulário</button>{onCancel && <button type="button" onClick={onCancel} className="ng-button min-h-11">Continuar editando meu texto</button>}</div>
  </section>;
}
