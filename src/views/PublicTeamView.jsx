import {
  ArrowLeft,
  Award,
  Briefcase,
  Camera,
  ExternalLink,
  Lightbulb,
  Megaphone,
  MonitorPlay,
  Palette,
  Shield,
  UserCircle,
  Users,
} from 'lucide-react';
import LogoNewGears from '../components/LogoNewGears';
import { buildTrainingGallery } from '../utils/publicShowcase';

const cleanText = (value) => `${value || ''}`.trim();

export default function PublicTeamView({
  students,
  adminProfile,
  projectSummary,
  outreachEvents,
  robotVersions,
  attachments,
  visualTheme,
  onBackToLogin,
  onOpenTvMode,
  onToggleTheme,
}) {
  const publicStudents = [...students]
    .filter((student) => cleanText(student.name))
    .sort((left, right) => left.name.localeCompare(right.name));
  const totalImpactPeople = outreachEvents.reduce((sum, event) => sum + (Number(event.people) || 0), 0);
  const trainingPhotos = buildTrainingGallery({ robotVersions, attachments }).slice(0, 6);
  const projectTitle = cleanText(projectSummary?.title) && projectSummary.title !== 'Nome do Projeto'
    ? projectSummary.title
    : 'Projeto de Inovacao';
  const projectDescription = cleanText(projectSummary?.solution)
    || cleanText(projectSummary?.problem)
    || 'A equipe esta construindo uma solucao com pesquisa, criatividade e impacto real.';
  const projectImage = projectSummary?.image || '/Unearthed.jpg';

  return (
    <div className="newgears-public-shell min-h-screen bg-[#070b14] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070b14]/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-12 rounded-lg border border-white/10 bg-white/5 p-2">
              <LogoNewGears />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200/70">Vitrine publica</p>
              <p className="text-sm font-black text-white">New Gears FLL</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              title={visualTheme === 'gold' ? 'Usar tema classico' : 'Usar tema dourado'}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-white/10"
            >
              <Palette size={16} />
              <span className="hidden lg:inline">{visualTheme === 'gold' ? 'Classico' : 'Dourado'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenTvMode}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 hover:bg-cyan-300 hover:text-slate-950"
            >
              <MonitorPlay size={16} />
              <span className="hidden sm:inline">Modo TV</span>
            </button>
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-white/10"
            >
              <ArrowLeft size={16} />
              <span className="hidden lg:inline">Area da equipe</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[540px] overflow-hidden border-b border-white/10">
          <img
            src="/Unearthed.jpg"
            alt="Temporada FLL"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,9,19,0.98),rgba(5,9,19,0.86)_48%,rgba(5,9,19,0.58)),linear-gradient(180deg,rgba(5,9,19,0.18),rgba(5,9,19,0.96))]" />
          <div className="relative mx-auto grid min-h-[540px] w-full max-w-7xl items-center gap-8 px-5 py-12 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)] md:px-8 md:py-16">
            <div className="order-2 max-w-3xl self-end md:order-1">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">FIRST LEGO League</p>
              <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-7xl">New Gears</h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-100/82 md:text-lg">
                Robotica, inovacao e trabalho em equipe em uma temporada feita de ideias, testes e evolucao constante.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-100">
                  <Users size={15} /> {publicStudents.length} integrantes
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-2 text-xs font-bold text-fuchsia-100">
                  <Megaphone size={15} /> {totalImpactPeople} pessoas alcancadas
                </span>
              </div>
            </div>

            <div className="order-1 flex justify-center self-center md:order-2 md:justify-end">
              <div className="h-44 w-48 rounded-lg border border-white/15 bg-black/25 p-6 shadow-2xl backdrop-blur-sm sm:h-56 sm:w-64 md:h-72 md:w-80 md:p-8">
                <LogoNewGears />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#0c111d] px-5 py-12 md:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-200/75">Quem faz acontecer</p>
              <h2 className="mt-3 text-3xl font-black text-white">Integrantes da equipe</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Cada integrante contribui com uma habilidade diferente para transformar ideias em resultados na mesa e no projeto.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {publicStudents.map((student) => (
                <article key={student.id} className="overflow-hidden rounded-lg border border-white/10 bg-[#111827] shadow-lg">
                  {student.avatarImage ? (
                    <img src={student.avatarImage} alt={student.name} className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-[linear-gradient(135deg,#14213d,#24113c)]">
                      <UserCircle size={62} className="text-white/45" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-black text-white">{student.name}</h3>
                    <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-slate-300">
                      <Award size={14} className="mt-0.5 shrink-0 text-cyan-300" />
                      {cleanText(student.specialty) || 'Competidor FLL'}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {publicStudents.length === 0 && (
              <div className="mt-8 rounded-lg border border-dashed border-white/15 bg-white/5 p-8 text-center text-sm text-slate-300">
                Os integrantes aparecerao aqui assim que os perfis forem cadastrados.
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#0a0f1a] px-5 py-12 md:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-200/80">Evolucao documentada</p>
                <h2 className="mt-3 text-3xl font-black text-white">Galeria de treinos</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Fotos registradas durante testes do robo e evolucao dos anexos.
                </p>
              </div>
              <p className="flex items-center gap-2 text-sm font-black text-yellow-100">
                <Camera size={17} /> {trainingPhotos.length} registros visiveis
              </p>
            </div>

            {trainingPhotos.length > 0 ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {trainingPhotos.map((photo) => (
                  <article key={photo.id} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-[#111827] shadow-lg">
                    <img src={photo.image} alt={photo.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(5,9,19,0.96))] px-4 pb-4 pt-14">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-yellow-200">{photo.type}</p>
                      <h3 className="mt-1 text-lg font-black text-white">{photo.title}</h3>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-lg border border-dashed border-white/15 bg-white/5 p-8 text-center">
                <Camera size={30} className="mx-auto text-yellow-200" />
                <p className="mt-3 text-sm font-bold text-slate-300">
                  As fotos aparecerao aqui quando a equipe registrar versoes do robo e anexos com imagem.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#070b14] px-5 py-12 md:px-8">
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-200/80">Projeto de inovacao</p>
              <h2 className="mt-3 text-3xl font-black text-white">{projectTitle}</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{projectDescription}</p>
              {cleanText(projectSummary?.impact) && (
                <div className="mt-5 rounded-lg border border-yellow-300/20 bg-yellow-300/10 p-4">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-yellow-100">
                    <Lightbulb size={15} /> Impacto esperado
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-yellow-50/85">{projectSummary.impact}</p>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-2xl">
              <img src={projectImage} alt={projectTitle} className="aspect-[4/3] w-full object-cover" />
            </div>
          </div>
        </section>

        <section className="bg-[#0c111d] px-5 py-12 md:px-8">
          <div className="mx-auto grid w-full max-w-7xl gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <Users size={21} className="text-cyan-300" />
              <p className="mt-4 text-3xl font-black text-white">{publicStudents.length}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Integrantes</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <Megaphone size={21} className="text-fuchsia-300" />
              <p className="mt-4 text-3xl font-black text-white">{totalImpactPeople}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Pessoas alcancadas</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <Briefcase size={21} className="text-yellow-300" />
              <p className="mt-4 text-lg font-black text-white">{cleanText(adminProfile?.name) || 'Equipe tecnica'}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                {cleanText(adminProfile?.specialty) || 'Tecnico responsavel'}
              </p>
            </div>
          </div>

          <div className="mx-auto mt-10 flex w-full max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2"><Shield size={14} /> New Gears FLL</p>
            <button type="button" onClick={onBackToLogin} className="inline-flex items-center gap-2 text-cyan-200 hover:text-white">
              Entrar na plataforma <ExternalLink size={14} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
