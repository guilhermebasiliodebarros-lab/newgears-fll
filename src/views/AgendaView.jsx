import { AlertTriangle, CalendarDays, CheckCircle, Clock, Flag, MapPin, Pencil, Plus, Search, Trash2, UserCircle, XCircle } from 'lucide-react';

export default function AgendaView({
  events,
  agendaSearchQuery,
  setAgendaSearchQuery,
  agendaTypeFilter,
  setAgendaTypeFilter,
  agendaScopeFilter,
  setAgendaScopeFilter,
  compareEventsByDate,
  matchesAgendaScope,
  getAgendaDayOffset,
  getEventPriorityValue,
  getEventPriorityMeta,
  getEventStatusValue,
  getEventStatusMeta,
  getEventTypeMeta,
  getAgendaRelativeLabel,
  formatAgendaDate,
  isAdmin,
  viewAsStudent,
  setModal,
  handleDeleteEvent,
  handleCycleEventStatus,
  EVENT_TYPE_OPTIONS
}) {
      const normalizedQuery = agendaSearchQuery.trim().toLowerCase();
      const matchesTextAndType = (event) => {
          const matchesType = agendaTypeFilter === 'all' || (event.type || 'Outro') === agendaTypeFilter;
          const haystack = [event.title, event.description, event.location, event.author]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();

          return matchesType && (!normalizedQuery || haystack.includes(normalizedQuery));
      };

      const baseAgendaEvents = [...events]
          .filter(matchesTextAndType)
          .sort(compareEventsByDate);

      const filteredAgendaEvents = baseAgendaEvents.filter((event) => matchesAgendaScope(event, agendaScopeFilter));
      const filteredUpcomingEvents = filteredAgendaEvents.filter((event) => getAgendaDayOffset(event.date) >= 0);
      const filteredPastEvents = filteredAgendaEvents
          .filter((event) => getAgendaDayOffset(event.date) < 0)
          .sort((left, right) => compareEventsByDate(right, left));

      const immediateEvents = filteredUpcomingEvents.filter((event) => getAgendaDayOffset(event.date) <= 1);
      const weekEvents = filteredUpcomingEvents.filter((event) => {
          const dayOffset = getAgendaDayOffset(event.date);
          return dayOffset >= 2 && dayOffset <= 7;
      });
      const laterEvents = filteredUpcomingEvents.filter((event) => getAgendaDayOffset(event.date) > 7);

      const upcomingMatches = baseAgendaEvents.filter((event) => getAgendaDayOffset(event.date) >= 0);
      const pastMatches = baseAgendaEvents
          .filter((event) => getAgendaDayOffset(event.date) < 0)
          .sort((left, right) => compareEventsByDate(right, left));

      const agendaScopeOptions = [
          { id: 'all', label: 'Visao completa', count: baseAgendaEvents.length },
          { id: 'urgent', label: 'Hoje e amanha', count: upcomingMatches.filter((event) => getAgendaDayOffset(event.date) <= 1).length },
          { id: 'week', label: '7 dias', count: upcomingMatches.filter((event) => getAgendaDayOffset(event.date) <= 7).length },
          { id: 'upcoming', label: 'Proximos marcos', count: upcomingMatches.length },
          { id: 'past', label: 'Historico', count: pastMatches.length }
      ];

      const nextAgendaEvent = filteredUpcomingEvents[0] || upcomingMatches[0] || null;
      const spotlightHistoryEvent = filteredPastEvents[0] || pastMatches[0] || null;
      const spotlightEvent = nextAgendaEvent || spotlightHistoryEvent;
      const spotlightLabel = nextAgendaEvent ? 'Proximo compromisso' : spotlightHistoryEvent ? 'Ultimo registro' : 'Sem compromissos ativos';
      const highlightedPriorityCount = upcomingMatches.filter((event) => ['alta', 'critica'].includes(getEventPriorityValue(event))).length;
      const confirmedCount = upcomingMatches.filter((event) => getEventStatusValue(event) === 'confirmado').length;
      const hasActiveFilters = Boolean(normalizedQuery) || agendaTypeFilter !== 'all' || agendaScopeFilter !== 'all';

      const clearAgendaFilters = () => {
          setAgendaSearchQuery('');
          setAgendaTypeFilter('all');
          setAgendaScopeFilter('all');
      };

      const renderAgendaCard = (event, { spotlight = false, muted = false } = {}) => {
          const typeMeta = getEventTypeMeta(event.type);
          const priorityMeta = getEventPriorityMeta(getEventPriorityValue(event));
          const statusValue = getEventStatusValue(event);
          const statusMeta = getEventStatusMeta(statusValue);
          const canManageEvent = isAdmin || event.author === viewAsStudent?.name;
          const nextStatusLabel = statusValue === 'planejado'
              ? 'Confirmar'
              : statusValue === 'confirmado'
                  ? 'Concluir'
                  : 'Reabrir';

          return (
              <article
                  key={event.id}
                  className={`group relative overflow-hidden rounded-[30px] border bg-[#13131d] p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] transition-all ${spotlight ? 'border-indigo-400/35 shadow-[0_25px_70px_rgba(79,70,229,0.18)]' : 'border-white/10 hover:border-white/20'} ${muted ? 'opacity-80' : ''}`}
              >
                  <div className={`absolute inset-0 bg-gradient-to-br ${typeMeta.accent} pointer-events-none opacity-80`}></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%)] pointer-events-none"></div>

                  {spotlight && (
                      <div className="absolute -top-3 left-5 rounded-full border border-yellow-400/30 bg-yellow-400 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-black shadow-lg">
                          Radar imediato
                      </div>
                  )}

                  <div className="relative z-10 flex h-full flex-col gap-5">
                      <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${typeMeta.tone}`}>
                                  {typeMeta.label}
                              </span>
                              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${priorityMeta.tone}`}>
                                  {priorityMeta.label}
                              </span>
                              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusMeta.tone}`}>
                                  {statusMeta.label}
                              </span>
                          </div>

                          {canManageEvent && (
                              <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                  <button type="button" onClick={() => setModal({type: 'eventForm', data: event})} className="rounded-xl border border-white/10 bg-black/35 p-2 text-gray-300 hover:bg-white/10 hover:text-white">
                                      <Pencil size={14}/>
                                  </button>
                                  <button type="button" onClick={() => handleDeleteEvent(event.id)} className="rounded-xl border border-white/10 bg-black/35 p-2 text-gray-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300">
                                      <Trash2 size={14}/>
                                  </button>
                              </div>
                          )}
                      </div>

                      <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{getAgendaRelativeLabel(event.date)}</p>
                          <h3 className="mt-3 text-xl font-black leading-tight text-white">{event.title}</h3>
                          {event.description && (
                              <p className="mt-3 text-sm leading-relaxed text-gray-300">{event.description}</p>
                          )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Data</p>
                              <div className="mt-2 flex items-center gap-2 text-sm text-white">
                                  <CalendarDays size={14} className="text-blue-400" />
                                  {formatAgendaDate(event.date, { weekday: 'short', day: '2-digit', month: 'long' })}
                              </div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Horario</p>
                              <div className="mt-2 flex items-center gap-2 text-sm text-white">
                                  <Clock size={14} className="text-yellow-400" />
                                  {event.time || 'A definir'}
                              </div>
                          </div>
                          {event.location && (
                              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                                  <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Local / Link</p>
                                  <div className="mt-2 flex items-center gap-2 text-sm text-white">
                                      <MapPin size={14} className="text-emerald-400" />
                                      {event.location}
                                  </div>
                              </div>
                          )}
                          {event.author && (
                              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                                  <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Responsavel pelo registro</p>
                                  <div className="mt-2 flex items-center gap-2 text-sm text-white">
                                      <UserCircle size={14} className="text-gray-400" />
                                      {event.author}
                                  </div>
                              </div>
                          )}
                      </div>

                      {canManageEvent && (
                          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                              <button
                                  type="button"
                                  onClick={() => handleCycleEventStatus(event)}
                                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs font-bold text-cyan-100 transition-all hover:bg-cyan-500 hover:text-white"
                              >
                                  <CheckCircle size={14} />
                                  {nextStatusLabel}
                              </button>
                          </div>
                      )}
                  </div>
              </article>
          );
      };

      const renderAgendaSection = (title, helper, items, options = {}) => {
          if (items.length === 0) return null;

          return (
              <section className="space-y-4">
                  <div className="flex items-end justify-between gap-4">
                      <div>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">{title}</p>
                          <h3 className="mt-2 text-xl font-black text-white">{helper}</h3>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">
                          {items.length} evento(s)
                      </span>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                      {items.map((event, index) => renderAgendaCard(event, { spotlight: options.highlightFirst && index === 0, muted: options.muted }))}
                  </div>
              </section>
          );
      };

      return (
          <div className="animate-in fade-in duration-500 space-y-8">
              <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#161b33] via-[#151520] to-[#101018] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.20),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_28%)] pointer-events-none"></div>
                  <div className="relative z-10 grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
                      <div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-200">
                              <CalendarDays size={12} /> Radar da equipe
                          </span>
                          <h2 className="mt-4 text-3xl font-black leading-tight text-white">Agenda da equipe em modo radar: o que vem agora, o que merece preparo e o que ja virou historia.</h2>
                          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300">
                              Use esta visao para bater o olho e entender o que pede acao rapida, o que ja esta perto e o que pode ser organizado com mais calma pela equipe.
                          </p>

                          <div className="mt-6 flex flex-wrap gap-3">
                              <button onClick={() => setModal({type: 'eventForm'})} className="inline-flex items-center gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-xs font-bold text-indigo-100 transition-all hover:bg-indigo-500 hover:text-white">
                                  <Plus size={16}/> Novo evento
                              </button>
                              <button onClick={() => setAgendaScopeFilter('urgent')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-gray-200 transition-all hover:bg-white/10 hover:text-white">
                                  <AlertTriangle size={16}/> So urgentes
                              </button>
                          </div>

                          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
                              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">{spotlightLabel}</p>
                              {spotlightEvent ? (
                                  <div className="mt-3">
                                      <p className="text-lg font-black text-white">{spotlightEvent.title}</p>
                                      <p className="mt-2 text-sm text-gray-300">
                                          {getAgendaRelativeLabel(spotlightEvent.date)} | {formatAgendaDate(spotlightEvent.date, { day: '2-digit', month: 'long' })} | {spotlightEvent.time || 'Horario a definir'}
                                      </p>
                                  </div>
                              ) : (
                                  <p className="mt-3 text-sm text-gray-400">Cadastre o proximo evento para transformar a agenda num radar real da equipe.</p>
                              )}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          {[
                              { label: 'Missao relampago', value: immediateEvents.length, helper: 'hoje e amanha', tone: 'border-red-500/20 bg-red-500/10 text-red-100', icon: <AlertTriangle size={14} /> },
                              { label: 'Semana em foco', value: upcomingMatches.filter((event) => getAgendaDayOffset(event.date) <= 7).length, helper: 'janela curta', tone: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-100', icon: <CalendarDays size={14} /> },
                              { label: 'Alertas quentes', value: highlightedPriorityCount, helper: 'pedem preparo', tone: 'border-orange-500/20 bg-orange-500/10 text-orange-100', icon: <Flag size={14} /> },
                              { label: 'Ja confirmados', value: confirmedCount, helper: 'prontos para acontecer', tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100', icon: <CheckCircle size={14} /> }
                          ].map((metric) => (
                              <div key={metric.label} className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                                  <div className="flex items-center justify-between gap-3">
                                      <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">{metric.label}</span>
                                      <span className={`rounded-xl border px-2 py-1 ${metric.tone}`}>{metric.icon}</span>
                                  </div>
                                  <p className="mt-4 text-3xl font-black text-white">{metric.value}</p>
                                  <p className="mt-2 text-xs text-gray-400">{metric.helper}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </section>

              <section className="rounded-[30px] border border-white/10 bg-[#151520] p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                  <div className="grid gap-4 xl:grid-cols-[1fr,260px]">
                      <div className="relative">
                          <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
                          <input
                              type="text"
                              value={agendaSearchQuery}
                              onChange={(e) => setAgendaSearchQuery(e.target.value)}
                              placeholder="Buscar por titulo, local, descricao ou autor..."
                              className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 pl-12 text-sm text-white outline-none transition-all focus:border-indigo-400"
                          />
                      </div>

                      <select
                          value={agendaTypeFilter}
                          onChange={(e) => setAgendaTypeFilter(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none transition-all focus:border-indigo-400"
                      >
                          <option value="all">Todos os tipos</option>
                          {EVENT_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                      {agendaScopeOptions.map((option) => (
                          <button
                              key={option.id}
                              type="button"
                              onClick={() => setAgendaScopeFilter(option.id)}
                              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold transition-all ${agendaScopeFilter === option.id ? 'border-indigo-500/30 bg-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'}`}
                          >
                              {option.label}
                              <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-black">
                                  {option.count}
                              </span>
                          </button>
                      ))}

                      {hasActiveFilters && (
                          <button
                              type="button"
                              onClick={clearAgendaFilters}
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs font-bold text-gray-300 transition-all hover:bg-white/10 hover:text-white"
                          >
                              <XCircle size={14} /> Limpar filtros
                          </button>
                      )}
                  </div>
              </section>

              {filteredUpcomingEvents.length === 0 && filteredPastEvents.length === 0 ? (
                  <div className="rounded-[30px] border border-dashed border-white/10 bg-[#151520] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/10 bg-white/5">
                          <CalendarDays size={26} className="text-indigo-300" />
                      </div>
                      <h3 className="mt-5 text-2xl font-black text-white">Nenhum compromisso encontrado.</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-400">
                          {hasActiveFilters ? 'Os filtros atuais nao encontraram eventos. Limpe a busca ou troque o recorte.' : 'Cadastre o primeiro evento para transformar a agenda num painel vivo da equipe.'}
                      </p>
                  </div>
              ) : (
                  <div className="space-y-8">
                      {renderAgendaSection('Agora ou proximo', 'Eventos que pedem reacao rapida', immediateEvents, { highlightFirst: true })}
                      {renderAgendaSection('Esta semana', 'Janela curta para preparar sem correria', weekEvents)}
                      {renderAgendaSection('Mais pra frente', 'Marcos que podem ser organizados com calma', laterEvents)}

                      {(agendaScopeFilter === 'all' || agendaScopeFilter === 'past') && filteredPastEvents.length > 0 && (
                          <section className="space-y-4 border-t border-white/10 pt-8">
                              <div className="flex items-end justify-between gap-4">
                                  <div>
                                      <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Memoria da equipe</p>
                                      <h3 className="mt-2 text-xl font-black text-white">Eventos que ja passaram e viraram historico</h3>
                                  </div>
                                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">
                                      {filteredPastEvents.length} registro(s)
                                  </span>
                              </div>

                              <div className="grid gap-4 xl:grid-cols-2">
                                  {filteredPastEvents.map((event) => renderAgendaCard(event, { muted: true }))}
                              </div>
                          </section>
                      )}
                  </div>
              )}
          </div>
      );
}
