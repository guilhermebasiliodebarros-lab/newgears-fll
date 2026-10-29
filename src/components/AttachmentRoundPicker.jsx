import { useId } from 'react';
import { attachmentRoundIds } from '../utils/attachmentRounds';

export default function AttachmentRoundPicker({ rounds, attachment }) {
  const hint = useId();
  const selected = attachmentRoundIds(attachment);
  return <fieldset className="mb-4" aria-describedby={hint}><legend className="text-xs text-gray-400 uppercase font-bold mb-2">Saídas vinculadas</legend><p id={hint} className="text-xs text-gray-400 mb-3">Marque uma ou mais saídas em que esta garra será usada.</p><div className="grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto rounded-xl border border-white/10 p-3">{rounds.length ? rounds.map((round) => <label key={round.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3 text-sm text-white cursor-pointer"><input type="checkbox" name="roundIds" value={round.id} defaultChecked={selected.includes(round.id)} className="accent-cyan-400" />{round.name}</label>) : <p className="text-xs text-amber-200">Cadastre uma saída em Robô → Rounds antes de vincular a garra.</p>}</div></fieldset>;
}
