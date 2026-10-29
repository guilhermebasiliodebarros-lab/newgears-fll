const input = 'mt-1 w-full min-w-0 rounded-lg border border-white/15 bg-slate-950 p-2 text-sm text-white';
export default function TrajectoryObstacles({ plan, selectedId, onSelect, onChange, disabled }) {
  const selected = plan.obstacles.find((item) => item.id === selectedId);
  const add = (type) => {
    const next = { id: crypto.randomUUID(), type, name: `${type === 'mission' ? 'Missão' : 'Obstáculo'} ${plan.obstacles.length + 1}`, x: plan.settings.width / 2, y: plan.settings.height / 2, width: 20, height: 20, heading: 0 };
    onChange([...plan.obstacles, next]); onSelect(next.id);
  };
  const update = (data) => onChange(plan.obstacles.map((item) => item.id === selectedId ? { ...item, ...data } : item));
  return <details className="rounded-2xl border border-amber-300/20 bg-black/20 p-3">
    <summary className="cursor-pointer text-sm font-bold">Missões e obstáculos ({plan.obstacles.length})</summary>
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-2"><button disabled={disabled || plan.obstacles.length >= 40} onClick={() => add('mission')} className="rounded-lg border border-amber-300/30 px-3 py-2 text-xs disabled:opacity-40">Adicionar missão</button><button disabled={disabled || plan.obstacles.length >= 40} onClick={() => add('obstacle')} className="rounded-lg border border-rose-300/30 px-3 py-2 text-xs disabled:opacity-40">Adicionar obstáculo</button></div>
      <label className="block text-xs">Objeto selecionado<select aria-label="Objeto da mesa" value={selectedId} onChange={(event) => onSelect(event.target.value)} className={input}><option value="">Escolha para ajustar</option>{plan.obstacles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      {selected && <fieldset disabled={disabled} className="space-y-3">
        <label className="block text-xs">Nome do objeto<input maxLength={80} value={selected.name} className={input} onChange={(event) => update({ name: event.target.value })} /></label>
        <div className="grid grid-cols-2 gap-2">{[['x', 'X do objeto (cm)', 0, plan.settings.width], ['y', 'Y do objeto (cm)', 0, plan.settings.height], ['width', 'Largura do objeto (cm)', 1, 200], ['height', 'Altura do objeto (cm)', 1, 200], ['heading', 'Rotação do objeto (graus)', -180, 180]].map(([key, label, min, max]) => <label key={key} className="text-xs">{label}<input type="number" min={min} max={max} step="0.1" value={selected[key]} className={input} onChange={(event) => { const number = Number(event.target.value); if (Number.isFinite(number) && number >= min && number <= max) update({ [key]: number }); }} /></label>)}</div>
        <button onClick={() => { onChange(plan.obstacles.filter((item) => item.id !== selectedId)); onSelect(''); }} className="rounded-lg border border-rose-300/30 px-3 py-2 text-xs text-rose-200">Remover objeto</button>
      </fieldset>}
      <p className="text-xs leading-relaxed text-slate-400">Arraste os retângulos na mesa ou ajuste as coordenadas. Missões também geram aviso de contato; chegar ao modelo pode fazer parte do objetivo da saída.</p>
    </div>
  </details>;
}
