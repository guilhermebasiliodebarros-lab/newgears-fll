import CompetitionHubView from './CompetitionHubView';
import useCompetitionWorkspace from '../hooks/useCompetitionWorkspace';
import { competitionSaveError } from '../services/competitionWorkspace';

export default function CompetitionWorkspaceView({ db, user, seasonId, ...props }) {
  const workspace = useCompetitionWorkspace({ db, user, seasonId });
  return <CompetitionHubView {...props} record={workspace.record} loading={workspace.loading} error={workspace.error ? { message: competitionSaveError(workspace.error) } : null} onRetry={workspace.retry} onSave={async (input) => { try { return await workspace.save(input); } catch (error) { throw Error(competitionSaveError(error)); } }} />;
}
