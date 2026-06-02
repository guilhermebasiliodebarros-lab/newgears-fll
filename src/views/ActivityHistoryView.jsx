import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock,
  Code,
  FileText,
  History,
  Search,
  UserCircle,
  Users,
  Wrench,
} from 'lucide-react';

const CATEGORY_META = {
  agenda: { label: 'Agenda', icon: CalendarDays, tone: 'border-indigo-400/25 bg-indigo-400/10 text-indigo-100' },
  kanban: { label: 'Kanban', icon: FileText, tone: 'border-orange-400/25 bg-orange-400/10 text-orange-100' },
  programming: { label: 'Programacao', icon: Code, tone: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100' },
  robot: { label: 'Robo', icon: Wrench, tone: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100' },
  team: { label: 'Equipe', icon: Users, tone: 'border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-100' },
  default: { label: 'Sistema', icon: History, tone: 'border-white/15 bg-white/5 text-slate-100' },
};

const formatLogDate = (value) => {
  if (!value) return 'Agora';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate);
};

export default function ActivityHistoryView({ activityLogs }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const categories = useMemo(
    () => [...new Set(activityLogs.map((log) => log.category || 'default'))],
    [activityLogs],
  );
  const filteredLogs = activityLogs.filter((log) => {
    const matchesCategory = categoryFilter === 'all' || (log.category || 'default') === categoryFilter;
    const haystack = [log.actorName, log.action, log.title, log.detail].join(' ').toLowerCase();
    return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
  });

  return (
    <div className="space-y-5">
      <section className="newgears-major-panel border border-white/10 bg-[#121722] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/75">
              <History size={14} /> Registro coletivo
            </p>
            <h2 className="mt-3 text-3xl font-black text-white">Historico de alteracoes</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Veja quem registrou cada informacao compartilhada pela equipe e quando a alteracao aconteceu.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Registros carregados</p>
            <p className="mt-1 text-2xl font-black text-white">{activityLogs.length}</p>
          </div>
        </div>
      </section>

      <section className="border border-white/10 bg-[#101520] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 p-3 pl-10 text-sm text-white outline-none focus:border-cyan-300/50"
              placeholder="Buscar pessoa ou alteracao"
            />
          </label>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-lg border border-white/10 bg-[#111827] p-3 text-sm text-white outline-none focus:border-cyan-300/50"
          >
            <option value="all">Todas as areas</option>
            {categories.map((category) => (
              <option key={category} value={category}>{(CATEGORY_META[category] || CATEGORY_META.default).label}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-2">
        {filteredLogs.map((log) => {
          const meta = CATEGORY_META[log.category] || CATEGORY_META.default;
          const CategoryIcon = meta.icon;

          return (
            <article key={log.id} className="grid gap-3 rounded-lg border border-white/10 bg-[#111722] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.16)] md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${meta.tone}`}>
                <CategoryIcon size={18} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-black text-white">
                    <UserCircle size={15} className="text-cyan-200" />
                    {log.actorName || 'Equipe'}
                  </p>
                  <span className={`rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${meta.tone}`}>
                    {meta.label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  <span className="font-bold text-white">{log.action || 'atualizou uma informacao'}</span>
                  {log.title ? `: ${log.title}` : ''}
                </p>
                {log.detail && <p className="mt-1 text-xs leading-relaxed text-slate-400">{log.detail}</p>}
              </div>

              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-400 md:justify-end">
                <Clock size={13} />
                {formatLogDate(log.createdAt)}
              </p>
            </article>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-8 text-center">
            <History className="mx-auto text-slate-500" size={28} />
            <p className="mt-3 text-sm font-bold text-slate-300">Nenhuma alteracao encontrada.</p>
            <p className="mt-1 text-xs text-slate-500">Os novos registros compartilhados aparecerao aqui.</p>
          </div>
        )}
      </section>
    </div>
  );
}
