import { BookOpen, Calendar, CheckCircle, Clock, Plus, Search, Trash2, UserCircle, Users } from 'lucide-react';

export default function LogbookView({
  currentWeekData,
  isAdmin,
  adminLogbookStudentQuery,
  setAdminLogbookStudentQuery,
  adminLogbookSearchQuery,
  setAdminLogbookSearchQuery,
  adminLogbookWeekFilter,
  setAdminLogbookWeekFilter,
  adminLogbookStudentId,
  setAdminLogbookStudentId,
  studentLogbookSearchQuery,
  setStudentLogbookSearchQuery,
  studentLogbookWeekFilter,
  setStudentLogbookWeekFilter,
  studentLogbookDraft,
  setStudentLogbookDraft,
  logbookEntries,
  students,
  groupLogbookEntriesByWeek,
  getLogbookEntryDate,
  getLogbookEntryTags,
  getLogbookEntryWordCount,
  getLogbookStudentId,
  getLogbookEntryPreview,
  sortLogbookEntries,
  buildLogbookWeekOptions,
  handleDeleteLogbookEntry,
  handleLogbookSubmit
}) {
      const currentWeekValue = String(currentWeekData?.id || 'current');
      const prompts = ['Hoje eu testei...', 'O principal aprendizado foi...', 'O que deu errado foi...', 'Na proxima semana quero melhorar...'];
      const formatDiaryDate = (entry, includeTime = false) => getLogbookEntryDate(entry).toLocaleDateString(
          'pt-BR',
          includeTime ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'long', year: 'numeric' }
      );
      const renderTags = (tags) => tags.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => <span key={tag} className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-100">{tag}</span>)}
          </div>
      ) : null;
      const renderEntries = (entries, emptyTitle, emptyDetail, options = {}) => {
          const groups = groupLogbookEntriesByWeek(entries);
          if (!groups.length) {
              return (
                  <div className="rounded-[30px] border border-dashed border-white/10 bg-[#151520] p-10 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/10 bg-white/5"><BookOpen size={28} className="text-yellow-300" /></div>
                      <h3 className="mt-5 text-2xl font-black text-white">{emptyTitle}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-400">{emptyDetail}</p>
                  </div>
              );
          }

          return (
              <div className="space-y-8">
                  {groups.map((group) => (
                      <section key={group.key} className="space-y-4">
                          <div className="flex items-end justify-between gap-4">
                              <div>
                                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Bloco semanal</p>
                                  <h3 className="mt-2 text-xl font-black text-white">{group.weekName}</h3>
                              </div>
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">{group.entries.length} registro(s)</span>
                          </div>
                          <div className="grid gap-4 xl:grid-cols-2">
                              {group.entries.map((entry) => {
                                  const tags = getLogbookEntryTags(entry);
                                  const wordCount = getLogbookEntryWordCount(entry);
                                  const readMinutes = Math.max(1, Math.ceil(wordCount / 120));
                                  const timeLabel = formatDiaryDate(entry, true).split(',').slice(-1)[0]?.trim() || 'Horario';
                                  return (
                                      <article key={entry.id} className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#151520] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_26%)]"></div>
                                          <div className="relative z-10">
                                              <div className="flex items-start justify-between gap-4">
                                                  <div className="min-w-0">
                                                      <div className="flex flex-wrap items-center gap-2">
                                                          <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-100">{entry.weekName || `Semana ${entry.weekId || 'Geral'}`}</span>
                                                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">{wordCount} palavras</span>
                                                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{readMinutes} min leitura</span>
                                                      </div>
                                                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                                          {options.showStudentName && <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-200"><UserCircle size={12} /> {entry.studentName}</span>}
                                                          <span className="inline-flex items-center gap-2"><Calendar size={12} className="text-yellow-400" /> {formatDiaryDate(entry)}</span>
                                                          <span className="inline-flex items-center gap-2"><Clock size={12} className="text-cyan-400" /> {timeLabel}</span>
                                                      </div>
                                                  </div>
                                                  <button onClick={() => handleDeleteLogbookEntry(entry)} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-gray-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300" title="Excluir Registro"><Trash2 size={15} /></button>
                                              </div>
                                              <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{entry.text}</p>
                                              {renderTags(tags)}
                                          </div>
                                      </article>
                                  );
                              })}
                          </div>
                      </section>
                  ))}
              </div>
          );
      };

      if (isAdmin) {
          const normalizedStudentQuery = adminLogbookStudentQuery.trim().toLowerCase();
          const normalizedEntryQuery = adminLogbookSearchQuery.trim().toLowerCase();
          const teamEntries = sortLogbookEntries(logbookEntries);
          const selectedStudent = students.find((student) => student.id === adminLogbookStudentId) || null;
          const selectedEntries = adminLogbookStudentId ? teamEntries.filter((entry) => getLogbookStudentId(entry) === adminLogbookStudentId) : [];
          const filteredEntries = selectedEntries.filter((entry) => (!normalizedEntryQuery || [entry.text, entry.weekName, ...getLogbookEntryTags(entry)].filter(Boolean).join(' ').toLowerCase().includes(normalizedEntryQuery)) && (adminLogbookWeekFilter === 'all' || String(entry.weekId ?? 'general') === adminLogbookWeekFilter));
          const studentCards = students.map((student) => {
              const entries = teamEntries.filter((entry) => getLogbookStudentId(entry) === student.id);
              return { ...student, totalEntries: entries.length, currentWeekEntries: currentWeekData ? entries.filter((entry) => String(entry.weekId) === currentWeekValue).length : 0, lastEntry: entries[0] || null };
          }).filter((student) => !normalizedStudentQuery || [student.name, student.role].filter(Boolean).join(' ').toLowerCase().includes(normalizedStudentQuery)).sort((left, right) => right.totalEntries - left.totalEntries || (left.name || '').localeCompare(right.name || '', 'pt-BR'));
          const avgWords = selectedEntries.length ? Math.round(selectedEntries.reduce((total, entry) => total + getLogbookEntryWordCount(entry), 0) / selectedEntries.length) : 0;
          const activeWriterCount = new Set(teamEntries.map((entry) => getLogbookStudentId(entry)).filter(Boolean)).size;
          const hasAdminFilters = Boolean(normalizedEntryQuery) || adminLogbookWeekFilter !== 'all';

          return (
              <div className="animate-in fade-in duration-500 space-y-6 max-w-7xl mx-auto">
                  <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#2c180f] via-[#151520] to-[#0f1726] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                      <div className="grid gap-4 lg:grid-cols-4">
                          <div className="lg:col-span-2">
                              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-200">Radar do diario</p>
                              <h3 className="mt-3 text-3xl font-black text-white">Leitura rapida da memoria da equipe.</h3>
                              <p className="mt-3 text-sm leading-relaxed text-gray-300">Veja quem esta registrando com frequencia e mergulhe no historico de cada aluno com busca e filtro por semana.</p>
                          </div>
                          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Registros totais</p><p className="mt-4 text-3xl font-black text-white">{teamEntries.length}</p><p className="mt-2 text-xs text-gray-400">memoria consolidada</p></div>
                          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Alunos ativos</p><p className="mt-4 text-3xl font-black text-white">{activeWriterCount}</p><p className="mt-2 text-xs text-gray-400">{selectedEntries.length} no diario atual</p></div>
                      </div>
                  </section>
                  <div className="grid gap-6 lg:grid-cols-4">
                      <aside className="lg:col-span-1 rounded-[30px] border border-white/10 bg-[#151520] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
                          <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><h3 className="text-base font-bold text-white">Diarios da equipe</h3><p className="mt-1 text-xs text-gray-400">Escolha um aluno para abrir o historico.</p></div><Users size={16} className="text-gray-300" /></div>
                          <div className="relative mt-4"><Search size={16} className="absolute left-4 top-3.5 text-gray-500" /><input type="text" value={adminLogbookStudentQuery} onChange={(e) => setAdminLogbookStudentQuery(e.target.value)} placeholder="Buscar aluno..." className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 pl-11 text-sm text-white outline-none focus:border-yellow-500" /></div>
                          <div className="mt-4 max-h-[700px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                              {studentCards.length === 0 && <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5 text-sm text-gray-400">Nenhum aluno encontrado para esse filtro.</div>}
                              {studentCards.map((student) => <button key={student.id} onClick={() => setAdminLogbookStudentId(student.id)} className={`w-full rounded-[24px] border p-4 text-left transition-all ${adminLogbookStudentId === student.id ? 'border-yellow-500/30 bg-yellow-500/10 shadow-[0_14px_36px_rgba(234,179,8,0.12)]' : 'border-white/5 bg-black/30 hover:border-white/15 hover:bg-white/5'}`}><div className="flex items-start gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${student.avatarType === 'mech2' ? 'border-fuchsia-500/50 bg-fuchsia-500/10' : 'border-orange-500/40 bg-orange-500/10'}`}>{student.avatarImage ? <img src={student.avatarImage} alt="Avatar" className="h-9 w-9 rounded-xl object-cover" /> : <UserCircle size={24} className="text-gray-400" />}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate font-bold text-white">{student.name}</p><span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">{student.totalEntries}</span></div><p className="mt-2 text-[11px] leading-relaxed text-gray-400">{student.currentWeekEntries > 0 ? `${student.currentWeekEntries} registro(s) nesta semana` : 'Sem registro nesta semana'}</p><p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-gray-500">{student.lastEntry ? `Ultimo em ${formatDiaryDate(student.lastEntry)}` : 'Ainda sem historico'}</p></div></div></button>)}
                          </div>
                      </aside>
                      <div className="lg:col-span-3 space-y-6">
                          {selectedStudent ? (
                              <>
                                  <section className="rounded-[30px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                          <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-200">Painel individual</p><h3 className="mt-3 text-3xl font-black text-white">{selectedStudent.name}</h3><p className="mt-3 text-sm leading-relaxed text-gray-300">{selectedEntries[0] ? getLogbookEntryPreview(selectedEntries[0], 180) : 'Ainda nao ha registros salvos para este aluno.'}</p></div>
                                          <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Registros</p><p className="mt-3 text-3xl font-black text-white">{selectedEntries.length}</p></div><div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Semana atual</p><p className="mt-3 text-3xl font-black text-white">{currentWeekData ? selectedEntries.filter((entry) => String(entry.weekId) === currentWeekValue).length : 0}</p></div><div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Media</p><p className="mt-3 text-3xl font-black text-white">{avgWords}</p></div></div>
                                      </div>
                                  </section>
                                  <section className="rounded-[30px] border border-white/10 bg-[#151520] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
                                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Filtros do diario</p><h3 className="mt-2 text-xl font-black text-white">Encontre registros por texto ou semana</h3></div>{hasAdminFilters && <button type="button" onClick={() => { setAdminLogbookSearchQuery(''); setAdminLogbookWeekFilter('all'); }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition-all hover:border-white/20 hover:bg-white/10">Limpar filtros</button>}</div>
                                      <div className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_0.9fr]"><div className="relative"><Search size={18} className="absolute left-4 top-3.5 text-gray-500" /><input type="text" placeholder={`Buscar em ${selectedStudent.name}...`} value={adminLogbookSearchQuery} onChange={(e) => setAdminLogbookSearchQuery(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 pl-12 text-white outline-none focus:border-yellow-500" /></div><select value={adminLogbookWeekFilter} onChange={(e) => setAdminLogbookWeekFilter(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500">{buildLogbookWeekOptions(selectedEntries).map((option) => <option key={option.value} value={option.value} className="bg-[#0f0f17]">{option.label}</option>)}</select></div>
                                  </section>
                                  {renderEntries(filteredEntries, 'Nenhum registro encontrado', hasAdminFilters ? 'Esse aluno nao possui entradas com os filtros atuais.' : 'Esse aluno ainda nao registrou aprendizados no diario.')}
                              </>
                          ) : (
                              <div className="flex min-h-[420px] items-center justify-center rounded-[30px] border-2 border-dashed border-white/10 bg-[#151520] p-8 text-center"><div><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-white/5"><BookOpen size={30} className="text-yellow-300" /></div><h3 className="mt-5 text-2xl font-black text-white">Escolha um diario para analisar</h3><p className="mt-3 text-sm leading-relaxed text-gray-400">Selecione um aluno no painel lateral para abrir o historico e localizar registros especificos.</p></div></div>
                          )}
                      </div>
                  </div>
              </div>
          );
      }

      const normalizedStudentQuery = studentLogbookSearchQuery.trim().toLowerCase();
      const studentEntries = sortLogbookEntries(logbookEntries);
      const filteredEntries = studentEntries.filter((entry) => (!normalizedStudentQuery || [entry.text, entry.weekName, ...getLogbookEntryTags(entry)].filter(Boolean).join(' ').toLowerCase().includes(normalizedStudentQuery)) && (studentLogbookWeekFilter === 'all' || String(entry.weekId ?? 'general') === studentLogbookWeekFilter));
      const draftWordCount = studentLogbookDraft.trim().split(/\s+/).filter(Boolean).length;
      const draftTags = Array.from(new Set((studentLogbookDraft.match(/#[^\s#]+/g) || []).map((tag) => tag.toLowerCase())));
      const latestEntry = studentEntries[0] || null;
      const entriesThisWeek = currentWeekData ? studentEntries.filter((entry) => String(entry.weekId) === currentWeekValue).length : 0;
      const weeksCovered = new Set(studentEntries.map((entry) => String(entry.weekId ?? 'general'))).size;
      const averageStudentWords = studentEntries.length ? Math.round(studentEntries.reduce((total, entry) => total + getLogbookEntryWordCount(entry), 0) / studentEntries.length) : 0;
      const hasStudentFilters = Boolean(normalizedStudentQuery) || studentLogbookWeekFilter !== 'all';

      return (
          <div className="animate-in fade-in duration-500 space-y-6 max-w-6xl mx-auto">
              <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#102036] via-[#151520] to-[#22140f] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                  <div className="grid gap-4 lg:grid-cols-4">
                      <div className="lg:col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">Diario de bordo</p>
                          <h3 className="mt-3 text-3xl font-black text-white">Transforme cada semana em memoria util.</h3>
                          <p className="mt-3 text-sm leading-relaxed text-gray-300">Seu diario agora salva rascunho, organiza por semana e deixa o historico muito mais facil de consultar.</p>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Registros</p><p className="mt-4 text-3xl font-black text-white">{studentEntries.length}</p><p className="mt-2 text-xs text-gray-400">historico pessoal</p></div>
                      <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Semana atual</p><p className="mt-4 text-3xl font-black text-white">{entriesThisWeek}</p><p className="mt-2 text-xs text-gray-400">{currentWeekData?.weekName || 'semana ativa'}</p></div>
                      <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Semanas cobertas</p><p className="mt-4 text-3xl font-black text-white">{weeksCovered}</p><p className="mt-2 text-xs text-gray-400">com registros salvos</p></div>
                      <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Media</p><p className="mt-4 text-3xl font-black text-white">{averageStudentWords}</p><p className="mt-2 text-xs text-gray-400">palavras por registro</p></div>
                  </div>
              </section>
              <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                  <section className="rounded-[30px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-200">Novo registro</p><h3 className="mt-2 text-2xl font-black text-white">Escreva o que vale lembrar</h3><p className="mt-3 text-sm leading-relaxed text-gray-400">Registre testes, falhas, aprendizados e proximos passos para a equipe retomar rapido depois.</p></div><div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200"><CheckCircle size={14} /> Rascunho salvo automaticamente</div></div>
                      <form onSubmit={handleLogbookSubmit} className="mt-6 space-y-5">
                          <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
                              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-100">{currentWeekData?.weekName || 'Semana atual'}</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">{draftWordCount} palavras</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">{draftTags.length} hashtag(s)</span></div>
                              <textarea name="entry" value={studentLogbookDraft} onChange={(e) => setStudentLogbookDraft(e.target.value)} className="mt-4 h-40 w-full resize-none rounded-[24px] border border-white/10 bg-[#0d0d14] p-4 text-white outline-none transition-all placeholder:text-gray-500 focus:border-yellow-500" placeholder="O que aprendemos nesta semana? O que deu errado, como resolvemos e o que precisa acontecer depois?" />
                              {renderTags(draftTags)}
                          </div>
                          <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Atalhos para destravar a escrita</p><div className="mt-3 flex flex-wrap gap-2">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setStudentLogbookDraft((current) => current.trim() ? `${current}\n${prompt}` : prompt)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-200 transition-all hover:border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-100">{prompt}</button>)}</div></div>
                          <div className="flex flex-col gap-4 rounded-[26px] border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="text-sm text-gray-400">Dica: use hashtags como <span className="font-semibold text-yellow-200">#teste</span>, <span className="font-semibold text-yellow-200">#erro</span> e <span className="font-semibold text-yellow-200">#ideia</span> para achar temas depois.</div><button type="submit" disabled={!studentLogbookDraft.trim()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-black text-black transition-all hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-yellow-500/40 disabled:text-black/60"><Plus size={18} /> Salvar registro</button></div>
                      </form>
                  </section>
                  <aside className="space-y-6"><section className="rounded-[30px] border border-white/10 bg-[#151520] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">Painel rapido</p><h3 className="mt-2 text-xl font-black text-white">Seu ultimo destaque</h3><p className="mt-3 text-sm leading-relaxed text-gray-400">{latestEntry ? getLogbookEntryPreview(latestEntry, 180) : 'Ainda nao existe nenhum registro salvo. O primeiro texto que voce gravar aparece aqui como destaque.'}</p><div className="mt-5 space-y-3"><div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Ultima atualizacao</p><p className="mt-3 text-lg font-black text-white">{latestEntry ? formatDiaryDate(latestEntry) : 'Sem registros'}</p><p className="mt-2 text-xs text-gray-400">{latestEntry?.weekName || 'Esperando primeiro diario'}</p></div><div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Escreva melhor</p><p className="mt-3 text-sm leading-relaxed text-gray-400">Contexto, decisao e proximo passo costumam gerar registros mais fortes e uteis para revisao.</p></div></div></section></aside>
              </div>
              <section className="rounded-[30px] border border-white/10 bg-[#151520] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Historico filtrado</p><h3 className="mt-2 text-xl font-black text-white">Busque e releia seus registros</h3></div>{hasStudentFilters && <button type="button" onClick={() => { setStudentLogbookSearchQuery(''); setStudentLogbookWeekFilter('all'); }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition-all hover:border-white/20 hover:bg-white/10">Limpar filtros</button>}</div>
                  <div className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_0.9fr]"><div className="relative"><Search size={18} className="absolute left-4 top-3.5 text-gray-500" /><input type="text" placeholder="Buscar por texto, semana ou hashtag..." value={studentLogbookSearchQuery} onChange={(e) => setStudentLogbookSearchQuery(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 pl-12 text-white outline-none focus:border-yellow-500" /></div><select value={studentLogbookWeekFilter} onChange={(e) => setStudentLogbookWeekFilter(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500">{buildLogbookWeekOptions(studentEntries).map((option) => <option key={option.value} value={option.value} className="bg-[#0f0f17]">{option.label}</option>)}</select></div>
              </section>
              {renderEntries(filteredEntries, 'Nenhum registro encontrado', hasStudentFilters ? 'Nenhum item combinou com os filtros atuais. Ajuste a busca ou volte para todas as semanas.' : 'Nenhum registro ainda. Comece escrevendo o que aconteceu nesta semana.')}
          </div>
      );
}
