import React, { useState, useEffect } from 'react';
import LogoNewGears from './LogoNewGears';
import Countdown from './Countdown';
import { 
  Users, Rocket, Microscope, BookOpen, Crown, UserCircle, 
  Target, ClipboardList, AlertTriangle, Loader2, CheckCircle, 
  TrendingUp, CalendarDays, Calendar, Clock, MapPin, 
  Trophy, Megaphone, CheckCheck, ChevronLeft, Play, Pause, ChevronRight, X, Search 
} from 'lucide-react';

const SLIDE_DURATION = 9000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const TV_SLIDES = [
    { id: 0, label: 'Equipe', title: 'Equipe da Semana' },
    { id: 1, label: 'Foco', title: 'Foco da Semana' },
    { id: 2, label: 'Kanban', title: 'Painel de Tarefas' },
    { id: 3, label: 'Desempenho', title: 'Desempenho do Robô' },
    { id: 4, label: 'Agenda', title: 'Agenda da Equipe' },
    { id: 5, label: 'Ranking', title: 'Raio-X da Equipe' },
    { id: 6, label: 'Aprovados', title: 'Missões Concluídas' }
];

const pad = (value) => String(value).padStart(2, '0');
const getLocalDateKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const TvModePanel = ({ 
    isTvMode, 
    setIsTvMode, 
    currentWeekData, 
    students, 
    missions, 
    tasks, 
    events, 
    outreachEvents, 
    ScoreEvolutionChart 
}) => {
    const [slide, setSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [autoProgress, setAutoProgress] = useState(0);
    const slidesCount = TV_SLIDES.length;

    const closeTvMode = () => {
        setIsTvMode(false);
        try { if (document.fullscreenElement) document.exitFullscreen(); } catch(e){}
    };

    useEffect(() => {
        if (!isTvMode) return;
        setSlide(0);
        setIsPaused(false);
        setAutoProgress(0);
    }, [isTvMode]);

    useEffect(() => {
        if (!isTvMode) return;
        if (isPaused) return;
        setAutoProgress(0);

        const startedAt = Date.now();
        const progressTimer = setInterval(() => {
            const elapsed = Date.now() - startedAt;
            setAutoProgress(Math.min(100, (elapsed / SLIDE_DURATION) * 100));
        }, 120);
        const slideTimer = setTimeout(() => {
            setSlide((current) => (current + 1) % slidesCount);
        }, SLIDE_DURATION);

        return () => {
            clearInterval(progressTimer);
            clearTimeout(slideTimer);
        };
    }, [isTvMode, isPaused, slide, slidesCount]);

    useEffect(() => {
        if (!isTvMode) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeTvMode();
                return;
            }

            if (event.key === 'ArrowRight') {
                setSlide((current) => (current + 1) % slidesCount);
                return;
            }

            if (event.key === 'ArrowLeft') {
                setSlide((current) => (current - 1 + slidesCount) % slidesCount);
                return;
            }

            if (event.key === ' ') {
                event.preventDefault();
                setIsPaused((current) => !current);
                return;
            }

            if (/^[1-7]$/.test(event.key)) {
                setSlide(Number(event.key) - 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTvMode, slidesCount]);

    // Dados processados para os slides
    const resolveStudentName = (value) => {
        if (!value) return "Vago";
        if (typeof value === 'object' && value.name) return value.name;
        const matchedStudent = students.find((student) => student.id === value);
        return matchedStudent?.name || value;
    };

    const todayDate = getLocalDateKey();
    const todayStart = new Date(`${todayDate}T00:00:00`);
    const getEventDateTime = (event) => {
        const safeTime = event?.time && /^\d{2}:\d{2}$/.test(event.time) ? event.time : '18:00';
        const parsed = new Date(`${event?.date || todayDate}T${safeTime}:00`);
        return Number.isNaN(parsed.getTime()) ? new Date(`${todayDate}T18:00:00`) : parsed;
    };
    const getRelativeEventLabel = (event) => {
        const eventDay = new Date(getEventDateTime(event));
        eventDay.setHours(0, 0, 0, 0);
        const diffDays = Math.round((eventDay.getTime() - todayStart.getTime()) / DAY_IN_MS);
        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return 'Amanhã';
        if (diffDays > 1) return `Em ${diffDays} dias`;
        return `${Math.abs(diffDays)} dias atrás`;
    };
    const formatEventDate = (event) => getEventDateTime(event).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

    const sortedStudents = [...students].sort((a, b) => (b.xp || 0) - (a.xp || 0));
    const upcomingEvents = [...events]
        .filter((event) => getEventDateTime(event).getTime() >= todayStart.getTime())
        .sort((a, b) => getEventDateTime(a) - getEventDateTime(b))
        .slice(0, 12);
    
    const totalXP = students.reduce((sum, s) => sum + (s.xp || 0), 0);
    const totalTasksDone = tasks.filter(t => t.status === 'done').length;
    const totalImpact = outreachEvents.reduce((sum, ev) => sum + (ev.people || 0), 0);
    const activeSlide = TV_SLIDES[slide] || TV_SLIDES[0];
    const spotlightEvent = upcomingEvents[0] || null;
    const countdownTarget = spotlightEvent
        ? `${spotlightEvent.date}T${spotlightEvent.time && /^\d{2}:\d{2}$/.test(spotlightEvent.time) ? spotlightEvent.time : '18:00'}:00`
        : "2026-12-01T08:00:00";
    const countdownTitle = spotlightEvent ? `PRÓXIMO ${String(spotlightEvent.type || 'EVENTO').toUpperCase()}` : "TORNEIO FLL";
    const secondsRemaining = Math.max(1, Math.ceil((SLIDE_DURATION * (1 - autoProgress / 100)) / 1000));

    if (!isTvMode) return null;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-[#05070d] font-sans text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.10),transparent_24%)]"></div>
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:40px_40px]"></div>
            {/* HEADER TV */}
            <div className="relative z-10 flex items-center justify-between gap-6 border-b border-white/10 bg-[#0d1119]/85 px-8 py-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-5">
                    <div className="w-20 rounded-[24px] border border-white/10 bg-white/5 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"><LogoNewGears /></div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200">Modo TV</p>
                        <h1 className="mt-2 text-5xl font-black text-white">NEW GEARS TV</h1>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
                            {new Date().toLocaleDateString('pt-BR')} • {currentWeekData?.weekName || 'Temporada FLL'} • Slide {slide + 1}/{slidesCount}
                        </p>
                    </div>
                </div>
                <div className="scale-[1.15] origin-right rounded-[28px] border border-white/10 bg-white/5 px-4 py-2">
                    <Countdown targetDate={countdownTarget} title={countdownTitle} compact={true} />
                </div>
            </div>

            {/* CONTEÚDO DOS SLIDES */}
            <div className="relative z-10 border-b border-white/5 bg-[#0d1119]/70 px-8 py-4 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] ${isPaused ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200' : 'border-red-500/30 bg-red-500/10 text-red-200'}`}>
                            <span className={`h-2.5 w-2.5 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-red-400 animate-pulse'}`}></span>
                            {isPaused ? 'Transmissão pausada' : 'Transmissão ao vivo'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-300">
                            {activeSlide.title}
                        </span>
                    </div>
                    <div className="w-full max-w-md">
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 transition-[width] duration-100" style={{ width: `${autoProgress}%` }}></div>
                        </div>
                        <p className="mt-2 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                            {isPaused ? 'Pausado' : `Próxima troca em ${secondsRemaining}s`} • Espaço pausa • Setas navegam • 1-7 alternam
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-10 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#0a0a0f] to-black">
                <div key={slide} className="w-full h-full animate-in fade-in duration-1000">
                    
                    {/* SLIDE 0: CRONOGRAMA DA SEMANA */}
                    {slide === 0 && (
                        <div className="h-full flex flex-col max-w-7xl mx-auto w-full">
                            <h2 className="text-4xl font-black mb-4 text-white flex items-center justify-center gap-4 uppercase tracking-widest"><Users size={40} className="text-yellow-500"/> Equipe da Semana</h2>
                            <div className="flex justify-center mb-4">
                                <span className="bg-white/5 border border-white/10 text-yellow-500 font-bold px-6 py-1.5 rounded-full text-xl tracking-widest uppercase shadow-lg shadow-yellow-500/10">
                                    {currentWeekData?.weekName || "Semana Atual"}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-6 flex-1 min-h-0 pb-4">
                                {['Engenharia', 'Inovação', 'Gestão'].map(st => {
                                    const stationStudents = currentWeekData?.assignments?.[st] || [];
                                    const style = st === 'Engenharia' ? { color: 'text-blue-500', border: 'border-blue-500/20', bgTop: 'bg-blue-500', iconBg: 'bg-blue-500/20', icon: <Rocket size={24}/> } 
                                                : st === 'Inovação' ? { color: 'text-pink-500', border: 'border-pink-500/20', bgTop: 'bg-pink-500', iconBg: 'bg-pink-500/20', icon: <Microscope size={24}/> } 
                                                : { color: 'text-purple-500', border: 'border-purple-500/20', bgTop: 'bg-purple-500', iconBg: 'bg-purple-500/20', icon: <BookOpen size={24}/> };
                                    
                                    return (
                                        <div key={st} className={`bg-[#151520]/80 p-6 rounded-3xl border ${style.border} shadow-xl relative flex flex-col h-full min-h-0`}>
                                            <div className={`absolute top-0 left-0 w-full h-2 rounded-t-3xl ${style.bgTop}`}></div>
                                            <h3 className={`text-2xl font-black uppercase mb-4 tracking-widest text-center mt-1 ${style.color} flex items-center justify-center gap-2`}>{style.icon} {st}</h3>
                                            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                                                {stationStudents.map((s, idx) => {
                                                    const sName = resolveStudentName(s);
                                                    const isLeader = st === 'Gestão' && sName !== 'Sofia' && sName !== 'Heloise' && sName !== 'Vago';
                                                    return (
                                                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl border ${isLeader ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'bg-black/40 border-white/5'}`}>
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isLeader ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]' : `${style.iconBg} ${style.color}`}`}>
                                                                {isLeader ? <Crown size={24} /> : <UserCircle size={24} />}
                                                            </div>
                                                            <div className="flex-1 overflow-hidden">
                                                                <span className={`block font-bold text-xl truncate ${isLeader ? 'text-yellow-400' : 'text-gray-200'}`}>{sName}</span>
                                                                {isLeader && <span className="text-[10px] uppercase font-black tracking-widest text-yellow-500 flex items-center gap-1 mt-0.5"><Crown size={10}/> Líder da Semana</span>}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* SLIDE 1: METAS DA SEMANA */}
                    {slide === 1 && (
                        <div className="h-full flex flex-col justify-center max-w-7xl mx-auto w-full">
                            <h2 className="text-5xl font-black mb-12 text-white flex items-center justify-center gap-4 uppercase"><Target size={48} className="text-red-500"/> Foco da Semana</h2>
                            <div className="grid grid-cols-3 gap-8">
                                {['Engenharia', 'Inovação', 'Gestão'].map(st => (
                                    <div key={st} className="bg-[#151520]/80 p-8 rounded-3xl border border-white/10 shadow-xl relative flex flex-col h-[65vh]">
                                        <div className={`absolute top-0 left-0 w-full h-2 rounded-t-3xl ${st==='Engenharia'?'bg-blue-500':st==='Inovação'?'bg-pink-500':'bg-purple-500'}`}></div>
                                        <h3 className={`text-3xl font-black uppercase mb-6 tracking-widest text-center mt-2 ${st==='Engenharia'?'text-blue-500':st==='Inovação'?'text-pink-500':'text-purple-500'}`}>{st}</h3>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 min-h-0">
                                            <p className="text-2xl font-medium text-gray-200 leading-relaxed whitespace-pre-wrap break-words">"{missions[st]?.text || "Aguardando definição..."}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SLIDE 2: KANBAN GIGANTE */}
                    {slide === 2 && (
                        <div className="h-full flex flex-col">
                            <h2 className="text-4xl font-black text-gray-400 mb-6 flex items-center gap-3 uppercase tracking-widest"><ClipboardList size={40}/> Painel de Tarefas Kanban</h2>
                            <div className="grid grid-cols-4 gap-6 flex-1 overflow-hidden">
                                {[
                                    { status: 'todo', title: 'A Fazer', color: 'border-orange-500', icon: <AlertTriangle size={32}/> },
                                    { status: 'doing', title: 'Fazendo', color: 'border-blue-500', icon: <Loader2 size={32} className="animate-spin"/> },
                                    { status: 'review', title: 'Em Revisão', color: 'border-purple-500', icon: <Search size={32}/> },
                                    { status: 'done', title: 'Feito', color: 'border-green-500', icon: <CheckCircle size={32}/> }
                                ].map(col => (
                                    <div key={col.status} className={`bg-[#151520]/80 border-t-8 ${col.color} rounded-2xl p-5 flex flex-col h-full shadow-2xl`}>
                                        <h3 className="text-3xl font-black uppercase mb-4 flex items-center gap-3">{col.icon} {col.title}</h3>
                                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2">
                                            {tasks.filter(t => t.status === col.status).map(t => (
                                                <div key={t.id} className="bg-black/60 p-4 rounded-xl border border-white/10 shadow-lg flex flex-col">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold text-blue-400 uppercase tracking-wider">{t.author || "Equipe"}</span>
                                                        {t.tag && <span className="text-[10px] uppercase font-bold text-gray-500 border border-gray-600 px-2 py-1 rounded">{t.tag}</span>}
                                                    </div>
                                                    <p className="text-xl font-bold text-gray-200 leading-snug">{t.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SLIDE 3: GRÁFICO DE EVOLUÇÃO (ROUNDS) */}
                    {slide === 3 && (
                        <div className="h-full flex flex-col max-w-7xl mx-auto w-full justify-center">
                            <h2 className="text-5xl font-black mb-12 text-white flex items-center justify-center gap-4 uppercase tracking-widest"><TrendingUp size={48} className="text-green-500"/> Desempenho do Robô</h2>
                            <div className="w-full transform scale-110 origin-center mt-8">
                                <ScoreEvolutionChart isTvMode={true} />
                            </div>
                        </div>
                    )}

                    {/* SLIDE 4: AGENDA / EVENTOS */}
                    {slide === 4 && (
                        <div className="h-full flex flex-col max-w-7xl mx-auto w-full">
                            <h2 className="text-5xl font-black mb-10 text-white flex items-center justify-center gap-4 uppercase tracking-widest"><CalendarDays size={48} className="text-blue-500"/> Agenda da Equipe</h2>
                            <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-hidden pt-4 pb-4 px-2">
                                {upcomingEvents.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center text-gray-500 italic bg-[#151520]/50 rounded-3xl border border-white/5 h-64">
                                        <CalendarDays size={64} className="mb-4 opacity-50"/>
                                        <p className="text-2xl">Nenhum evento agendado para os próximos dias.</p>
                                    </div>
                                ) : (
                                    upcomingEvents.map((ev) => {
                                        const isToday = ev.date === todayDate;
                                        const relativeLabel = getRelativeEventLabel(ev);
                                        const typeColor = ev.type === 'Especialista' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ev.type === 'Visita' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ev.type === 'Reunião' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20';
                                        return (
                                            <div key={ev.id} className={`bg-[#151520] border p-5 rounded-2xl flex flex-col relative ${isToday ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10'}`}>
                                                {isToday && (
                                                    <div className="absolute -top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-md flex items-center gap-1 animate-pulse">
                                                        <AlertTriangle size={10}/> Hoje
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${typeColor}`}>{ev.type}</span>
                                                    <span className="text-xs text-gray-300 flex items-center gap-1 font-mono"><Calendar size={12} className="text-blue-500"/> {formatEventDate(ev)}</span>
                                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-white/10 bg-white/5 text-gray-300">{relativeLabel}</span>
                                                </div>
                                                <h4 className="text-white font-bold text-lg mb-2 leading-tight">{ev.title}</h4>
                                                <div className="flex flex-col gap-1.5 pt-3 border-t border-white/5 mt-auto">
                                                    <div className="flex items-center gap-2 text-xs text-gray-300"><Clock size={14} className="text-yellow-500"/> {ev.time || 'Sem horário'}</div>
                                                    {ev.location && <div className="flex items-center gap-2 text-xs text-gray-300 truncate"><MapPin size={14} className="text-green-500 shrink-0"/> {ev.location}</div>}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* SLIDE 5: RAIO-X E RANKING */}
                    {slide === 5 && (
                        <div className="h-full flex flex-col justify-center max-w-7xl mx-auto w-full">
                            <div className="grid grid-cols-2 gap-16">
                                {/* Ranking */}
                                <div>
                                    <h2 className="text-4xl font-black mb-8 text-yellow-500 flex items-center gap-4 uppercase"><Trophy size={40}/> Ranking Geral XP</h2>
                                    <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                        {sortedStudents.map((s, i) => (
                                            <div key={s.id} className="bg-[#151520]/80 p-4 rounded-xl flex items-center gap-3 border border-white/10 shadow-xl">
                                                <span className={`text-3xl font-black w-10 ${i===0?'text-yellow-500 drop-shadow-md':i===1?'text-gray-300':i===2?'text-orange-500':'text-gray-600'}`}>#{i+1}</span>
                                                {s.avatarImage ? <img src={s.avatarImage} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white/20" /> : <UserCircle size={40} className="text-gray-500" />}
                                                <h3 className="text-xl font-bold flex-1 truncate text-gray-200">{s.name}</h3>
                                                <span className={`text-xl font-black ${i===0?'text-yellow-500':'text-green-500'}`}>{s.xp}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Estatísticas */}
                                <div className="flex flex-col justify-center gap-8">
                                    <div className="bg-blue-500/10 border border-blue-500/30 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(59,130,246,0.15)]">
                                        <p className="text-blue-400 text-2xl font-bold uppercase tracking-widest mb-2">XP Total da Equipe</p>
                                        <p className="text-8xl font-black text-white">{totalXP}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="bg-orange-500/10 border border-orange-500/30 p-8 rounded-3xl text-center">
                                            <Megaphone size={40} className="mx-auto text-orange-500 mb-4"/>
                                            <p className="text-6xl font-black text-white mb-2">{totalImpact}</p>
                                            <p className="text-orange-400 font-bold uppercase tracking-widest">Alcançados</p>
                                        </div>
                                        <div className="bg-green-500/10 border border-green-500/30 p-8 rounded-3xl text-center">
                                            <CheckCheck size={40} className="mx-auto text-green-500 mb-4"/>
                                            <p className="text-6xl font-black text-white mb-2">{totalTasksDone}</p>
                                            <p className="text-green-400 font-bold uppercase tracking-widest">Tarefas Feitas</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLIDE 6: APROVADOS DA SEMANA */}
                    {slide === 6 && (
                        <div className="h-full flex flex-col max-w-7xl mx-auto w-full">
                            <h2 className="text-5xl font-black mb-12 text-white flex items-center justify-center gap-4 uppercase tracking-widest">
                                <CheckCircle size={48} className="text-green-500" /> Missões Concluídas
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                                {students.filter(s => s.submission?.status === 'approved').length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center text-gray-500 italic bg-[#151520]/50 rounded-3xl border border-white/5 h-64">
                                        <CheckCircle size={64} className="mb-4 opacity-50"/>
                                        <p className="text-2xl">Nenhuma missão aprovada ainda nesta semana.</p>
                                    </div>
                                ) : (
                                    students.filter(s => s.submission?.status === 'approved').map(student => (
                                        <div key={student.id} className="bg-green-500/10 border border-green-500/30 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(34,197,94,0.15)] transform transition-transform hover:scale-105">
                                            {student.avatarImage ? (
                                                <img src={student.avatarImage} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-green-500 mb-4 shadow-lg" />
                                            ) : (
                                                <div className="w-32 h-32 rounded-full bg-black/50 flex items-center justify-center border-4 border-green-500 mb-4 shadow-lg">
                                                    <UserCircle size={64} className="text-green-500" />
                                                </div>
                                            )}
                                            <h3 className="text-2xl font-bold text-white mb-2">{student.name}</h3>
                                            <span className="text-sm font-black uppercase tracking-widest text-green-400 bg-green-500/20 px-4 py-1.5 rounded-full border border-green-500/30">
                                                Aprovado
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER TV (STATUS E NAVEGAÇÃO) */}
            <div className="relative z-10 flex items-center justify-between gap-6 border-t border-white/10 bg-[#0d1119]/85 px-8 py-5 backdrop-blur-xl">
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                    <div className={`h-3 w-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div> {isPaused ? 'Pausado' : 'Ao vivo'}
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setSlide(s => (s - 1 + slidesCount) % slidesCount)} className="rounded-full border border-white/10 bg-white/5 p-3 text-gray-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white" title="Canal anterior"><ChevronLeft size={22}/></button>
                    <button onClick={() => setIsPaused(!isPaused)} className={`rounded-full border p-3 transition-all ${isPaused ? 'border-yellow-500/30 bg-yellow-500/20 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'}`} title={isPaused ? "Retomar auto-play" : "Pausar TV"}>
                        {isPaused ? <Play size={22}/> : <Pause size={22}/>}
                    </button>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {TV_SLIDES.map((item, i) => (
                            <button key={item.id} onClick={() => setSlide(i)} className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-all ${i === slide ? 'border-cyan-400/30 bg-cyan-400/12 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.14)]' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10 hover:text-gray-200'}`}>
                                {i + 1}. {item.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setSlide(s => (s + 1) % slidesCount)} className="rounded-full border border-white/10 bg-white/5 p-3 text-gray-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white" title="Próximo canal"><ChevronRight size={22}/></button>
                </div>
                <button onClick={closeTvMode} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-gray-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white">
                    <X size={18} /> Sair da TV
                </button>
            </div>
        </div>
    )
};
export default TvModePanel;
