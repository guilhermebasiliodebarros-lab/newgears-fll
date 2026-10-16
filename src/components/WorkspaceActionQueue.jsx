import { ArrowRight, CheckCircle2, ListChecks } from 'lucide-react';

export default function WorkspaceActionQueue({ items = [] }) {
  const activeItems = items.filter((item) => Number(item.count) > 0);

  return (
    <section className="newgears-major-panel rounded-[26px] border border-white/10 bg-[linear-gradient(145deg,rgba(16,21,37,0.96),rgba(9,13,25,0.96))] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${activeItems.length ? 'border-amber-300/20 bg-amber-300/10 text-amber-200' : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200'}`}>
            {activeItems.length ? <ListChecks size={18} /> : <CheckCircle2 size={18} />}
          </span>
          <div>
            <h3 className="text-base font-black text-white">Pendências do time</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              {activeItems.length ? `${activeItems.length} área(s) precisam de atenção` : 'Tudo em dia por aqui'}
            </p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${activeItems.length ? 'border-amber-300/20 bg-amber-300/10 text-amber-100' : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'}`}>
          {activeItems.reduce((total, item) => total + Number(item.count || 0), 0)} itens
        </span>
      </div>

      {activeItems.length ? (
        <div className="mt-4 grid gap-2 lg:grid-cols-2">
          {activeItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="group flex min-w-0 items-center gap-3 rounded-[18px] border border-white/8 bg-white/[0.035] p-3 text-left transition hover:border-white/15 hover:bg-white/[0.07]"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${item.tone || 'border-blue-300/20 bg-blue-300/10 text-blue-100'}`}>
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="truncate">{item.title}</span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] text-slate-200">{item.count}</span>
                </span>
                <span className="mt-1 block truncate text-xs text-slate-400">{item.detail}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-black uppercase tracking-wide text-slate-300 transition group-hover:text-white">
                Abrir <ArrowRight size={13} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-[18px] border border-emerald-300/10 bg-emerald-300/[0.04] px-4 py-3 text-sm text-emerald-100/80">
          Nenhuma tarefa urgente, avaliação pendente ou cadastro incompleto foi encontrado.
        </p>
      )}
    </section>
  );
}
