import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Image as ImageIcon,
  Lightbulb,
  Megaphone,
  MessageSquare,
  Pencil,
  Star,
  Trash2,
  UserCircle,
  Users,
} from 'lucide-react';

const scoreDecisionIdea = (item) => (item.impact * 3) + (item.cost * 2) + item.feasibility + (item.innovation * 2);

const InnovationStrategyPanel = ({
  projectSummary,
  projectImpactNarrative,
  decisionMatrix,
  experts,
  outreachEvents,
  totalImpactPeople,
  isAdmin,
  viewAsStudent,
  onOpenProject,
  onOpenMatrix,
  onDeleteMatrix,
  onOpenExpert,
  onOpenExpertEdit,
  onOpenExpertView,
  onDeleteExpert,
  onOpenImpact,
  onDeleteOutreach,
}) => {
  const sortedDecisionIdeas = [...decisionMatrix].sort((left, right) => scoreDecisionIdea(right) - scoreDecisionIdea(left));
  const sortedExperts = [...experts].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  const sortedImpactEvents = [...outreachEvents].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  const topDecisionIdea = sortedDecisionIdeas[0] || null;
  const matrixAverageScore = sortedDecisionIdeas.length > 0
    ? (sortedDecisionIdeas.reduce((sum, item) => sum + scoreDecisionIdea(item), 0) / sortedDecisionIdeas.length).toFixed(1)
    : '0.0';
  const appliedExperts = sortedExperts.filter((expert) => expert.applied);
  const expertsWithEvidence = sortedExperts.filter((expert) => expert.image);
  const expertConversionRate = sortedExperts.length > 0 ? Math.round((appliedExperts.length / sortedExperts.length) * 100) : 0;
  const topImpactType = Object.entries(
    sortedImpactEvents.reduce((accumulator, event) => {
      accumulator[event.type || 'Outro'] = (accumulator[event.type || 'Outro'] || 0) + (event.people || 0);
      return accumulator;
    }, {})
  ).sort((left, right) => right[1] - left[1])[0];
  const latestImpactEvent = sortedImpactEvents[0] || null;
  const projectReadinessChecklist = [
    {
      label: 'Nome do projeto definido',
      ready: Boolean(`${projectSummary?.title || ''}`.trim()) && projectSummary?.title !== 'Nome do Projeto',
      helper: 'Escolham um nome que os juizes consigam repetir com facilidade.',
    },
    {
      label: 'Problema bem delimitado',
      ready: Boolean(`${projectSummary?.problem || ''}`.trim()),
      helper: 'Descrevam quem sofre, o que acontece e por que isso importa.',
    },
    {
      label: 'Solucao compreensivel',
      ready: Boolean(`${projectSummary?.solution || ''}`.trim()),
      helper: 'Expliquem como a ideia funciona de forma simples e convincente.',
    },
    {
      label: 'Impacto explicado',
      ready: Boolean(`${projectSummary?.impact || ''}`.trim()),
      helper: 'Mostrem quem ganha com isso e qual beneficio real aparece.',
    },
    {
      label: 'Evidencia visual',
      ready: Boolean(projectSummary?.image),
      helper: 'Anexem desenho, mockup ou prototipo para dar concretude.',
    },
  ];
  const projectReadinessScore = Math.round((projectReadinessChecklist.filter((item) => item.ready).length / projectReadinessChecklist.length) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#22151f] via-[#151520] to-[#10131d] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.32)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.16),transparent_32%)] pointer-events-none"></div>
        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-200">
              <Lightbulb size={12} /> Innovation Strategy Deck
            </span>
            <h3 className="text-3xl font-black text-white mt-4 leading-tight">
              {projectSummary?.title && projectSummary.title !== 'Nome do Projeto' ? projectSummary.title : 'Projeto de inovacao em construcao'}
            </h3>
            <p className="text-sm text-gray-300 mt-4 leading-relaxed max-w-3xl">
              Reunam aqui a logica completa que os juizes esperam ver: problema real, solucao clara, comparacao de ideias, consulta a especialistas e impacto comprovado.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={onOpenProject} className="inline-flex items-center gap-2 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-xs font-bold text-yellow-200 hover:bg-yellow-500 hover:text-black transition-all">
                <Lightbulb size={14} /> Editar projeto oficial
              </button>
              <button onClick={onOpenMatrix} className="inline-flex items-center gap-2 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-xs font-bold text-purple-200 hover:bg-purple-500 hover:text-white transition-all">
                <BarChart3 size={14} /> Nova ideia na matriz
              </button>
              <button onClick={onOpenExpert} className="inline-flex items-center gap-2 rounded-2xl border border-pink-500/20 bg-pink-500/10 px-4 py-3 text-xs font-bold text-pink-200 hover:bg-pink-500 hover:text-white transition-all">
                <MessageSquare size={14} /> Novo especialista
              </button>
              <button onClick={onOpenImpact} className="inline-flex items-center gap-2 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-xs font-bold text-orange-200 hover:bg-orange-500 hover:text-white transition-all">
                <Megaphone size={14} /> Registrar impacto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Projeto oficial</p>
              <p className="text-2xl font-black text-white mt-3">{projectReadinessScore}%</p>
              <p className="text-xs text-gray-400 mt-2">{projectReadinessChecklist.filter((item) => item.ready).length}/{projectReadinessChecklist.length} blocos prontos para apresentar.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Matriz de decisao</p>
              <p className="text-2xl font-black text-white mt-3">{sortedDecisionIdeas.length}</p>
              <p className="text-xs text-gray-400 mt-2">{topDecisionIdea ? `Lider atual: ${topDecisionIdea.name}` : 'Cadastrem mais de uma alternativa real.'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Especialistas</p>
              <p className="text-2xl font-black text-white mt-3">{sortedExperts.length}</p>
              <p className="text-xs text-gray-400 mt-2">{appliedExperts.length} sugestoes ja viraram acao.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Impacto real</p>
              <p className="text-2xl font-black text-white mt-3">{totalImpactPeople}</p>
              <p className="text-xs text-gray-400 mt-2">pessoas impactadas na temporada.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid xl:grid-cols-[1.1fr,0.9fr] gap-6">
        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Projeto Oficial</p>
              <h3 className="text-xl font-black text-white mt-2">Narrativa central para os juizes</h3>
            </div>
            <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold ${projectReadinessScore >= 80 ? 'border-green-500/20 bg-green-500/10 text-green-200' : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200'}`}>
              {projectReadinessScore}% pronto
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-red-300 font-bold">Problema</p>
              <p className="text-sm text-white mt-3 leading-relaxed">{projectSummary?.problem || 'Descrevam quem sofre com o problema, onde isso acontece e por que a equipe decidiu agir.'}</p>
            </div>
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-green-300 font-bold">Solucao</p>
              <p className="text-sm text-white mt-3 leading-relaxed">{projectSummary?.solution || 'Explique como a proposta funciona, o que ela faz e por que e melhor que alternativas comuns.'}</p>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300 font-bold">Impacto</p>
              <p className="text-sm text-white mt-3 leading-relaxed">{projectImpactNarrative || 'Mostrem quem se beneficia, qual ganho real aparece e como a equipe pretende ampliar esse efeito.'}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {projectReadinessChecklist.map((item) => (
              <div key={item.label} className={`rounded-2xl border p-4 ${item.ready ? 'border-green-500/20 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  {item.ready ? <CheckCircle size={14} className="text-green-400" /> : <AlertTriangle size={14} className="text-yellow-400" />}
                  {item.label}
                </div>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">{item.helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Guia de Preenchimento</p>
              <h3 className="text-xl font-black text-white mt-2">O que uma equipe forte registra aqui</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold text-gray-200">
              Preenchimento campeao
            </span>
          </div>

          <div className="space-y-4 mt-6">
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
              <p className="text-sm font-bold text-white flex items-center gap-2"><BarChart3 size={14} className="text-purple-300" /> Matriz de decisao</p>
              <p className="text-xs text-gray-200 mt-3 leading-relaxed">Cadastrem pelo menos 3 ideias reais e comparem usando os mesmos criterios. A nota precisa mostrar por que uma ideia e mais forte, mais viavel e mais inovadora que outra.</p>
            </div>
            <div className="rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4">
              <p className="text-sm font-bold text-white flex items-center gap-2"><MessageSquare size={14} className="text-pink-300" /> Especialistas</p>
              <p className="text-xs text-gray-200 mt-3 leading-relaxed">Registrem nome, cargo, insight principal, se houve evidencia da conversa e se a sugestao mudou o projeto. Juizes gostam de ver orientacao externa que virou decisao concreta.</p>
            </div>
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
              <p className="text-sm font-bold text-white flex items-center gap-2"><Megaphone size={14} className="text-orange-300" /> Impacto</p>
              <p className="text-xs text-gray-200 mt-3 leading-relaxed">Cada registro deve mostrar acao feita, publico atingido, data, numero de pessoas e algum retorno recebido. Isso transforma compartilhamento em impacto real documentado.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Comparacao de Ideias</p>
            <h3 className="text-xl font-black text-white mt-2 flex items-center gap-2">
              <BarChart3 className="text-purple-500" /> Matriz de Decisao (Pugh Matrix)
            </h3>
          </div>
          <button onClick={onOpenMatrix} className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-2 rounded-2xl hover:bg-purple-500 hover:text-white font-bold transition-all">
            + Nova Ideia
          </button>
        </div>

        <div className="grid xl:grid-cols-[0.7fr,1.3fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Como preencher bem</p>
              <div className="space-y-3 mt-4 text-sm text-gray-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Impacto: mede o quanto a ideia realmente ajuda o problema.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Custo: avalia se a equipe consegue desenvolver e sustentar a solucao.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Facilidade: considera tempo, recursos e chance de execucao.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Inovacao: compara o quao diferente e criativa a proposta parece.</div>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-purple-300 font-bold">Leitura rapida</p>
              <p className="text-2xl font-black text-white mt-3">{matrixAverageScore}</p>
              <p className="text-xs text-gray-200 mt-2">media geral das ideias registradas.</p>
              <p className="text-sm text-white font-bold mt-4">{topDecisionIdea ? topDecisionIdea.name : 'Sem lider atual'}</p>
              <p className="text-xs text-gray-300 mt-2">{topDecisionIdea ? `Melhor pontuacao atual: ${scoreDecisionIdea(topDecisionIdea)}` : 'Adicionem ideias para comparar caminhos com criterio.'}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
            <table className="w-full text-left border-collapse">
              <thead className="text-xs text-gray-500 uppercase border-b border-white/10 bg-white/5">
                <tr>
                  <th className="p-3">Ranking</th>
                  <th className="p-3">Ideia</th>
                  <th className="p-3 text-center">Impacto (x3)</th>
                  <th className="p-3 text-center">Custo (x2)</th>
                  <th className="p-3 text-center">Facilidade (x1)</th>
                  <th className="p-3 text-center">Inovacao (x2)</th>
                  <th className="p-3 text-right text-white">Total</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {sortedDecisionIdeas.map((item, index) => {
                  const total = scoreDecisionIdea(item);

                  return (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <span className={`inline-flex items-center justify-center min-w-[28px] h-[28px] rounded-full text-xs font-black ${index === 0 ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-200'}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">
                        {item.name}
                        {item.author && <span className="block text-[10px] text-gray-500 font-normal mt-0.5 flex items-center gap-1"><UserCircle size={10} /> {item.author}</span>}
                      </td>
                      <td className="p-3 text-center text-gray-400">{item.impact}</td>
                      <td className="p-3 text-center text-gray-400">{item.cost}</td>
                      <td className="p-3 text-center text-gray-400">{item.feasibility}</td>
                      <td className="p-3 text-center text-gray-400">{item.innovation}</td>
                      <td className="p-3 text-right font-black text-purple-400 text-lg">{total}</td>
                      <td className="p-3 text-right">
                        {(isAdmin || item.author === viewAsStudent?.name) && <button onClick={() => onDeleteMatrix(item.id)} className="text-gray-600 hover:text-red-500 p-1 transition-colors"><Trash2 size={16} /></button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sortedDecisionIdeas.length === 0 && (
              <div className="text-center text-gray-500 text-sm italic py-8">
                Nenhuma ideia cadastrada ainda. Adicionem opcoes diferentes para comparar com criterio.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 h-fit shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Consulta Externa</p>
              <h3 className="text-lg font-black text-white flex items-center gap-2 mt-2"><MessageSquare className="text-pink-500" /> Especialistas</h3>
            </div>
            <button onClick={onOpenExpert} className="text-xs bg-pink-500/10 text-pink-500 border border-pink-500/20 px-3 py-1.5 rounded-lg hover:bg-pink-500 hover:text-white font-bold">+ Novo</button>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mb-5">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Consultas</p>
              <p className="text-2xl font-black text-white mt-3">{sortedExperts.length}</p>
            </div>
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-green-300 font-bold">Aplicadas</p>
              <p className="text-2xl font-black text-white mt-3">{appliedExperts.length}</p>
            </div>
            <div className="rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-pink-300 font-bold">Com evidencia</p>
              <p className="text-2xl font-black text-white mt-3">{expertsWithEvidence.length}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 mb-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">O que registrar em um bom especialista</p>
            <p className="text-xs text-gray-300 mt-3 leading-relaxed">Nome e cargo, insight principal, como isso afeta o projeto, se a sugestao foi aplicada e alguma evidencia da conversa. Quanto mais concreto o registro, mais forte a narrativa para a banca.</p>
            <p className="text-xs text-gray-400 mt-3">Taxa de aplicacao atual: {expertConversionRate}%.</p>
          </div>

          <div className="space-y-4">
            {sortedExperts.map((expert) => (
              <div key={expert.id} onClick={() => onOpenExpertView(expert)} className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col gap-3 relative group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={(event) => { event.stopPropagation(); onOpenExpertEdit(expert); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14} /></button>
                  {(isAdmin || expert.author === viewAsStudent?.name) && <button onClick={(event) => onDeleteExpert(event, expert.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14} /></button>}
                </div>
                <div className="flex justify-between items-start pr-6 gap-4">
                  <div>
                    <span className="text-white font-bold block text-sm">{expert.name}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">{expert.role} {expert.author && <><span className="mx-1">•</span> <UserCircle size={10} /> {expert.author}</>}</span>
                  </div>
                  {expert.applied ? <span className="bg-green-500/20 text-green-500 text-[9px] px-2 py-1 rounded">APLICADO</span> : <span className="bg-gray-500/20 text-gray-500 text-[9px] px-2 py-1 rounded">CONSULTA</span>}
                </div>
                <p className="text-xs text-gray-300 italic line-clamp-3">"{expert.notes}"</p>
                <div className="flex flex-wrap gap-2">
                  {expert.image && <span className="text-[10px] text-pink-400 flex items-center gap-1 rounded-full border border-pink-500/20 bg-pink-500/10 px-2 py-1"><ImageIcon size={10} /> Evidencia</span>}
                  <span className={`text-[10px] flex items-center gap-1 rounded-full border px-2 py-1 ${expert.impact === 'Alto' ? 'border-green-500/20 bg-green-500/10 text-green-300' : expert.impact === 'Médio' ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300' : 'border-white/10 bg-white/5 text-gray-300'}`}>
                    <Star size={10} /> Impacto {expert.impact}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-gray-700 mt-1">
                  <div className={`h-1 rounded-full ${expert.impact === 'Alto' ? 'bg-green-500 w-full' : expert.impact === 'Médio' ? 'bg-yellow-500 w-1/2' : 'bg-gray-500 w-1/4'}`}></div>
                </div>
              </div>
            ))}
            {sortedExperts.length === 0 && (
              <div className="text-center text-gray-500 text-sm italic py-6">
                Nenhum especialista registrado ainda. Conversem com pessoas reais e documentem o que mudou.
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 h-fit shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Compartilhamento e Resultado</p>
              <h3 className="text-lg font-black text-white flex items-center gap-2 mt-2">
                <Megaphone className="text-orange-500" /> Impacto
              </h3>
            </div>
            <button onClick={onOpenImpact} className="text-xs bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1.5 rounded-lg hover:bg-orange-500 hover:text-white font-bold">+ Registro</button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
              <p className="text-[10px] text-orange-400 uppercase font-bold">Pessoas alcancadas</p>
              <h4 className="text-3xl font-black text-white mt-3">{totalImpactPeople}</h4>
            </div>
            <div className="bg-black/30 border border-white/10 p-4 rounded-xl">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Tipo com maior alcance</p>
              <h4 className="text-lg font-black text-white mt-3">{topImpactType ? topImpactType[0] : 'Sem dados ainda'}</h4>
              <p className="text-xs text-gray-400 mt-2">{topImpactType ? `${topImpactType[1]} pessoas` : 'Registrem os primeiros compartilhamentos.'}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 mb-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">O que precisa aparecer em um bom registro</p>
            <p className="text-xs text-gray-300 mt-3 leading-relaxed">Nome da acao, publico atingido, data, quantidade de pessoas e algum retorno. Isso mostra que a equipe nao so apresentou a ideia, mas realmente gerou alcance e aprendeu com a resposta do publico.</p>
            <p className="text-xs text-gray-400 mt-3">{latestImpactEvent ? `Ultimo registro: ${latestImpactEvent.name} em ${latestImpactEvent.date.split('-').reverse().join('/')}.` : 'Sem ultimo registro ainda.'}</p>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-2">
            {sortedImpactEvents.map((event) => (
              <div key={event.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col relative group hover:bg-white/5 transition-colors">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {(isAdmin || event.author === viewAsStudent?.name) && <button onClick={() => onDeleteOutreach(event.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14} /></button>}
                </div>
                <div className="flex justify-between items-start mb-2 pr-6 gap-4">
                  <div>
                    <span className="text-white font-bold text-sm block">{event.name}</span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/10 text-gray-300">{event.type}</span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1"><Calendar size={10} /> {event.date.split('-').reverse().join('/')}</span>
                      {event.author && <span className="text-[10px] text-gray-500 flex items-center gap-1 ml-1 border-l border-white/10 pl-2"><UserCircle size={10} /> {event.author}</span>}
                    </div>
                  </div>
                  <span className="text-sm text-orange-400 font-bold">+{event.people}</span>
                </div>
                {event.feedback ? (
                  <p className="text-xs text-gray-300 italic mt-2 pt-2 border-t border-white/5">"{event.feedback}"</p>
                ) : (
                  <p className="text-xs text-gray-500 italic mt-2 pt-2 border-t border-white/5">Adicionem feedback para mostrar retorno do publico.</p>
                )}
              </div>
            ))}
            {sortedImpactEvents.length === 0 && (
              <div className="text-center text-gray-500 text-sm italic py-6">
                Nenhum registro de impacto ainda. Documentem cada apresentacao, conversa ou postagem relevante.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InnovationStrategyPanel;
