import { useDeferredValue, useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { AlertTriangle, BarChart3, Calendar, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, Clock, ListTodo, Loader2, Pencil, Search, Tag, Target, Timer, Trash2, UserCheck, UserCircle, UserPlus, Users, UserX, X, Zap } from 'lucide-react';
import { STATION_KEYS } from '../constants/workspace';
import { buildInitialKanbanTaskDraft, resolveTaskTagFromStation } from '../utils/kanban';

export default function KanbanView({
  assignTaskToStudent,
  currentWeekData,
  db,
  handleAddTask,
  isAdmin,
  joinTask,
  leaveTask,
  localTodayObj,
  localTodayStart,
  localTodayStr,
  moveTask,
  removeTask,
  students,
  takeoverTask,
  tasks,
  viewAsStudent,
  parseLocalDateValue,
  getLocalYYYYMMDD
}) {
      const [searchTerm, setSearchTerm] = useState("");
      const deferredSearchTerm = useDeferredValue(searchTerm);
      const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase();
      const kanbanLayout = 'swimlanes';
      const activeTagFilter = 'all';
      const activeOwnerFilter = 'all';
      const focusFilter = 'all';
      const [showAllTodo, setShowAllTodo] = useState(false);
      const [showAllDoing, setShowAllDoing] = useState(false);
      const [showAllReview, setShowAllReview] = useState(false);
      const [showAllDone, setShowAllDone] = useState(false);
      const [editingTaskId, setEditingTaskId] = useState(null);
      const [editingTaskText, setEditingTaskText] = useState("");
      const [draggedOverCol, setDraggedOverCol] = useState(null);
      const [kanbanTaskDraft, setKanbanTaskDraft] = useState(() =>
          buildInitialKanbanTaskDraft(isAdmin ? null : viewAsStudent?.station, localTodayStr)
      );

      useEffect(() => {
          const nextTag = isAdmin ? 'geral' : resolveTaskTagFromStation(viewAsStudent?.station);

          setKanbanTaskDraft((prev) => {
              const nextDraft = {
                  ...prev,
                  dueDate: prev.dueDate || localTodayStr
              };

              if (!prev.text.trim()) {
                  nextDraft.tag = nextTag;
              }

              if (prev.tag === nextDraft.tag && prev.dueDate === nextDraft.dueDate) {
                  return prev;
              }

              return nextDraft;
          });
      }, [isAdmin, viewAsStudent?.station, localTodayStr]);

      const updateKanbanTaskDraft = (field, value) => {
          setKanbanTaskDraft((prev) => ({ ...prev, [field]: value }));
      };

      const stopKanbanInputKeyDown = (event) => {
          event.stopPropagation();
      };

      const handleAddTaskSubmit = async (event) => {
          event.preventDefault();

          const created = await handleAddTask(kanbanTaskDraft);
          if (!created) return;

          setKanbanTaskDraft(buildInitialKanbanTaskDraft(isAdmin ? null : viewAsStudent?.station, localTodayStr));
      };

      const handleSaveTaskEdit = async (taskId) => {
          if (!editingTaskText.trim()) return;
          try {
              await updateDoc(doc(db, "tasks", taskId), { text: editingTaskText });
              setEditingTaskId(null);
              setEditingTaskText("");
          } catch (error) {
              console.error("Erro ao editar tarefa:", error);
          }
      };
      
      const handleDragStart = (e, taskId) => {
          e.dataTransfer.setData("taskId", taskId);
          e.target.style.opacity = "0.5";
      };

      const handleDragEnd = (e) => {
          e.target.style.opacity = "1";
      };

      const handleDragOver = (e, colId) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setDraggedOverCol(colId);
      };

      const handleDragLeave = () => {
          setDraggedOverCol(null);
      };

      const handleDrop = async (e, targetStatus) => {
          e.preventDefault();
          setDraggedOverCol(null);
          const taskId = e.dataTransfer.getData("taskId");
          if (taskId) {
              await moveTask(taskId, targetStatus);
          }
      };

      const KANBAN_TAGS = [
          { id: 'engenharia', label: STATION_KEYS.ENGINEERING, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
          { id: 'inovacao', label: STATION_KEYS.INNOVATION, color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
          { id: 'gestao', label: STATION_KEYS.MANAGEMENT, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
          { id: 'geral', label: 'Geral', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
      ];

      const focusOptions = isAdmin
          ? [
              { id: 'all', label: 'Tudo', icon: <BarChart3 size={12} /> },
              { id: 'priority', label: 'Prioritarias', icon: <Zap size={12} /> },
              { id: 'overdue', label: 'Atrasadas', icon: <AlertTriangle size={12} /> },
              { id: 'unassigned', label: 'Sem dono', icon: <Users size={12} /> }
          ]
          : [
              { id: 'all', label: 'Tudo', icon: <BarChart3 size={12} /> },
              { id: 'mine', label: 'Minhas', icon: <Target size={12} /> },
              { id: 'priority', label: 'Prioritarias', icon: <Zap size={12} /> },
              { id: 'overdue', label: 'Atrasadas', icon: <AlertTriangle size={12} /> }
          ];

      const priorityRank = { urgente: 4, alta: 3, normal: 2, baixa: 1 };

      const getDeadlineStatus = (date) => {
          if (!date) return null;
          const due = parseLocalDateValue(date, true);
          if (!due) return null;
          const diffTime = due.getTime() - localTodayStart.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          const parts = date.split('-');
          const dateStr = parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;

          if (diffDays < 0) return { color: 'text-red-500', border: 'border-red-500', icon: <AlertTriangle size={12}/>, text: `Atrasado (${dateStr})`, isOverdue: true };
          if (diffDays <= 2) return { color: 'text-yellow-500', border: 'border-yellow-500', icon: <Timer size={12}/>, text: `Prazo Curto (${dateStr})` };
          return { color: 'text-gray-500', border: 'border-white/5', icon: <Calendar size={12}/>, text: dateStr };
      };
      // Logica de calculo de tempo
      const getTaskDuration = (createdAt, completedAt) => {
          if (!createdAt || !completedAt) return null;
          const start = new Date(createdAt);
          const end = new Date(completedAt);
          const diffMs = end.getTime() - start.getTime();
          if (diffMs < 0) return '0 min';
          
          const diffMins = Math.floor(diffMs / 60000);
          if (diffMins < 60) return `${diffMins} min`;
          
          const diffHours = Math.floor(diffMins / 60);
          if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m`;
          
          const diffDays = Math.floor(diffHours / 24);
          return `${diffDays}d ${diffHours % 24}h`;
      };

      const getTaskAgeLabel = (createdAt) => {
          if (!createdAt) return 'agora';

          const createdTime = new Date(createdAt).getTime();
          const diffMs = Date.now() - createdTime;
          const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

          if (diffMinutes < 60) return `${diffMinutes} min`;

          const diffHours = Math.floor(diffMinutes / 60);
          if (diffHours < 24) return `${diffHours}h`;

          const diffDays = Math.floor(diffHours / 24);
          return `${diffDays}d`;
      };

      const isTaskOverdue = (task) => task.status !== 'done' && task.dueDate && task.dueDate < localTodayStr;
      const isTaskPriority = (task) => task.status !== 'done' && ['urgente', 'alta'].includes(task.priority);

      const getStageProgress = (status) => {
          if (status === 'todo') return 22;
          if (status === 'doing') return 56;
          if (status === 'review') return 82;
          if (status === 'done') return 100;
          return 0;
      };

      const sortOpenTasks = (a, b) => {
          const overdueDiff = Number(isTaskOverdue(b)) - Number(isTaskOverdue(a));
          if (overdueDiff !== 0) return overdueDiff;

          const priorityDiff = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
          if (priorityDiff !== 0) return priorityDiff;

          const aDue = a.dueDate ? (parseLocalDateValue(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
          const bDue = b.dueDate ? (parseLocalDateValue(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
          if (aDue !== bDue) return aDue - bDue;

          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      };

      const ownerOptions = [
          { value: 'all', label: 'Todos os responsaveis' },
          { value: 'unassigned', label: 'Equipe (livre)' },
          { value: 'Tecnico', label: 'Tecnico' },
          ...[...students]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((student) => ({ value: student.name, label: student.name }))
      ].filter((option, index, arr) => arr.findIndex((item) => item.value === option.value) === index);

      const TaskCard = ({ t, showMoveRight, showMoveLeft, showDelete, cardIndex = 0, laneIndex = 0, columnIndex = 0 }) => {
          const status = getDeadlineStatus(t.dueDate);
          const tagObj = KANBAN_TAGS.find(tag => tag.id === (t.tag || 'geral')) || KANBAN_TAGS[3];
          // So pisca se estiver atrasado e ainda nao foi concluida
          const isPulsing = status?.isOverdue && t.status !== 'done';
          const duration = t.status === 'done' ? getTaskDuration(t.createdAt, t.completedAt) : null;
          const ageLabel = getTaskAgeLabel(t.createdAt);
          const stageProgress = getStageProgress(t.status);
          const cardEntranceClass = isPulsing ? '' : 'animate-in fade-in slide-in-from-bottom-2';
          // Logica de exibicao de autores
          const authors = t.author ? t.author.split(',').map(a => a.trim()) : [];
          const isMultiAuthor = authors.length > 1;
          let displayAuthor = t.author || "Equipe";
          if (isMultiAuthor) {
              displayAuthor = `${authors[0]}, ${authors[1]}...`;
          }

          // Busca os dados completos dos autores para poder exibir a foto
          const authorStudents = authors.map(authorName => students.find(s => s.name === authorName)).filter(Boolean);
          // Renderiza os avatares dos responsaveis
          const renderAvatars = () => {
              if (authorStudents.length === 0) return <UserCircle size={12} className={isAdmin ? "text-blue-400 shrink-0" : "text-gray-400 shrink-0"} />;
              
              return (
                  <div className="flex -space-x-1.5 shrink-0 mr-1">
                      {authorStudents.map((s, idx) => (
                          s.avatarImage ? (
                              <img key={idx} src={s.avatarImage} alt={s.name} className="w-4 h-4 rounded-full object-cover border border-[#151520] relative z-10 hover:z-20 hover:scale-125 transition-transform" title={s.name} />
                          ) : (
                              <div key={idx} className="w-4 h-4 rounded-full bg-gray-800 border border-[#151520] flex items-center justify-center relative z-10 hover:z-20" title={s.name}>
                                  <span className="text-[6px] font-bold text-gray-300">{s.name.charAt(0)}</span>
                              </div>
                          )
                      ))}
                  </div>
              );
          };

          const entranceDelay = Math.min((columnIndex * 110) + (laneIndex * 70) + (cardIndex * 45), 420);

          return (
              <div 
                  draggable
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-black/40 p-3 rounded-xl border flex flex-col gap-2 group cursor-grab active:cursor-grabbing ${cardEntranceClass} transition-[transform,box-shadow,border-color,background-color,opacity] duration-500 ease-out will-change-transform motion-reduce:animate-none motion-reduce:transition-none hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.28)] ${status && t.status !== 'done' ? status.border : 'border-white/5'} ${isPulsing ? 'animate-pulse hover:animate-none shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'hover:border-white/20'}`}
                  style={cardEntranceClass ? { animationDelay: `${entranceDelay}ms`, animationFillMode: 'both' } : undefined}
              >
                  <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-wrap gap-1.5">
                          {isAdmin ? (
                              <div className="relative flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 transition-colors px-2 py-0.5 rounded border border-blue-500/30 group focus-within:border-blue-500/50">
                                  {renderAvatars()}
                                  <select
                                      value={authors.length === 1 ? authors[0] : ''} // So pre-seleciona se for um unico autor
                                      onChange={(e) => assignTaskToStudent(t.id, e.target.value)}
                                      className="text-[10px] font-bold uppercase bg-transparent border-none text-blue-100 focus:ring-0 outline-none appearance-none cursor-pointer pr-3"
                                      title={t.author || "Atribuir tarefa"}
                                  >
                                      <option value="" className="bg-zinc-900 text-gray-400">Equipe (Livre)</option>
                                      {[...students].sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                                          <option key={s.id} value={s.name} className="bg-zinc-900 text-white">{s.name}</option>
                                      ))}
                                  </select>
                                  <ChevronDown size={10} className="text-blue-400 absolute right-1 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"/>
                                  {isMultiAuthor && <span className="text-[10px] text-blue-300 ml-1" title={t.author}>+{authors.length - 1}</span>}
                              </div>
                          ) : (
                              <span className="text-[10px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded text-gray-300 flex items-center gap-1" title={t.author || "Equipe"}>
                                  {renderAvatars()} {displayAuthor}
                              </span>
                          )}
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border flex items-center gap-1 ${tagObj.color}`}>
                              <Tag size={8}/> {tagObj.label}
                          </span>
                          {t.priority === 'urgente' && <span className="text-[9px] bg-red-500/20 text-red-500 border border-red-500/30 px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-1" title="Prioridade Urgente"><AlertTriangle size={8}/> Urgente</span>}
                          {t.priority === 'alta' && <span className="text-[9px] bg-orange-500/20 text-orange-500 border border-orange-500/30 px-1.5 py-0.5 rounded font-bold uppercase" title="Prioridade Alta">Alta</span>}
                          {t.priority === 'baixa' && <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold uppercase" title="Prioridade Baixa">Baixa</span>}
                      </div>
                      {status && t.status !== 'done' && <span className={`text-[10px] font-bold flex items-center gap-1 whitespace-nowrap mt-0.5 ${status.color}`}>{status.icon} {status.text}</span>}
                      {duration && <span className="text-[10px] font-bold text-green-500 flex items-center gap-1 mt-0.5 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20" title="Tempo total levado"><Clock size={10}/> {duration}</span>}
                  </div>
                  {editingTaskId === t.id ? (
                      <div className="flex flex-col gap-2 mt-1">
                          <textarea 
                              value={editingTaskText} 
                              onChange={(e) => setEditingTaskText(e.target.value)} 
                              className="w-full bg-black/60 border border-blue-500/50 rounded-lg p-2 text-xs text-white outline-none resize-none focus:border-blue-400" 
                              rows={3}
                              autoFocus 
                          />
                          <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingTaskId(null)} className="text-[10px] text-gray-400 hover:text-white px-2 py-1">Cancelar</button>
                              <button onClick={() => handleSaveTaskEdit(t.id)} className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded font-bold">Salvar</button>
                          </div>
                      </div>
                  ) : (
                      <>
                          <p className="text-sm text-gray-200 leading-relaxed">{t.text}</p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                  <Clock size={10}/> criada ha {ageLabel}
                              </span>
                              {!t.dueDate && t.status !== 'done' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                      <Calendar size={10}/> sem prazo
                                  </span>
                              )}
                              {authors.length > 1 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                      <Users size={10}/> {authors.length} pessoas
                                  </span>
                              )}
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                  className={`h-full rounded-full transition-all duration-500 ${t.status === 'done' ? 'bg-green-500' : t.status === 'review' ? 'bg-purple-500' : t.status === 'doing' ? 'bg-blue-500' : 'bg-gray-500'}`}
                                  style={{ width: `${stageProgress}%` }}
                              ></div>
                          </div>
                      </>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-between pt-2 border-t border-white/5 mt-1">
                      <div className="flex gap-1 flex-wrap">
                          {isAdmin && editingTaskId !== t.id && (
                              <button onClick={() => { setEditingTaskId(t.id); setEditingTaskText(t.text); }} className="text-blue-400 hover:bg-blue-500/20 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors" title="Editar Tarefa">
                                  <Pencil size={14}/> Editar
                              </button>
                          )}
                          {viewAsStudent && (!t.author || !t.author.includes(viewAsStudent.name)) && t.status !== 'done' && (
                              <>
                                  <button onClick={() => joinTask(t.id)} className="text-green-500 hover:bg-green-500/20 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors" title="Participar junto na tarefa">
                                      <UserPlus size={14}/> Participar
                                  </button>
                                  <button onClick={() => takeoverTask(t.id)} className="text-orange-500 hover:bg-orange-500/20 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors" title="Assumir sozinho (Substituir atuais)">
                                      <UserCheck size={14}/> Assumir
                                  </button>
                              </>
                          )}
                          {viewAsStudent && t.author && t.author.includes(viewAsStudent.name) && t.status !== 'done' && (
                              <button onClick={() => leaveTask(t.id)} className="text-red-500 hover:bg-red-500/20 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors" title="Sair desta tarefa">
                                  <UserX size={14}/> Sair
                              </button>
                          )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                          {showMoveLeft && <button onClick={() => moveTask(t.id, showMoveLeft)} className="text-orange-500 hover:bg-orange-500/20 p-1.5 rounded" title="Devolver tarefa (Incompleta)"><ChevronLeft size={16}/></button>}
                          {showMoveRight && <button onClick={() => moveTask(t.id, showMoveRight)} className="text-blue-500 hover:bg-blue-500/20 p-1.5 rounded" title="Avancar"><ChevronRight size={16}/></button>}
                          {showDelete && <button onClick={() => removeTask(t.id)} className="text-red-500 hover:bg-red-500/20 p-1.5 rounded" title="Excluir"><Trash2 size={16}/></button>}
                      </div>
                  </div>
              </div>
          );
      };
      // Logica de filtro e ordenacao
      const filteredTasks = tasks.filter((task) => {
          const matchesSearch = !normalizedSearchTerm ||
              task.text.toLowerCase().includes(normalizedSearchTerm) ||
              (task.author && task.author.toLowerCase().includes(normalizedSearchTerm)) ||
              (task.tag && task.tag.toLowerCase().includes(normalizedSearchTerm));

          const matchesTag = activeTagFilter === 'all' || (task.tag || 'geral') === activeTagFilter;

          const authors = task.author ? task.author.split(',').map((author) => author.trim()) : [];
          const matchesOwner = activeOwnerFilter === 'all'
              || (activeOwnerFilter === 'unassigned' && authors.length === 0)
              || authors.includes(activeOwnerFilter);

          const matchesFocus = focusFilter === 'all'
              || (focusFilter === 'mine' && viewAsStudent?.name && authors.includes(viewAsStudent.name))
              || (focusFilter === 'priority' && isTaskPriority(task))
              || (focusFilter === 'overdue' && isTaskOverdue(task))
              || (focusFilter === 'unassigned' && authors.length === 0);

          return matchesSearch && matchesTag && matchesOwner && matchesFocus;
      });

      const todoTasks = filteredTasks.filter(t => t.status === 'todo')
          .sort(sortOpenTasks);
      const doingTasks = filteredTasks.filter(t => t.status === 'doing')
          .sort(sortOpenTasks);
      const reviewTasks = filteredTasks.filter(t => t.status === 'review')
          .sort(sortOpenTasks);
      
      // Ordena Feitos: Mais recentes primeiro
      const doneTasks = filteredTasks.filter(t => t.status === 'done')
          .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));

      const hasActiveFilters = Boolean(normalizedSearchTerm);

      const displayedTodoTasks = (showAllTodo || hasActiveFilters) ? todoTasks : todoTasks.slice(0, 10);
      const displayedDoingTasks = (showAllDoing || hasActiveFilters) ? doingTasks : doingTasks.slice(0, 10);
      const displayedReviewTasks = (showAllReview || hasActiveFilters) ? reviewTasks : reviewTasks.slice(0, 10);
      const displayedDoneTasks = (showAllDone || hasActiveFilters) ? doneTasks : doneTasks.slice(0, 10);

      const activeTasksCount = filteredTasks.filter((task) => task.status !== 'done').length;
      const overdueFilteredCount = filteredTasks.filter((task) => isTaskOverdue(task)).length;
      const priorityFilteredCount = filteredTasks.filter((task) => isTaskPriority(task)).length;
      const doneLast7Days = tasks.filter((task) => {
          if (task.status !== 'done' || !task.completedAt) return false;
          const completedTime = new Date(task.completedAt).getTime();
          return Date.now() - completedTime <= (7 * 24 * 60 * 60 * 1000);
      }).length;

      const boardMessage = overdueFilteredCount > 0
          ? 'Hoje o foco deve ser limpar atrasos antes de puxar novas frentes.'
          : reviewTasks.length > 0
              ? 'Ha entregas aguardando validacao tecnica em Em Revisao.'
              : activeTasksCount === 0
                  ? 'Quadro limpo. Hora de criar a proxima meta da equipe.'
                  : 'Fluxo saudavel: mantenham as tarefas pequenas, claras e com dono definido.';

      const boardStats = [
          { label: 'Abertas', value: activeTasksCount, helper: 'tarefas ativas na visao atual', icon: <ListTodo size={16} />, tone: 'text-white border-white/10 bg-white/5' },
          { label: 'Atrasadas', value: overdueFilteredCount, helper: 'pedem acao imediata', icon: <AlertTriangle size={16} />, tone: 'text-red-400 border-red-500/20 bg-red-500/10' },
          { label: 'Em Revisao', value: reviewTasks.length, helper: 'esperando aprovacao', icon: <Target size={16} />, tone: 'text-purple-400 border-purple-500/20 bg-purple-500/10' },
          { label: 'Entregues 7d', value: doneLast7Days, helper: 'ritmo recente da equipe', icon: <CheckCircle size={16} />, tone: 'text-green-400 border-green-500/20 bg-green-500/10' }
      ];

      const defaultWeekStart = new Date(localTodayObj);
      defaultWeekStart.setDate(defaultWeekStart.getDate() - 6);
      const currentWeekStart = currentWeekData?.startDate || getLocalYYYYMMDD(defaultWeekStart);
      const currentWeekEnd = currentWeekData?.endDate || localTodayStr;
      const tasksThisWeek = tasks.filter((task) => {
          const referenceDate = task.dueDate || getLocalYYYYMMDD(new Date(task.createdAt || Date.now()));
          return referenceDate >= currentWeekStart && referenceDate <= currentWeekEnd;
      });
      const completedThisWeek = tasksThisWeek.filter((task) => task.status === 'done').length;
      const weeklyGoalProgress = tasksThisWeek.length > 0 ? Math.round((completedThisWeek / tasksThisWeek.length) * 100) : 0;
      const avgThroughput = tasksThisWeek.length > 0 ? (completedThisWeek / Math.max(1, 7)).toFixed(1) : '0.0';
      const weeklyUnassignedCount = tasksThisWeek.filter((task) => !task.author).length;
      const weeklyReviewCount = tasksThisWeek.filter((task) => task.status === 'review').length;
      const weeklyBacklogCount = tasksThisWeek.filter((task) => task.status !== 'done').length;

      const tacticalAlerts = [
          overdueFilteredCount > 0 && {
              title: `${overdueFilteredCount} tarefas atrasadas`,
              detail: 'Priorize o que ja passou do prazo antes de abrir novas frentes.',
              tone: 'border-red-500/20 bg-red-500/10 text-red-400',
              icon: <AlertTriangle size={16} />
          },
          reviewTasks.length > 0 && {
              title: `${reviewTasks.length} tarefas em revisao`,
              detail: 'Ha entregas esperando aprovacao tecnica para virar resultado.',
              tone: 'border-purple-500/20 bg-purple-500/10 text-purple-300',
              icon: <Search size={16} />
          },
          filteredTasks.filter((task) => !task.author && task.status !== 'done').length > 0 && {
              title: `${filteredTasks.filter((task) => !task.author && task.status !== 'done').length} tarefas sem dono`,
              detail: 'Distribuam responsabilidades para evitar tarefa esquecida.',
              tone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300',
              icon: <Users size={16} />
          },
          doingTasks.length >= 6 && {
              title: 'Execucao muito espalhada',
              detail: 'Reduzam o WIP para acelerar entrega e aprovacao.',
              tone: 'border-orange-500/20 bg-orange-500/10 text-orange-300',
              icon: <Zap size={16} />
          }
      ].filter(Boolean).slice(0, 3);

      const studentTasksThisWeek = !isAdmin && viewAsStudent?.name
          ? tasksThisWeek
              .filter((task) => task.author && task.author.includes(viewAsStudent.name))
              .sort((a, b) => {
                  if (a.status === 'done' && b.status !== 'done') return 1;
                  if (a.status !== 'done' && b.status === 'done') return -1;
                  return sortOpenTasks(a, b);
              })
          : [];

      const studentTaskSummary = {
          total: studentTasksThisWeek.length,
          done: studentTasksThisWeek.filter((task) => task.status === 'done').length,
          review: studentTasksThisWeek.filter((task) => task.status === 'review').length,
          overdue: studentTasksThisWeek.filter((task) => isTaskOverdue(task)).length
      };

      const getColumnSignal = (columnId, total) => {
          if (columnId === 'todo' && total >= 10) return { label: 'Backlog alto', tone: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
          if (columnId === 'doing' && total >= 6) return { label: 'WIP alto', tone: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
          if (columnId === 'review' && total >= 3) return { label: 'Aprovar', tone: 'text-purple-300 bg-purple-500/10 border-purple-500/20' };
          if (columnId === 'done' && total >= 6) return { label: 'Bom ritmo', tone: 'text-green-400 bg-green-500/10 border-green-500/20' };
          return null;
      };

      const buildLaneGroups = (taskList) => {
          if (activeTagFilter !== 'all') {
              const selectedTag = KANBAN_TAGS.find((tag) => tag.id === activeTagFilter) || KANBAN_TAGS[3];
              return [{ ...selectedTag, tasks: taskList, compact: false }];
          }

          if (kanbanLayout === 'compact') {
              return [{ id: 'all', label: 'Quadro compacto', color: 'bg-white/5 text-gray-300 border-white/10', tasks: taskList, compact: true }];
          }

          return KANBAN_TAGS.map((tag) => ({
              ...tag,
              tasks: taskList.filter((task) => (task.tag || 'geral') === tag.id),
              compact: false
          })).filter((lane) => lane.tasks.length > 0);
      };

      const columnConfigs = [
          {
              id: 'todo',
              title: 'A Fazer',
              subtitle: 'planejamento e prioridade',
              icon: <ListTodo size={16} />,
              total: todoTasks.length,
              tasks: displayedTodoTasks,
              showAll: showAllTodo,
              setShowAll: setShowAllTodo,
              moveLeft: null,
              moveRight: 'doing',
              accent: draggedOverCol === 'todo'
                  ? 'bg-[#1a1a2a] border-white/40 shadow-lg'
                  : 'bg-[#151520] border-white/10',
              heading: 'text-gray-300 border-white/5',
              moreTone: 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10',
              emptyText: 'Crie ou priorize a proxima entrega da equipe.'
          },
          {
              id: 'doing',
              title: 'Fazendo',
              subtitle: 'execucao em andamento',
              icon: <Loader2 size={16} className="animate-spin" />,
              total: doingTasks.length,
              tasks: displayedDoingTasks,
              showAll: showAllDoing,
              setShowAll: setShowAllDoing,
              moveLeft: null,
              moveRight: 'review',
              accent: draggedOverCol === 'doing'
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'bg-blue-500/5 border-blue-500/20',
              heading: 'text-blue-400 border-blue-500/10',
              moreTone: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20',
              emptyText: 'Nenhuma tarefa em execucao agora.'
          },
          {
              id: 'review',
              title: 'Em Revisao',
              subtitle: 'validacao antes de concluir',
              icon: <Search size={16} />,
              total: reviewTasks.length,
              tasks: displayedReviewTasks,
              showAll: showAllReview,
              setShowAll: setShowAllReview,
              moveLeft: isAdmin ? 'doing' : null,
              moveRight: isAdmin ? 'done' : null,
              accent: draggedOverCol === 'review'
                  ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'bg-purple-500/5 border-purple-500/20',
              heading: 'text-purple-400 border-purple-500/10',
              moreTone: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20',
              emptyText: 'Quando uma entrega estiver pronta, ela aparece aqui.'
          },
          {
              id: 'done',
              title: 'Feito',
              subtitle: 'entregas aprovadas e registradas',
              icon: <CheckCircle size={16} />,
              total: doneTasks.length,
              tasks: displayedDoneTasks,
              showAll: showAllDone,
              setShowAll: setShowAllDone,
              moveLeft: null,
              moveRight: null,
              accent: draggedOverCol === 'done'
                  ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                  : 'bg-green-500/5 border-green-500/20',
              heading: 'text-green-500 border-green-500/10',
              moreTone: 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20',
              emptyText: 'As entregas concluidas aparecerao aqui.'
          }
      ];

      return (
      <div className="animate-in fade-in duration-500 flex flex-col h-full">
          <div className="mb-6">
              <div className="self-start rounded-[28px] border border-white/10 bg-[#151520] p-6 shadow-2xl">
                  <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Quadro de tarefas</p>
                      <h2 className="text-2xl md:text-3xl font-black text-white mt-2 leading-tight">Busca e leitura rapida do kanban</h2>
                      <p className="text-sm text-gray-300 mt-3 max-w-3xl">{boardMessage}</p>

                      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                          {boardStats.map((stat) => (
                              <div key={stat.label} className={`rounded-2xl border p-4 ${stat.tone}`}>
                                  <div className="flex items-center justify-between">
                                      <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-300">{stat.label}</span>
                                      <span>{stat.icon}</span>
                                  </div>
                                  <div className="text-2xl font-black text-white mt-3">{stat.value}</div>
                                  <p className="text-xs text-gray-300 mt-1">{stat.helper}</p>
                              </div>
                          ))}
                      </div>

                      <div className="mt-6 relative">
                          <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
                          <input
                              type="text"
                              placeholder="Buscar tarefas por nome, tag ou responsavel..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onKeyDown={stopKanbanInputKeyDown}
                              className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-12 pr-28 text-white focus:border-orange-500 outline-none transition-all"
                          />
                          {hasActiveFilters && (
                              <button
                                  type="button"
                                  onClick={() => setSearchTerm('')}
                                  className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10"
                              >
                                  <X size={12} /> Limpar
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
          {tacticalAlerts.length > 0 && (
              <div className="grid lg:grid-cols-3 gap-4 mb-6">
                  {tacticalAlerts.map((alert) => (
                      <div key={alert.title} className={`rounded-2xl border p-4 ${alert.tone}`}>
                          <div className="flex items-center gap-2 text-sm font-bold">
                              {alert.icon} {alert.title}
                          </div>
                          <p className="text-xs text-gray-200 mt-2 leading-relaxed">{alert.detail}</p>
                      </div>
                  ))}
              </div>
          )}

          {!isAdmin && viewAsStudent && (
              <div className="mb-6 rounded-[28px] border border-white/10 bg-[#151520] p-6 shadow-2xl">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-[0.24em]">
                              <Target size={12} /> Minhas Entregas da Semana
                          </div>
                          <h3 className="text-2xl font-black text-white mt-3">Foco pessoal de {viewAsStudent.name}</h3>
                          <p className="text-sm text-gray-400 mt-1">Acompanhe suas tarefas da semana atual e saiba o que precisa andar primeiro.</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
                              <p className="text-2xl font-black text-white">{studentTaskSummary.total}</p>
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 mt-1">tarefas</p>
                          </div>
                          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-center">
                              <p className="text-2xl font-black text-white">{studentTaskSummary.done}</p>
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 mt-1">concluidas</p>
                          </div>
                          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 text-center">
                              <p className="text-2xl font-black text-white">{studentTaskSummary.review}</p>
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 mt-1">em revisao</p>
                          </div>
                          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                              <p className="text-2xl font-black text-white">{studentTaskSummary.overdue}</p>
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 mt-1">atrasadas</p>
                          </div>
                      </div>
                  </div>

                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 mt-6">
                      {studentTasksThisWeek.slice(0, 4).map((task) => {
                          const taskStatus = getDeadlineStatus(task.dueDate);
                          return (
                              <div key={task.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                  <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">{task.tag || 'geral'}</span>
                                      <span className={`text-[10px] font-bold ${taskStatus?.color || 'text-gray-500'}`}>{taskStatus?.text || 'Sem prazo'}</span>
                                  </div>
                                  <p className="text-sm text-white font-bold mt-3 leading-relaxed">{task.text}</p>
                                  <div className="mt-3 text-[11px] text-gray-400">
                                      {task.status === 'done' ? 'Concluida' : task.status === 'review' ? 'Aguardando validacao' : task.status === 'doing' ? 'Em execucao' : 'A iniciar'}
                                  </div>
                              </div>
                          );
                      })}
                      {studentTasksThisWeek.length === 0 && (
                          <div className="md:col-span-2 xl:col-span-4 rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
                              <p className="text-sm font-bold text-white">Voce ainda nao tem entregas ligadas a esta semana.</p>
                              <p className="text-xs text-gray-500 mt-2">Use Tarefas para assumir uma tarefa e deixar seu plano visivel.</p>
                          </div>
                      )}
                  </div>
              </div>
          )}

          <div className="flex overflow-x-auto snap-x md:grid md:grid-cols-4 gap-6 flex-1 min-h-[600px] pb-4 custom-scrollbar">
              {columnConfigs.map((column, columnIndex) => {
                  const columnSignal = getColumnSignal(column.id, column.total);
                  const laneGroups = buildLaneGroups(column.tasks);

                  return (
                      <div
                          key={column.id}
                          className={`shrink-0 w-[85vw] md:w-auto snap-center rounded-2xl p-4 flex flex-col border animate-in fade-in slide-in-from-bottom-4 transition-all duration-500 ease-out motion-reduce:animate-none motion-reduce:transition-none ${column.accent}`}
                          onDragOver={(e) => handleDragOver(e, column.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, column.id)}
                          style={{ animationDelay: `${columnIndex * 90}ms`, animationFillMode: 'both' }}
                      >
                          <div className={`border-b pb-3 mb-4 ${column.heading}`}>
                              <div className="flex items-center justify-between gap-2">
                                  <h3 className="font-bold uppercase flex items-center gap-2">
                                      {column.icon} {column.title} ({column.total})
                                  </h3>
                                  {columnSignal && (
                                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${columnSignal.tone}`}>
                                          {columnSignal.label}
                                      </span>
                                  )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-2">{column.subtitle}</p>
                          </div>

                          {column.id === 'todo' && (
                              <form onSubmit={handleAddTaskSubmit} onKeyDown={stopKanbanInputKeyDown} className="mb-4 space-y-2">
                                  <input
                                      name="taskText"
                                      value={kanbanTaskDraft.text}
                                      onChange={(e) => updateKanbanTaskDraft('text', e.target.value)}
                                      onKeyDown={stopKanbanInputKeyDown}
                                      autoComplete="off"
                                      placeholder="+ Nova Tarefa..."
                                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-orange-500 outline-none transition-all"
                                  />
                                  <div className="flex flex-col gap-2 md:flex-row">
                                      <select
                                          name="taskTag"
                                          value={kanbanTaskDraft.tag}
                                          onChange={(e) => updateKanbanTaskDraft('tag', e.target.value)}
                                          onKeyDown={stopKanbanInputKeyDown}
                                          className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-gray-300 focus:border-orange-500 outline-none md:w-1/4"
                                      >
                                          <option value="engenharia">Engenharia</option>
                                          <option value="inovacao">Inovacao</option>
                                          <option value="gestao">Gestao</option>
                                          <option value="geral">Geral</option>
                                      </select>
                                      <select
                                          name="taskPriority"
                                          value={kanbanTaskDraft.priority}
                                          onChange={(e) => updateKanbanTaskDraft('priority', e.target.value)}
                                          onKeyDown={stopKanbanInputKeyDown}
                                          className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-gray-300 focus:border-orange-500 outline-none md:w-1/4"
                                          title="Prioridade"
                                      >
                                          <option value="normal">Normal</option>
                                          <option value="baixa">Baixa</option>
                                          <option value="alta">Alta</option>
                                          <option value="urgente">Urgente</option>
                                      </select>
                                      <input
                                          type="date"
                                          name="taskDate"
                                          value={kanbanTaskDraft.dueDate}
                                          onChange={(e) => updateKanbanTaskDraft('dueDate', e.target.value)}
                                          onKeyDown={stopKanbanInputKeyDown}
                                          min={isAdmin ? undefined : localTodayStr}
                                          className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-gray-300 focus:border-orange-500 outline-none md:w-1/4"
                                          title="Prazo"
                                      />
                                      <button
                                          type="submit"
                                          disabled={!kanbanTaskDraft.text.trim()}
                                          className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900/40 disabled:text-white/50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold uppercase"
                                      >
                                          Criar
                                      </button>
                                  </div>
                              </form>
                          )}

                          <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                              {column.tasks.length === 0 && (
                                  <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center bg-black/20">
                                      <p className="text-sm font-bold text-white">{hasActiveFilters ? 'Nada encontrado nessa coluna' : 'Coluna organizada'}</p>
                                      <p className="text-xs text-gray-500 mt-2">{hasActiveFilters ? 'Ajuste a busca para ampliar a visao do quadro.' : column.emptyText}</p>
                                  </div>
                              )}

                              {column.tasks.length > 0 && laneGroups.map((lane, laneIndex) => (
                                  <div
                                      key={`${column.id}-${lane.id}`}
                                      className={`${lane.compact ? '' : 'rounded-2xl border border-white/5 bg-black/20 p-3'} animate-in fade-in slide-in-from-bottom-2 transition-all duration-500 ease-out motion-reduce:animate-none motion-reduce:transition-none`}
                                      style={{ animationDelay: `${Math.min((columnIndex * 90) + (laneIndex * 70), 360)}ms`, animationFillMode: 'both' }}
                                  >
                                      {!lane.compact && (
                                          <div className="flex items-center justify-between gap-2 mb-3">
                                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold uppercase ${lane.color}`}>
                                                  <Tag size={8}/> {lane.label}
                                              </span>
                                              <span className="text-[10px] text-gray-500 font-bold">{lane.tasks.length} tarefa(s)</span>
                                          </div>
                                      )}

                                      <div className="space-y-2">
                                          {lane.tasks.map((task, taskIndex) => (
                                              <TaskCard
                                                  key={task.id}
                                                  t={task}
                                                  showMoveLeft={column.moveLeft}
                                                  showMoveRight={column.moveRight}
                                                  showDelete={true}
                                                  cardIndex={taskIndex}
                                                  laneIndex={laneIndex}
                                                  columnIndex={columnIndex}
                                              />
                                          ))}
                                      </div>
                                  </div>
                              ))}

                              {!column.showAll && !hasActiveFilters && column.total > 10 && (
                                  <button onClick={() => column.setShowAll(true)} className={`w-full py-2 mt-2 border rounded-xl text-xs font-bold transition-colors ${column.moreTone}`}>
                                      Ver mais {column.total - 10} {column.id === 'done' ? 'antigas...' : 'tarefas...'}
                                  </button>
                              )}

                              {column.showAll && !hasActiveFilters && column.total > 10 && (
                                  <button onClick={() => column.setShowAll(false)} className="w-full py-2 mt-2 bg-black/40 hover:bg-white/5 text-gray-500 border border-white/5 rounded-xl text-xs font-bold transition-colors">
                                      Ocultar {column.id === 'done' ? 'antigas' : 'tarefas'}
                                  </button>
                              )}
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
      );
}
