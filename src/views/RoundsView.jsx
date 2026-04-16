import { Suspense } from 'react';

export default function RoundsView({
  rounds,
  missionsList,
  attachments,
  activeCommandCode,
  scoreHistory,
  robotSubTab,
  setRobotSubTab,
  activeTimer,
  timerDisplay,
  roundFormValues,
  FULL_ROUND_TIME_KEY,
  FULL_ROUND_SCORE_KEY,
  FULL_ROUND_TIMER_ID,
  setRoundFormValues,
  toggleTimer,
  openNewRoundModal,
  openEditRoundModal,
  openMissionForm,
  openPitStopModal,
  handleSavePracticeScore,
  handleDeleteRound,
  handleSaveFullRoundRun,
  handleSaveRoundRun,
  ScoreEvolutionChart,
  RobotRoundsPanel,
  LazyPanelFallback,
  readonly = false
}) {
  return (
      <Suspense fallback={<LazyPanelFallback label="Carregando central de rounds..." minHeightClass="min-h-[420px]" />}>
        <RobotRoundsPanel
            rounds={rounds}
            missionsList={missionsList}
            attachments={attachments}
            activeCommandCode={activeCommandCode}
            scoreHistory={scoreHistory}
            robotSubTab={robotSubTab}
            onChangeRobotSubTab={setRobotSubTab}
            activeTimer={activeTimer}
            timerDisplay={timerDisplay}
            roundFormValues={roundFormValues}
            fullRoundTimeValue={roundFormValues[FULL_ROUND_TIME_KEY] ?? ''}
            fullRoundScoreValue={roundFormValues[FULL_ROUND_SCORE_KEY] ?? ''}
            fullRoundTimerActive={activeTimer?.roundId === FULL_ROUND_TIMER_ID}
            onRoundFormValueChange={(roundId, value) => setRoundFormValues(prev => ({ ...prev, [roundId]: value }))}
            onFullRoundFieldChange={(field, value) => setRoundFormValues(prev => ({ ...prev, [field]: value }))}
            onToggleTimer={toggleTimer}
            onToggleFullRoundTimer={() => toggleTimer({ id: FULL_ROUND_TIMER_ID, name: 'Round completo' })}
            onOpenNewRound={openNewRoundModal}
            onOpenRoundEdit={openEditRoundModal}
            onOpenMissionForm={() => openMissionForm()}
            onOpenPitStop={openPitStopModal}
            onSavePracticeScore={handleSavePracticeScore}
            onDeleteRound={handleDeleteRound}
            onSaveFullRoundRun={handleSaveFullRoundRun}
            onSaveRoundRun={handleSaveRoundRun}
            scoreChart={<ScoreEvolutionChart />}
            readonly={readonly}
        />
      </Suspense>
  );
}
