import { Suspense } from 'react';
import { Lightbulb, Wrench } from 'lucide-react';

export default function StrategyView({
  strategySubTab,
  setStrategySubTab,
  projectSummary,
  projectImpactNarrative,
  decisionMatrix,
  experts,
  outreachEvents,
  totalImpactPeople,
  isAdmin,
  viewAsStudent,
  InnovationStrategyPanel,
  RobotDesignStrategyPanel,
  LazyPanelFallback,
  openMatrixForm,
  handleDeleteMatrix,
  openExpertModal,
  openExpertView,
  handleDeleteExpert,
  openOutreachForm,
  handleDeleteOutreach,
  setModal,
  robotVersions,
  attachments,
  codeSnippets,
  rounds,
  activeCommandCode,
  iterationRecords,
  openRobotModal,
  openRobotView,
  handleDeleteRobotVersion,
  openAttachmentModal,
  openAttachmentView,
  handleDeleteAttachment,
  openCodeModal,
  openCodeView,
  handleApplyCodeSnippet,
  handleDeleteCode
}) {
      return (
      <div className="animate-in fade-in duration-300 space-y-6">
          <section className="newgears-major-panel relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(19,21,35,0.96),rgba(12,14,24,0.96))] p-4 md:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),radial-gradient(circle_at_top_left,rgba(255,217,95,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(71,214,255,0.12),transparent_28%)] bg-[size:22px_22px,22px_22px,auto,auto]" />
              <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-black">Mapa da estrategia</p>
                      <h3 className="newgears-display mt-2 text-2xl font-black text-white">Escolha a trilha que a equipe quer explorar agora.</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-300">
                          Uma trilha cuida do projeto e do impacto. A outra mostra como o robo evoluiu. As duas precisam ter mais cara de equipe criativa e menos cara de relatorio.
                      </p>
                  </div>

                  <div className="inline-flex w-full flex-col rounded-[24px] border border-white/10 bg-black/20 p-1.5 sm:w-auto sm:flex-row">
                      <button 
                          onClick={() => setStrategySubTab('innovation')}
                          className={`px-5 py-3 rounded-[18px] text-sm font-black flex items-center justify-center gap-2 transition-all ${strategySubTab === 'innovation' ? 'bg-yellow-500 text-black shadow-[0_16px_30px_rgba(234,179,8,0.26)]' : 'text-gray-300 hover:text-white hover:bg-white/8'}`}
                      >
                          <Lightbulb size={16}/> Projeto de Inovacao
                      </button>
                      <button 
                          onClick={() => setStrategySubTab('robot_design')}
                          className={`px-5 py-3 rounded-[18px] text-sm font-black flex items-center justify-center gap-2 transition-all ${strategySubTab === 'robot_design' ? 'bg-blue-600 text-white shadow-[0_16px_30px_rgba(37,99,235,0.26)]' : 'text-gray-300 hover:text-white hover:bg-white/8'}`}
                      >
                          <Wrench size={16}/> Design do Robo
                      </button>
                  </div>
              </div>
          </section>

          {strategySubTab === 'innovation' && (
              <Suspense fallback={<LazyPanelFallback label="Carregando painel de inovacao..." minHeightClass="min-h-[360px]" />}>
                <InnovationStrategyPanel
                    projectSummary={projectSummary}
                    projectImpactNarrative={projectImpactNarrative}
                    decisionMatrix={decisionMatrix}
                    experts={experts}
                    outreachEvents={outreachEvents}
                    totalImpactPeople={totalImpactPeople}
                    isAdmin={isAdmin}
                    viewAsStudent={viewAsStudent}
                    onOpenProject={() => setModal({ type: 'projectForm' })}
                    onOpenMatrix={openMatrixForm}
                    onDeleteMatrix={handleDeleteMatrix}
                    onOpenExpert={() => openExpertModal()}
                    onOpenExpertEdit={openExpertModal}
                    onOpenExpertView={openExpertView}
                    onDeleteExpert={handleDeleteExpert}
                    onOpenImpact={() => openOutreachForm()}
                    onDeleteOutreach={handleDeleteOutreach}
                />
              </Suspense>
          )}

          {strategySubTab === 'robot_design' && (
              <Suspense fallback={<LazyPanelFallback label="Carregando painel de robo..." minHeightClass="min-h-[360px]" />}>
                <RobotDesignStrategyPanel
                    robotVersions={robotVersions}
                    attachments={attachments}
                    codeSnippets={codeSnippets}
                    rounds={rounds}
                    activeCommandCode={activeCommandCode}
                    iterationRecords={iterationRecords}
                    isAdmin={isAdmin}
                    viewAsStudent={viewAsStudent}
                    onOpenRobot={() => openRobotModal()}
                    onOpenRobotEdit={openRobotModal}
                    onOpenRobotView={openRobotView}
                    onDeleteRobotVersion={handleDeleteRobotVersion}
                    onOpenAttachment={() => openAttachmentModal()}
                    onOpenAttachmentEdit={openAttachmentModal}
                    onOpenAttachmentView={openAttachmentView}
                    onDeleteAttachment={handleDeleteAttachment}
                    onOpenCode={() => openCodeModal()}
                    onOpenCodeEdit={openCodeModal}
                    onOpenCodeView={openCodeView}
                    onApplyCode={handleApplyCodeSnippet}
                    onDeleteCode={handleDeleteCode}
                />
              </Suspense>
          )}

          {/* Blocos legados removidos da navegacao principal para evitar codigo morto e mutacao acidental. */}
      </div>
  )
}
