export default function SeasonTransitionChecklist({ students, tasks, events, lock, startDate }) {
  const selected = lock?.options.studentIds || students.filter((student) => student.status !== 'inactive').map((student) => student.id);
  return <div className="space-y-4 rounded-2xl border border-cyan-300/15 bg-black/15 p-4 text-sm text-slate-300">
    {lock && <p role="status" className="rounded-xl bg-amber-300/10 p-3 text-amber-100">Há um encerramento em andamento. Continuar retomará as escolhas já salvas, sem criar outra temporada.</p>}
    <p>{tasks.filter((task) => task.status !== 'done').length} tarefas abertas · {events.filter((event) => !['concluido', 'concluído', 'done', 'cancelado', 'complete'].includes(event.status)).length} compromissos a revisar</p>
    <label className="block">Início do próximo ciclo<input name="nextStartDate" type="date" required defaultValue={lock?.options.startDate || startDate} readOnly={Boolean(lock)} className="ml-3 rounded-xl border border-white/15 bg-[#111827] p-2 text-white" /></label>
    <label className="flex gap-2"><input name="carryTasks" type="checkbox" defaultChecked={lock?.options.carryTasks || false} disabled={Boolean(lock)} />Continuar tarefas abertas na próxima temporada</label>
    <label className="flex gap-2"><input name="carryEvents" type="checkbox" defaultChecked={lock?.options.carryEvents || false} disabled={Boolean(lock)} />Continuar compromissos pendentes na próxima temporada</label>
    <label className="flex gap-2"><input name="carryProject" type="checkbox" defaultChecked={lock?.options.carryProject !== false} disabled={Boolean(lock)} />Continuar o projeto de inovação na próxima temporada</label>
    <fieldset><legend className="mb-2 font-bold text-white">Integrantes da próxima equipe</legend><div className="grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2">{students.map((student) => <label key={student.id} className="flex gap-2 rounded-xl bg-white/5 p-2"><input name="nextStudentIds" value={student.id} type="checkbox" defaultChecked={selected.includes(student.id)} disabled={Boolean(lock)} />{student.name}{student.status === 'inactive' ? ' (arquivado)' : ''}</label>)}</div></fieldset>
    <p className="text-xs text-slate-400">Os não selecionados serão arquivados. XP, conquistas e frequência acumulada acompanham o aluno. As entregas atuais ficam no retrato da temporada encerrada; a próxima começa sem entregas pendentes.</p>
    <label className="flex gap-2 font-bold"><input type="checkbox" name="reviewedTransition" required />Conferi integrantes, pendências e data do novo ciclo.</label>
  </div>;
}
