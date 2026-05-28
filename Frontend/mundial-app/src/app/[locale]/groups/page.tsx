/**
 * Groups page — React Server Component (RSC)
 *
 * El servidor obtiene torneo + grupos + fixtures antes de enviar HTML.
 * El cliente hidrata los hooks de TanStack Query con initialData → 0 spinner.
 */

import { getCurrentTournament, getTournamentGroups, getTournamentFixtures } from '@/services/publicTournament';
import GroupsClient from './GroupsClient';

export default async function GroupsPage() {
  // Fetch paralelo en el servidor
  const tournament = await getCurrentTournament().catch(() => null);
  const [groups, fixtures] = tournament
    ? await Promise.all([
        getTournamentGroups(tournament.id).catch(() => []),
        getTournamentFixtures(tournament.id).catch(() => []),
      ])
    : [[], []];

  return (
    <GroupsClient
      initialTournament={tournament}
      initialGroups={groups}
      initialFixtures={fixtures}
    />
  );
}
