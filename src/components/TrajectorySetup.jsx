import { useState } from 'react';

const input = 'mt-1 w-full min-w-0 rounded-lg border border-white/15 bg-slate-950 p-2 text-sm text-white';
export default function TrajectorySetup({ settings, attachments = [], robotVersions = [], disabled, onChange }) {
  const [gripper, setGripper] = useState(settings.gripperLength > 0);
  return <details className="rounded-2xl border border-white/10 bg-black/15 p-3">
    <summary className="cursor-pointer text-sm font-bold">Robô e garra · {settings.robotName || 'Robô da equipe'}{settings.gripperLength > 0 ? ` + ${settings.gripperName || 'garra'}` : ''}</summary>
    <form className="mt-4 space-y-3" onSubmit={(event) => {
      event.preventDefault(); if (disabled) return;
      const values = new FormData(event.currentTarget);
      const next = { ...settings, robotName: values.get('robotName'), robotVersionId: values.get('robotVersionId'), robotLength: Number(values.get('robotLength')), robotWidth: Number(values.get('robotWidth')),
        gripperId: gripper ? values.get('gripperId') : '', gripperName: gripper ? values.get('gripperName') || attachments.find((item) => item.id === values.get('gripperId'))?.name || 'Garra personalizada' : '',
        ...Object.fromEntries(['gripperLength', 'gripperWidth', 'gripperX', 'gripperY'].map((key) => [key, gripper ? Number(values.get(key)) : 0])),
      };
      onChange(next);
    }}>
      <fieldset disabled={disabled} className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs">Nome do robô<input className={input} name="robotName" maxLength={100} defaultValue={settings.robotName} /></label>
        <label className="text-xs">Versão cadastrada<select aria-label="Versão do robô no simulador" className={input} name="robotVersionId" defaultValue={settings.robotVersionId}><option value="">Configuração personalizada</option>{settings.robotVersionId && !robotVersions.some((item) => item.id === settings.robotVersionId) && <option value={settings.robotVersionId}>Versão anterior</option>}{robotVersions.map((item) => <option key={item.id} value={item.id}>{item.version || item.name || 'Versão'}{item.version && item.name ? ` · ${item.name}` : ''}</option>)}</select></label>
        <label className="text-xs">Comprimento do corpo (cm)<input className={input} name="robotLength" type="number" min="5" max="50" step="0.1" required defaultValue={settings.robotLength} /></label>
        <label className="text-xs">Largura do corpo (cm)<input className={input} name="robotWidth" type="number" min="5" max="50" step="0.1" required defaultValue={settings.robotWidth} /></label>
      </fieldset>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={disabled} checked={gripper} onChange={(event) => setGripper(event.target.checked)} />Incluir garra na simulação</label>
      {gripper && <fieldset disabled={disabled} className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs">Garra cadastrada<select aria-label="Garra do simulador" className={input} name="gripperId" defaultValue={settings.gripperId}><option value="">Garra personalizada</option>{settings.gripperId && !attachments.some((item) => item.id === settings.gripperId) && <option value={settings.gripperId}>Garra anterior</option>}{attachments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-xs">Nome da garra<input className={input} name="gripperName" maxLength={100} defaultValue={settings.gripperName} placeholder="Ex.: garra de coleta" /></label>
        {[['gripperLength', 'Comprimento da garra (cm)', 0.1, 80, 12], ['gripperWidth', 'Largura da garra (cm)', 0.1, 80, 10], ['gripperX', 'Centro da garra: frente/trás (cm)', -100, 100, settings.robotLength / 2 + 6], ['gripperY', 'Centro da garra: esquerda/direita (cm)', -100, 100, 0]].map(([name, label, min, max, fallback]) => <label key={name} className="text-xs">{label}<input className={input} name={name} type="number" required min={min} max={max} step="0.1" defaultValue={settings.gripperLength ? settings[name] : fallback} /></label>)}
      </fieldset>}
      <p className="text-xs leading-relaxed text-slate-400">A posição da garra é relativa ao centro do robô: positivo para frente e para a esquerda. As medidas precisam incluir a área ocupada pelo mecanismo. A configuração fica salva em cada saída.</p>
      <button disabled={disabled} className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-100 disabled:opacity-40">Aplicar robô e garra</button>
    </form>
  </details>;
}
