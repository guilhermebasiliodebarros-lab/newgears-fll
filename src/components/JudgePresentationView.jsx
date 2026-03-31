import React, { useEffect } from 'react';
import {
  X,
  Crown,
  Lightbulb,
  Megaphone,
  Briefcase,
  Laptop,
  GitCommit,
  Wrench,
  Users,
  Timer,
  Award,
  CheckCircle,
  Printer,
} from 'lucide-react';

const averageRubric = (rubric) => {
  const values = Object.values(rubric || {}).map((value) => Number(value) || 1);
  if (values.length === 0) return '1.0';
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
};

const JudgePresentationView = ({
  isOpen,
  onClose,
  projectSummary,
  experts,
  outreachEvents,
  robotVersions,
  attachments,
  codeSnippets,
  rounds,
  innovationRubric,
  robotDesignRubric,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeCode = codeSnippets.find((code) => code.applied);
  const appliedExperts = experts.filter((expert) => expert.applied).slice(0, 3);
  const topImpactEvents = [...outreachEvents].sort((a, b) => (b.people || 0) - (a.people || 0)).slice(0, 3);
  const latestVersions = [...robotVersions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const latestAttachments = [...attachments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 2);
  const totalImpactPeople = outreachEvents.reduce((sum, event) => sum + (event.people || 0), 0);
  const totalTime = rounds.reduce((sum, round) => sum + (round.estimatedTime || 0), 0);
  const innovationAverage = averageRubric(innovationRubric);
  const robotAverage = averageRubric(robotDesignRubric);

  return (
    <div className="fixed inset-0 z-[220] bg-[#05060a] text-white overflow-y-auto">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.15),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),linear-gradient(180deg,#0a0a0f_0%,#111320_100%)]">
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/40 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-[0.24em]">
                <Crown size={12} /> Judge Mode
              </div>
              <h1 className="text-2xl md:text-3xl font-black mt-3">Apresentacao Oficial da Equipe</h1>
              <p className="text-sm text-gray-400 mt-1">Resumo premium para banca de juizes da First Lego League.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500 hover:text-black text-sm font-bold transition-colors text-cyan-300">
                <Printer size={18} /> Imprimir
              </button>
              <button onClick={onClose} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors">
                <X size={18} /> Fechar
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-6">
            <div className="rounded-[28px] border border-white/10 bg-[#151520] p-8 shadow-2xl">
              <div className="flex items-center gap-3 text-yellow-400 mb-4">
                <Lightbulb size={22} />
                <span className="text-[11px] uppercase tracking-[0.28em] font-bold">Narrativa de Inovacao</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">{projectSummary?.title || 'Projeto em desenvolvimento'}</h2>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-red-400 font-bold mb-2">Problema</p>
                  <p className="text-sm text-gray-200 leading-relaxed">{projectSummary?.problem || 'Definam com clareza o problema central que a equipe esta atacando.'}</p>
                </div>
                <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-green-400 font-bold mb-2">Solucao</p>
                  <p className="text-sm text-gray-200 leading-relaxed">{projectSummary?.solution || 'Registrem a solucao de forma simples, objetiva e explicavel para qualquer juiz.'}</p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold mb-2">Impacto</p>
                  <p className="text-sm text-gray-200 leading-relaxed">{projectSummary?.impact || 'Mostrem quem e beneficiado e por que isso importa no mundo real.'}</p>
                </div>
              </div>

              {projectSummary?.image && (
                <div className="mt-6 rounded-3xl overflow-hidden border border-white/10 bg-black/30">
                  <img src={projectSummary.image} alt="Projeto" className="w-full h-[320px] object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6">
                <div className="flex items-center gap-2 text-purple-400 mb-4">
                  <Award size={20} />
                  <span className="text-[11px] uppercase tracking-[0.24em] font-bold">Indicadores de Campeao</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-orange-400 font-bold">Impacto</p>
                    <p className="text-3xl font-black text-white mt-2">{totalImpactPeople}</p>
                    <p className="text-xs text-gray-400 mt-1">pessoas alcancadas</p>
                  </div>
                  <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-pink-400 font-bold">Especialistas</p>
                    <p className="text-3xl font-black text-white mt-2">{appliedExperts.length}</p>
                    <p className="text-xs text-gray-400 mt-1">aplicados na pratica</p>
                  </div>
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-green-400 font-bold">Codigo Oficial</p>
                    <p className="text-sm font-black text-white mt-2">{activeCode?.title || 'Nao definido'}</p>
                    <p className="text-xs text-gray-400 mt-1">programacao principal</p>
                  </div>
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-blue-400 font-bold">Tempo Total</p>
                    <p className="text-3xl font-black text-white mt-2">{totalTime || 0}s</p>
                    <p className="text-xs text-gray-400 mt-1">plano de rounds</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-yellow-400 font-bold">Rubrica Inovacao</p>
                    <p className="text-2xl font-black text-white mt-2">{innovationAverage}/4</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-400 font-bold">Rubrica Robo</p>
                    <p className="text-2xl font-black text-white mt-2">{robotAverage}/4</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6">
                <div className="flex items-center gap-2 text-green-400 mb-4">
                  <CheckCircle size={20} />
                  <span className="text-[11px] uppercase tracking-[0.24em] font-bold">Mensagem-Chave</span>
                </div>
                <p className="text-lg text-gray-100 leading-relaxed">
                  Somos uma equipe que pesquisa, testa, registra evidencias e transforma feedback em melhoria real no projeto e no robo.
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6">
              <div className="flex items-center gap-2 text-pink-400 mb-5">
                <Briefcase size={20} />
                <span className="text-[11px] uppercase tracking-[0.24em] font-bold">Especialistas em Destaque</span>
              </div>
              <div className="space-y-3">
                {appliedExperts.length === 0 && <p className="text-sm text-gray-400">Nenhum especialista aplicado ainda.</p>}
                {appliedExperts.map((expert) => (
                  <div key={expert.id} className="rounded-2xl border border-white/5 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-bold">{expert.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{expert.role}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Aplicado</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-3 line-clamp-4">{expert.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6">
              <div className="flex items-center gap-2 text-blue-400 mb-5">
                <Wrench size={20} />
                <span className="text-[11px] uppercase tracking-[0.24em] font-bold">Evolucao do Robo</span>
              </div>
              <div className="space-y-3">
                {latestVersions.map((version) => (
                  <div key={version.id} className="rounded-2xl border border-white/5 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-bold">{version.name}</p>
                        <p className="text-xs text-blue-400 mt-1">{version.version}</p>
                      </div>
                      <span className="text-xs text-gray-500">{version.date?.split('-').reverse().join('/')}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-3 line-clamp-4">{version.changes}</p>
                  </div>
                ))}
                {latestVersions.length === 0 && <p className="text-sm text-gray-400">Registrem mais versoes do robo para fortalecer a narrativa tecnica.</p>}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6">
              <div className="flex items-center gap-2 text-green-400 mb-5">
                <Laptop size={20} />
                <span className="text-[11px] uppercase tracking-[0.24em] font-bold">Programacao e Evidencias</span>
              </div>
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 mb-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-green-400 font-bold">Codigo Principal</p>
                <p className="text-lg font-black text-white mt-2">{activeCode?.title || 'Nao definido'}</p>
                <p className="text-sm text-gray-300 mt-3 line-clamp-4">{activeCode?.description || 'Definam um codigo oficial para demonstrar consistencia nos testes.'}</p>
              </div>
              <div className="space-y-3">
                {latestAttachments.map((attachment) => (
                  <div key={attachment.id} className="rounded-2xl border border-white/5 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-white font-bold">{attachment.name}</p>
                      <span className="text-xs text-gray-500">{attachment.date?.split('-').reverse().join('/')}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-3 line-clamp-3">{attachment.changes}</p>
                  </div>
                ))}
                {latestAttachments.length === 0 && <p className="text-sm text-gray-400">Anexos e mecanismos ainda nao documentados.</p>}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6">
              <div className="flex items-center gap-2 text-orange-400 mb-5">
                <Megaphone size={20} />
                <span className="text-[11px] uppercase tracking-[0.24em] font-bold">Impacto em Evidencia</span>
              </div>
              <div className="space-y-3">
                {topImpactEvents.length === 0 && <p className="text-sm text-gray-400">Nenhum evento de impacto registrado ainda.</p>}
                {topImpactEvents.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-white/5 bg-black/30 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-bold">{event.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{event.type} • {event.date?.split('-').reverse().join('/')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-orange-400">{event.people || 0}</p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">pessoas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6">
              <div className="flex items-center gap-2 text-cyan-400 mb-5">
                <GitCommit size={20} />
                <span className="text-[11px] uppercase tracking-[0.24em] font-bold">Resumo Tecnico do Robo</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Versoes</p>
                  <p className="text-3xl font-black text-white mt-2">{robotVersions.length}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Anexos</p>
                  <p className="text-3xl font-black text-white mt-2">{attachments.length}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Saidas</p>
                  <p className="text-3xl font-black text-white mt-2">{rounds.length}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Meta de Tempo</p>
                  <p className="text-3xl font-black text-white mt-2">{totalTime <= 150 ? 'OK' : 'Ajustar'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgePresentationView;
