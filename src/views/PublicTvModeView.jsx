import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Briefcase,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Expand,
  Lightbulb,
  Megaphone,
  MonitorPlay,
  Palette,
  Pause,
  Play,
  Shield,
  Sparkles,
  Trophy,
  UserCircle,
  Users,
  Wrench,
} from 'lucide-react';
import LogoNewGears from '../components/LogoNewGears';
import { buildPublicAchievements, buildTrainingGallery, getTournamentCountdown } from '../utils/publicShowcase';

const SLIDE_DURATION_MS = 12000;
const STUDENTS_PER_SLIDE = 6;
const PHOTOS_PER_SLIDE = 6;
const cleanText = (value) => `${value || ''}`.trim();

const splitIntoPages = (items, pageSize) => {
  const pages = [];
  for (let index = 0; index < items.length; index += pageSize) {
    pages.push(items.slice(index, index + pageSize));
  }
  return pages;
};

const formatClock = (date) => new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
}).format(date);

const formatDate = (value) => {
  if (!value) return 'Temporada em movimento';
  const parsedDate = new Date(`${value}`.includes('T') ? value : `${value}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate);
};

export default function PublicTvModeView({
  students,
  adminProfile,
  projectSummary,
  outreachEvents,
  robotVersions,
  attachments,
  teamSeasonStats,
  tournamentTarget,
  visualTheme,
  onToggleTheme,
  onExit,
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const publicStudents = useMemo(
    () => [...students]
      .filter((student) => cleanText(student.name))
      .sort((left, right) => left.name.localeCompare(right.name)),
    [students],
  );
  const studentPages = useMemo(
    () => splitIntoPages(publicStudents, STUDENTS_PER_SLIDE),
    [publicStudents],
  );
  const publicOutreachEvents = useMemo(
    () => [...outreachEvents]
      .filter((event) => cleanText(event.name))
      .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0))
      .slice(0, 4),
    [outreachEvents],
  );
  const totalImpactPeople = outreachEvents.reduce((sum, event) => sum + (Number(event.people) || 0), 0);
  const trainingPhotos = useMemo(
    () => buildTrainingGallery({ robotVersions, attachments }),
    [attachments, robotVersions],
  );
  const galleryPages = useMemo(
    () => splitIntoPages(trainingPhotos, PHOTOS_PER_SLIDE),
    [trainingPhotos],
  );
  const achievements = useMemo(
    () => buildPublicAchievements({ students, teamSeasonStats, trainingPhotos, totalImpactPeople }),
    [students, teamSeasonStats, trainingPhotos, totalImpactPeople],
  );
  const countdown = getTournamentCountdown(tournamentTarget, now);
  const projectTitle = cleanText(projectSummary?.title) && projectSummary.title !== 'Nome do Projeto'
    ? projectSummary.title
    : 'Projeto de Inovacao';
  const projectDescription = cleanText(projectSummary?.solution)
    || cleanText(projectSummary?.problem)
    || 'Uma solucao em desenvolvimento com pesquisa, criatividade e impacto real.';
  const projectImage = projectSummary?.image || '/Unearthed.jpg';

  const slides = useMemo(() => [
    { id: 'intro', label: 'New Gears' },
    { id: 'countdown', label: 'Proximo torneio' },
    ...studentPages.map((_, index) => ({ id: `team-${index}`, label: 'Equipe', pageIndex: index })),
    ...(galleryPages.length
      ? galleryPages.map((_, index) => ({ id: `gallery-${index}`, label: 'Galeria de treinos', pageIndex: index }))
      : [{ id: 'gallery-empty', label: 'Galeria de treinos' }]),
    { id: 'project', label: 'Projeto' },
    { id: 'impact', label: 'Impacto' },
    { id: 'achievements', label: 'Conquistas recentes' },
    { id: 'values', label: 'Jeito New Gears' },
  ], [galleryPages, studentPages]);

  const safeSlideIndex = slideIndex % slides.length;
  const activeSlide = slides[safeSlideIndex] || slides[0];
  const goToSlide = useCallback((nextIndex) => {
    const normalizedIndex = (nextIndex + slides.length) % slides.length;
    setSlideIndex(normalizedIndex);
    setProgress(0);
  }, [slides.length]);

  useEffect(() => {
    const clockInterval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    if (isPaused) return undefined;

    const tickMs = 100;
    const progressInterval = window.setInterval(() => {
      setProgress((currentProgress) => {
        const nextProgress = currentProgress + (tickMs / SLIDE_DURATION_MS) * 100;
        if (nextProgress < 100) return nextProgress;

        setSlideIndex((currentSlide) => (currentSlide + 1) % slides.length);
        return 0;
      });
    }, tickMs);

    return () => window.clearInterval(progressInterval);
  }, [isPaused, slides.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') goToSlide(safeSlideIndex - 1);
      if (event.key === 'ArrowRight') goToSlide(safeSlideIndex + 1);
      if (event.key === ' ') {
        event.preventDefault();
        setIsPaused((currentValue) => !currentValue);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToSlide, safeSlideIndex]);

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error('Nao foi possivel ativar a tela cheia:', error);
    }
  };

  const renderSlide = () => {
    if (activeSlide.id === 'intro') {
      return (
        <section className="grid h-full grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] items-center gap-12 px-[7vw] py-[9vh]">
          <div className="max-w-4xl">
            <p className="text-lg font-black uppercase tracking-[0.22em] text-cyan-200">FIRST LEGO League</p>
            <h1 className="mt-5 text-8xl font-black leading-none text-white 2xl:text-9xl">New Gears</h1>
            <p className="mt-7 max-w-3xl text-3xl font-bold leading-relaxed text-slate-100/88">
              Robotica, inovacao e trabalho em equipe em uma temporada feita de ideias, testes e evolucao.
            </p>
            <div className="mt-10 flex gap-4">
              <span className="inline-flex items-center gap-3 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-5 py-4 text-xl font-black text-cyan-100">
                <Users size={24} /> {publicStudents.length} integrantes
              </span>
              <span className="inline-flex items-center gap-3 rounded-lg border border-fuchsia-300/25 bg-fuchsia-300/10 px-5 py-4 text-xl font-black text-fuchsia-100">
                <Megaphone size={24} /> {totalImpactPeople} pessoas alcancadas
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="h-[420px] w-[470px] rounded-lg border border-white/15 bg-black/25 p-14 shadow-2xl backdrop-blur-sm">
              <LogoNewGears />
            </div>
          </div>
        </section>
      );
    }

    if (activeSlide.id === 'countdown') {
      return (
        <section className="grid h-full grid-cols-[minmax(0,1fr)_360px] items-center gap-12 px-[8vw] py-[9vh]">
          <div>
            <p className="text-lg font-black uppercase tracking-[0.22em] text-yellow-200">Rumo ao proximo desafio</p>
            <h2 className="mt-5 text-7xl font-black leading-tight text-white">Contagem regressiva para o torneio</h2>
            <p className="mt-6 text-2xl font-bold leading-relaxed text-slate-200">
              Cada treino deixa a equipe mais preparada para apresentar, competir e aprender junto.
            </p>

            <div className="mt-10 grid grid-cols-4 gap-4">
              {[
                { label: 'Dias', value: countdown.days },
                { label: 'Horas', value: countdown.hours },
                { label: 'Minutos', value: countdown.minutes },
                { label: 'Segundos', value: countdown.seconds },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-yellow-300/25 bg-yellow-300/10 p-5 text-center shadow-xl">
                  <p className="text-6xl font-black text-white">{item.value}</p>
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-yellow-100">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/12 bg-white/5 p-7 text-center shadow-2xl">
            <CalendarDays size={54} className="mx-auto text-yellow-200" />
            <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-slate-400">Data configurada</p>
            <p className="mt-3 text-4xl font-black text-white">{formatDate(tournamentTarget)}</p>
            <p className="mt-5 text-lg font-bold leading-relaxed text-slate-300">
              {countdown.arrived ? 'Chegou o grande dia.' : 'A temporada continua em movimento.'}
            </p>
          </div>
        </section>
      );
    }

    if (activeSlide.id.startsWith('team-')) {
      const pageStudents = studentPages[activeSlide.pageIndex] || [];

      return (
        <section className="flex h-full flex-col px-[6vw] py-[8vh]">
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="text-base font-black uppercase tracking-[0.22em] text-fuchsia-200">Quem faz acontecer</p>
              <h2 className="mt-3 text-6xl font-black text-white">Integrantes da equipe</h2>
            </div>
            <p className="text-xl font-bold text-slate-300">
              Pagina {(activeSlide.pageIndex || 0) + 1} de {studentPages.length}
            </p>
          </div>

          <div className="mt-8 grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-4">
            {pageStudents.map((student) => (
              <article key={student.id} className="grid min-h-0 grid-cols-[42%_1fr] overflow-hidden rounded-lg border border-white/12 bg-[#111827]/95 shadow-xl">
                {student.avatarImage ? (
                  <img src={student.avatarImage} alt={student.name} className="h-full min-h-0 w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#14213d,#24113c)]">
                    <UserCircle size={82} className="text-white/45" />
                  </div>
                )}
                <div className="flex min-w-0 flex-col justify-center p-5">
                  <h3 className="text-3xl font-black leading-tight text-white">{student.name}</h3>
                  <p className="mt-4 flex items-start gap-2 text-lg font-bold leading-relaxed text-slate-300">
                    <Award size={20} className="mt-0.5 shrink-0 text-cyan-300" />
                    {cleanText(student.specialty) || 'Competidor FLL'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      );
    }

    if (activeSlide.id.startsWith('gallery-')) {
      const pagePhotos = activeSlide.id === 'gallery-empty' ? [] : galleryPages[activeSlide.pageIndex] || [];

      return (
        <section className="flex h-full flex-col px-[6vw] py-[8vh]">
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="text-base font-black uppercase tracking-[0.22em] text-yellow-200">Evolucao documentada</p>
              <h2 className="mt-3 text-6xl font-black text-white">Galeria de treinos</h2>
            </div>
            <p className="flex items-center gap-2 text-xl font-bold text-slate-300">
              <Camera size={22} className="text-yellow-200" /> {trainingPhotos.length} registros
            </p>
          </div>

          {pagePhotos.length > 0 ? (
            <div className="mt-8 grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-4">
              {pagePhotos.map((photo) => (
                <article key={photo.id} className="relative min-h-0 overflow-hidden rounded-lg border border-white/12 bg-[#111827] shadow-xl">
                  <img src={photo.image} alt={photo.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(5,9,19,0.96))] px-4 pb-4 pt-14">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-yellow-200">{photo.type}</p>
                    <h3 className="mt-1 text-xl font-black text-white">{photo.title}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-300">{formatDate(photo.date)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 flex min-h-0 flex-1 items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/5 text-center">
              <div>
                <Camera size={58} className="mx-auto text-yellow-200" />
                <p className="mt-5 text-3xl font-black text-white">Os proximos treinos vao aparecer aqui.</p>
                <p className="mt-3 text-xl font-bold text-slate-300">Registre fotos nas versoes do robo e nos anexos.</p>
              </div>
            </div>
          )}
        </section>
      );
    }

    if (activeSlide.id === 'project') {
      return (
        <section className="grid h-full grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] items-center gap-10 px-[7vw] py-[8vh]">
          <div>
            <p className="text-base font-black uppercase tracking-[0.22em] text-yellow-200">Projeto de inovacao</p>
            <h2 className="mt-4 text-6xl font-black leading-tight text-white">{projectTitle}</h2>
            <p className="mt-7 text-2xl font-bold leading-relaxed text-slate-200">{projectDescription}</p>
            {cleanText(projectSummary?.impact) && (
              <div className="mt-7 rounded-lg border border-yellow-300/25 bg-yellow-300/10 p-5">
                <p className="flex items-center gap-3 text-base font-black uppercase tracking-[0.16em] text-yellow-100">
                  <Lightbulb size={22} /> Impacto esperado
                </p>
                <p className="mt-3 text-xl font-bold leading-relaxed text-yellow-50/88">{projectSummary.impact}</p>
              </div>
            )}
          </div>
          <div className="overflow-hidden rounded-lg border border-white/12 bg-white/5 shadow-2xl">
            <img src={projectImage} alt={projectTitle} className="aspect-[4/3] w-full object-cover" />
          </div>
        </section>
      );
    }

    if (activeSlide.id === 'impact') {
      return (
        <section className="flex h-full flex-col px-[7vw] py-[8vh]">
          <div className="grid grid-cols-[minmax(0,1fr)_280px] items-end gap-8">
            <div>
              <p className="text-base font-black uppercase tracking-[0.22em] text-cyan-200">Ideias que saem da bancada</p>
              <h2 className="mt-3 text-6xl font-black text-white">Impacto na comunidade</h2>
            </div>
            <div className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-300/10 p-5 text-right">
              <p className="text-5xl font-black text-white">{totalImpactPeople}</p>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.16em] text-fuchsia-100">Pessoas alcancadas</p>
            </div>
          </div>

          <div className="mt-8 grid min-h-0 flex-1 grid-cols-2 gap-4">
            {publicOutreachEvents.map((event) => (
              <article key={event.id} className="flex min-h-0 flex-col justify-center rounded-lg border border-white/12 bg-[#111827]/95 p-6 shadow-xl">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-black uppercase tracking-[0.14em] text-cyan-100">
                    {cleanText(event.type) || 'Acao de impacto'}
                  </span>
                  <span className="text-base font-bold text-slate-400">{formatDate(event.date)}</span>
                </div>
                <h3 className="mt-5 text-3xl font-black text-white">{event.name}</h3>
                <p className="mt-4 flex items-center gap-2 text-2xl font-black text-fuchsia-200">
                  <Users size={24} /> {Number(event.people) || 0} pessoas
                </p>
              </article>
            ))}
            {publicOutreachEvents.length === 0 && (
              <div className="col-span-2 flex items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/5 text-2xl font-bold text-slate-300">
                Novas acoes de impacto aparecerao aqui ao longo da temporada.
              </div>
            )}
          </div>
        </section>
      );
    }

    if (activeSlide.id === 'achievements') {
      return (
        <section className="flex h-full flex-col px-[7vw] py-[8vh]">
          <div>
            <p className="text-base font-black uppercase tracking-[0.22em] text-yellow-200">Temporada em movimento</p>
            <h2 className="mt-3 text-6xl font-black text-white">Conquistas recentes</h2>
          </div>

          {achievements.length > 0 ? (
            <div className="mt-8 grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-4">
              {achievements.map((achievement) => (
                <article key={achievement.id} className="flex min-h-0 flex-col justify-center rounded-lg border border-yellow-300/20 bg-yellow-300/10 p-6 shadow-xl">
                  <Trophy size={32} className="text-yellow-200" />
                  <p className="mt-5 text-sm font-black uppercase tracking-[0.14em] text-yellow-100">{achievement.type}</p>
                  <h3 className="mt-2 text-3xl font-black leading-tight text-white">{achievement.title}</h3>
                  <p className="mt-3 text-lg font-bold leading-relaxed text-slate-200">{achievement.detail}</p>
                  {achievement.date && <p className="mt-3 text-sm font-black text-yellow-100/75">{formatDate(achievement.date)}</p>}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 flex min-h-0 flex-1 items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/5 text-center">
              <div>
                <Trophy size={58} className="mx-auto text-yellow-200" />
                <p className="mt-5 text-3xl font-black text-white">A primeira conquista esta a caminho.</p>
                <p className="mt-3 text-xl font-bold text-slate-300">Cada treino pode abrir um novo destaque da equipe.</p>
              </div>
            </div>
          )}
        </section>
      );
    }

    return (
      <section className="grid h-full grid-cols-[minmax(0,1fr)_340px] items-center gap-12 px-[8vw] py-[9vh]">
        <div>
          <p className="text-base font-black uppercase tracking-[0.22em] text-fuchsia-200">Jeito New Gears</p>
          <h2 className="mt-4 text-7xl font-black leading-tight text-white">Aprender, testar e crescer juntos.</h2>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Robotica', detail: 'Construir, programar e melhorar.', Icon: Wrench, tone: 'text-cyan-200 border-cyan-300/20 bg-cyan-300/10' },
              { label: 'Inovacao', detail: 'Pesquisar problemas e criar solucoes.', Icon: Lightbulb, tone: 'text-yellow-100 border-yellow-300/20 bg-yellow-300/10' },
              { label: 'Equipe', detail: 'Dividir responsabilidades e celebrar avancos.', Icon: Users, tone: 'text-fuchsia-100 border-fuchsia-300/20 bg-fuchsia-300/10' },
              { label: 'Impacto', detail: 'Compartilhar conhecimento com a comunidade.', Icon: Megaphone, tone: 'text-emerald-100 border-emerald-300/20 bg-emerald-300/10' },
            ].map(({ label, detail, Icon, tone }) => (
              <div key={label} className={`rounded-lg border p-5 ${tone}`}>
                {createElement(Icon, { size: 28 })}
                <h3 className="mt-4 text-2xl font-black text-white">{label}</h3>
                <p className="mt-2 text-lg font-bold leading-relaxed opacity-90">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-white/12 bg-white/5 p-6">
            <Briefcase size={28} className="text-yellow-200" />
            <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-slate-400">Equipe tecnica</p>
            <p className="mt-2 text-3xl font-black text-white">{cleanText(adminProfile?.name) || 'New Gears'}</p>
            <p className="mt-2 text-lg font-bold text-slate-300">{cleanText(adminProfile?.specialty) || 'Mentoria e desenvolvimento'}</p>
          </div>
          <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-6 text-cyan-100">
            <Sparkles size={28} />
            <p className="mt-4 text-2xl font-black leading-relaxed">Uma temporada inteira para transformar curiosidade em experiência.</p>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="newgears-public-tv-shell relative h-screen overflow-hidden bg-[#070b14] text-white">
      <img src="/Unearthed.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,9,19,0.98),rgba(12,17,35,0.94)_52%,rgba(24,12,37,0.94))]" />

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-6 border-b border-white/10 bg-black/22 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-11 rounded-lg border border-white/10 bg-white/5 p-2"><LogoNewGears /></div>
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-white">
            <MonitorPlay size={16} className="text-cyan-200" /> New Gears na escola
          </p>
        </div>

        <div className="flex items-center gap-3">
          <p className="flex items-center gap-2 text-base font-black text-slate-200">
            <Clock3 size={17} className="text-cyan-200" /> {formatClock(now)}
          </p>
          <button type="button" onClick={() => goToSlide(safeSlideIndex - 1)} title="Slide anterior" className="rounded-lg border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => setIsPaused((currentValue) => !currentValue)} title={isPaused ? 'Continuar apresentacao' : 'Pausar apresentacao'} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10">
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button type="button" onClick={() => goToSlide(safeSlideIndex + 1)} title="Proximo slide" className="rounded-lg border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10">
            <ChevronRight size={18} />
          </button>
          <button type="button" onClick={enterFullscreen} title="Ativar tela cheia" className="rounded-lg border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10">
            <Expand size={18} />
          </button>
          <button type="button" onClick={onToggleTheme} title={visualTheme === 'gold' ? 'Usar tema classico' : 'Usar tema dourado'} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10">
            <Palette size={18} />
          </button>
          <button type="button" onClick={onExit} title="Voltar para a vitrine" className="rounded-lg border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10">
            <ArrowLeft size={18} />
          </button>
        </div>
      </header>

      <main className="relative z-10 h-full pt-[65px] pb-[54px]">
        {renderSlide()}
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/25 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <p className="flex shrink-0 items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-300">
            <Shield size={14} className="text-cyan-200" /> {activeSlide.label}
          </p>
          <div className="flex flex-1 gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(index)}
                title={slide.label}
                className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"
              >
                <span
                  className={`block h-full rounded-full ${index === safeSlideIndex ? 'bg-cyan-300' : index < safeSlideIndex ? 'bg-white/35' : 'bg-transparent'}`}
                  style={{ width: index === safeSlideIndex ? `${progress}%` : '100%' }}
                />
              </button>
            ))}
          </div>
          <p className="shrink-0 text-xs font-black text-slate-400">{safeSlideIndex + 1}/{slides.length}</p>
        </div>
      </footer>
    </div>
  );
}
