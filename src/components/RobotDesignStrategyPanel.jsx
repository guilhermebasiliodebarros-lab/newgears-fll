import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Code,
  GitCommit,
  Image as ImageIcon,
  Laptop,
  Pencil,
  Star,
  Trash2,
  UserCircle,
  Wrench,
} from 'lucide-react';

const RobotDesignStrategyPanel = ({
  robotVersions,
  attachments,
  codeSnippets,
  rounds,
  isAdmin,
  viewAsStudent,
  onOpenRobot,
  onOpenRobotView,
  onDeleteRobotVersion,
  onOpenAttachment,
  onOpenAttachmentView,
  onDeleteAttachment,
  onOpenCode,
  onOpenCodeView,
  onApplyCode,
  onDeleteCode,
}) => {
  const sortedRobotVersions = [...robotVersions].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  const sortedAttachments = [...attachments].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  const sortedCodes = [...codeSnippets].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  const activeCode = sortedCodes.find((code) => code.applied) || null;
  const robotPhotoCount = sortedRobotVersions.filter((version) => version.image).length;
  const attachmentPhotoCount = sortedAttachments.filter((attachment) => attachment.image).length;
  const codeWithPrintCount = sortedCodes.filter((code) => code.image).length;
  const linkedRoundAttachments = sortedAttachments.filter((attachment) => attachment.roundId).length;
  const latestRobotVersion = sortedRobotVersions[0] || null;
  const latestAttachment = sortedAttachments[0] || null;
  const latestCode = sortedCodes[0] || null;
  const iterationReadinessChecklist = [
    { label: 'Versoes do robo documentadas', ready: sortedRobotVersions.length >= 3, helper: 'Registrem a evolucao do robo em varias etapas, nao so no modelo final.' },
    { label: 'Garras ou anexos registrados', ready: sortedAttachments.length >= 2, helper: 'Mostrem como os mecanismos foram criados para resolver funcoes especificas.' },
    { label: 'Codigo oficial definido', ready: Boolean(activeCode), helper: 'Escolham uma programacao principal para a equipe testar com consistencia.' },
    { label: 'Evidencia visual suficiente', ready: robotPhotoCount + attachmentPhotoCount + codeWithPrintCount >= 3, helper: 'Fotos e prints ajudam os juizes a enxergar o processo tecnico.' },
    { label: 'Justificativa tecnica escrita', ready: sortedRobotVersions.some((version) => `${version.changes || ''}`.trim()) && sortedCodes.some((code) => `${code.description || ''}`.trim()), helper: 'Expliquem o que mudou, por que mudou e como isso ajudou a equipe.' },
  ];
  const iterationReadinessScore = Math.round((iterationReadinessChecklist.filter((item) => item.ready).length / iterationReadinessChecklist.length) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#121c2d] via-[#151520] to-[#0b1218] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.32)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.1),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_32%)] pointer-events-none"></div>
        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-200">
              <Wrench size={12} /> Robot Design Command
            </span>
            <h3 className="text-3xl font-black text-white mt-4 leading-tight">
              Arquitetura tecnica do robo para a equipe competir com consistencia.
            </h3>
            <p className="text-sm text-gray-300 mt-4 leading-relaxed max-w-3xl">
              Esta area deve mostrar como o robo evoluiu, quais mecanismos foram criados, qual codigo ficou oficial e por que cada decisao tecnica ajudou nas missoes.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={onOpenRobot} className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs font-bold text-blue-200 hover:bg-blue-500 hover:text-white transition-all">
                <GitCommit size={14} /> Nova versao
              </button>
              <button onClick={onOpenAttachment} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs font-bold text-cyan-200 hover:bg-cyan-500 hover:text-white transition-all">
                <Wrench size={14} /> Nova garra
              </button>
              <button onClick={onOpenCode} className="inline-flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-xs font-bold text-green-200 hover:bg-green-500 hover:text-white transition-all">
                <Code size={14} /> Novo codigo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Prontidao tecnica</p>
              <p className="text-2xl font-black text-white mt-3">{iterationReadinessScore}%</p>
              <p className="text-xs text-gray-400 mt-2">{iterationReadinessChecklist.filter((item) => item.ready).length}/{iterationReadinessChecklist.length} pilares fortes.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Versoes do robo</p>
              <p className="text-2xl font-black text-white mt-3">{sortedRobotVersions.length}</p>
              <p className="text-xs text-gray-400 mt-2">{latestRobotVersion ? `Ultima: ${latestRobotVersion.version}` : 'Documentem o primeiro ciclo de iteracao.'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Garras e anexos</p>
              <p className="text-2xl font-black text-white mt-3">{sortedAttachments.length}</p>
              <p className="text-xs text-gray-400 mt-2">{linkedRoundAttachments} vinculados a rounds ou saidas.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Codigo oficial</p>
              <p className="text-2xl font-black text-white mt-3">{activeCode ? 'Definido' : 'Pendente'}</p>
              <p className="text-xs text-gray-400 mt-2">{activeCode ? activeCode.title : 'Escolham uma base oficial para treinar.'}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid xl:grid-cols-[1.1fr,0.9fr] gap-6">
        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Leitura tecnica</p>
              <h3 className="text-xl font-black text-white mt-2">O que o painel mostra para os juizes</h3>
            </div>
            <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold ${iterationReadinessScore >= 80 ? 'border-green-500/20 bg-green-500/10 text-green-200' : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200'}`}>
              {iterationReadinessScore}% pronto
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300 font-bold">Iteracao do robo</p>
              <p className="text-sm text-white mt-3 leading-relaxed">{latestRobotVersion ? `${latestRobotVersion.name}: ${latestRobotVersion.changes || 'Descrevam claramente o que mudou nesta versao.'}` : 'Registrem o objetivo de cada versao, o que foi alterado e o resultado do teste.'}</p>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300 font-bold">Mecanismos</p>
              <p className="text-sm text-white mt-3 leading-relaxed">{latestAttachment ? `${latestAttachment.name}: ${latestAttachment.changes || 'Explique a funcao tecnica desta garra ou acessorio.'}` : 'Documentem cada garra com a missao atendida, funcao e motivo da escolha.'}</p>
            </div>
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-green-300 font-bold">Programacao</p>
              <p className="text-sm text-white mt-3 leading-relaxed">{activeCode ? `${activeCode.title}: ${activeCode.description || 'Descrevam a logica principal da programacao ativa.'}` : 'Definam uma programacao ativa e expliquem como ela controla o robo em campo.'}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {iterationReadinessChecklist.map((item) => (
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
              <h3 className="text-xl font-black text-white mt-2">O que uma equipe forte registra no robo</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold text-gray-200">
              Registro campeao
            </span>
          </div>

          <div className="space-y-4 mt-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-sm font-bold text-white flex items-center gap-2"><GitCommit size={14} className="text-blue-300" /> Diario do robo</p>
              <p className="text-xs text-gray-200 mt-3 leading-relaxed">Cada versao precisa dizer o objetivo da mudanca, o que foi alterado, qual teste foi feito e o que a equipe aprendeu. Foto e comparacao antes/depois deixam a explicacao muito mais forte.</p>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <p className="text-sm font-bold text-white flex items-center gap-2"><Wrench size={14} className="text-cyan-300" /> Diario de garras</p>
              <p className="text-xs text-gray-200 mt-3 leading-relaxed">Registrem para qual missao a garra foi criada, por que aquele formato funciona, como ela foi montada e se houve iteracao mecanica. Vincular ao round ajuda muito na leitura tecnica.</p>
            </div>
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-sm font-bold text-white flex items-center gap-2"><Code size={14} className="text-green-300" /> Cofre de codigos</p>
              <p className="text-xs text-gray-200 mt-3 leading-relaxed">Guardem titulo, descricao da logica, print dos blocos ou do codigo e definam qual versao esta ativa. Os juizes valorizam muito explicacao tecnica clara, nao so resultado final.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 h-fit shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Iteracoes</p>
              <h3 className="text-lg font-black text-white flex items-center gap-2 mt-2"><GitCommit className="text-blue-500" /> Diario do Robo</h3>
            </div>
            <button onClick={onOpenRobot} className="text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white font-bold">+ Versao</button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Versoes</p>
              <p className="text-2xl font-black text-white mt-3">{sortedRobotVersions.length}</p>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300 font-bold">Com foto</p>
              <p className="text-2xl font-black text-white mt-3">{robotPhotoCount}</p>
            </div>
          </div>

          <div className="relative pl-4 border-l border-white/10 space-y-8">
            {sortedRobotVersions.map((version) => (
              <div key={version.id} onClick={() => onOpenRobotView(version)} className="relative group cursor-pointer">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#151520]"></div>
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl relative hover:bg-white/5 transition-colors">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={(event) => { event.stopPropagation(); onOpenRobot(version); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14} /></button>
                    {(isAdmin || version.author === viewAsStudent?.name) && <button onClick={(event) => onDeleteRobotVersion(event, version.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14} /></button>}
                  </div>
                  <div className="flex justify-between mb-2 gap-3">
                    <span className="text-blue-400 font-mono font-bold text-xs">{version.version}</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">{version.date?.split('-').reverse().slice(0, 2).join('/')} {version.author && <><span className="mx-1">•</span> <UserCircle size={10} /> {version.author}</>}</span>
                  </div>
                  <h4 className="text-white font-bold mb-1 text-sm">{version.name}</h4>
                  <p className="text-xs text-gray-400 line-clamp-3">{version.changes}</p>
                  {version.image && <div className="text-[10px] text-blue-400 flex items-center gap-1 mt-2"><ImageIcon size={10} /> Tem foto</div>}
                </div>
              </div>
            ))}
            {sortedRobotVersions.length === 0 && <p className="text-xs text-gray-500 italic mt-2">Nenhuma versao documentada ainda.</p>}
          </div>
        </div>

        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 h-fit shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Mecanismos</p>
              <h3 className="text-lg font-black text-white flex items-center gap-2 mt-2"><Wrench className="text-cyan-500" /> Diario de Garras</h3>
            </div>
            <button onClick={onOpenAttachment} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg hover:bg-cyan-500 hover:text-white font-bold">+ Garra</button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Anexos</p>
              <p className="text-2xl font-black text-white mt-3">{sortedAttachments.length}</p>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300 font-bold">Ligados a rounds</p>
              <p className="text-2xl font-black text-white mt-3">{linkedRoundAttachments}</p>
            </div>
          </div>

          <div className="relative pl-4 border-l border-white/10 space-y-8">
            {sortedAttachments.map((attachment) => (
              <div key={attachment.id} onClick={() => onOpenAttachmentView(attachment)} className="relative group cursor-pointer">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-cyan-500 border-2 border-[#151520]"></div>
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl relative hover:bg-white/5 transition-colors">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={(event) => { event.stopPropagation(); onOpenAttachment(attachment); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14} /></button>
                    {(isAdmin || attachment.author === viewAsStudent?.name) && <button onClick={(event) => onDeleteAttachment(event, attachment.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14} /></button>}
                  </div>
                  <div className="flex justify-between mb-2 gap-3">
                    <span className="text-cyan-400 font-mono font-bold text-xs">{rounds.find((round) => round.id === attachment.roundId)?.name || 'Geral'}</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">{attachment.date?.split('-').reverse().slice(0, 2).join('/')} {attachment.author && <><span className="mx-1">•</span> <UserCircle size={10} /> {attachment.author}</>}</span>
                  </div>
                  <h4 className="text-white font-bold mb-1 text-sm">{attachment.name}</h4>
                  <p className="text-xs text-gray-400 line-clamp-3">{attachment.changes}</p>
                  {attachment.image && <div className="text-[10px] text-cyan-400 flex items-center gap-1 mt-2"><ImageIcon size={10} /> Tem foto</div>}
                </div>
              </div>
            ))}
            {sortedAttachments.length === 0 && <p className="text-xs text-gray-500 italic mt-2">Nenhuma garra documentada ainda.</p>}
          </div>
        </div>

        <div className="bg-[#151520] border border-white/10 rounded-[28px] p-6 h-fit shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Programacao</p>
              <h3 className="text-lg font-black text-white flex items-center gap-2 mt-2"><Code className="text-green-500" /> Cofre de Codigos</h3>
            </div>
            <button onClick={onOpenCode} className="text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500 hover:text-white font-bold">+ Codigo</button>
          </div>

          <div className={`mb-4 rounded-2xl border p-4 ${activeCode ? 'bg-green-500/10 border-green-500/20' : 'bg-black/30 border-white/10'}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${activeCode ? 'text-green-400' : 'text-gray-500'}`}>Programacao ativa</p>
                <p className="text-sm font-bold text-white mt-1">{activeCode ? activeCode.title : 'Nenhuma programacao definida ainda'}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${activeCode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                {activeCode ? 'Pronta para teste' : 'Escolha um codigo'}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Codigos</p>
              <p className="text-2xl font-black text-white mt-3">{sortedCodes.length}</p>
            </div>
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-green-300 font-bold">Com print</p>
              <p className="text-2xl font-black text-white mt-3">{codeWithPrintCount}</p>
            </div>
          </div>

          <div className="relative pl-4 border-l border-white/10 space-y-8">
            {sortedCodes.map((code) => (
              <div key={code.id} onClick={() => onOpenCodeView(code)} className="relative group cursor-pointer">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#151520]"></div>
                <div className={`border p-4 rounded-xl relative transition-colors ${code.applied ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-100 z-10">
                    <button onClick={(event) => { event.stopPropagation(); onOpenCode(code); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14} /></button>
                    {isAdmin && !code.applied && <button onClick={(event) => { event.stopPropagation(); onApplyCode(code); }} className="text-green-400 hover:text-white p-1.5 bg-green-500/20 rounded-lg backdrop-blur-sm" title="Aplicar nova programacao"><Laptop size={14} /></button>}
                    {(isAdmin || code.author === viewAsStudent?.name) && <button onClick={(event) => onDeleteCode(event, code.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14} /></button>}
                  </div>
                  <div className="flex justify-between mb-2 gap-3">
                    <span className="text-green-400 font-mono font-bold text-xs">{code.date?.split('-').reverse().slice(0, 2).join('/')}</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">{code.author && <><UserCircle size={10} /> {code.author}</>}</span>
                  </div>
                  <h4 className="text-white font-bold mb-1 text-sm">{code.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-3">{code.description}</p>
                  {code.applied && <div className="text-[10px] text-green-400 flex items-center gap-1 mt-2 font-bold"><CheckCircle size={10} /> Programacao ativa</div>}
                  {code.image && <div className="text-[10px] text-green-400 flex items-center gap-1 mt-2"><ImageIcon size={10} /> Ver print</div>}
                </div>
              </div>
            ))}
            {sortedCodes.length === 0 && <p className="text-xs text-gray-500 italic mt-2">Nenhum codigo documentado.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotDesignStrategyPanel;
