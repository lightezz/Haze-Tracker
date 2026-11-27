import { createScenarioSnapshot } from '../data/mockPsiData';
import type { ScenarioId, SingaporePsiSnapshot } from '../types/psi';

/**
 * Front-end PSI data service.
 *
 * Currently serves deterministic Singapore regional preview snapshots.
 * When you are ready to connect the live NEA / data.gov.sg API:
 *   1. Fetch from `https://api-open.data.gov.sg/v2/real-time/api/psi`
 *      and optionally `https://api-open.data.gov.sg/v2/real-time/api/pm25`.
 *   2. Map `data.items[0].readings` into `SingaporePsiSnapshot.regions`.
 *   3. Set `sourceMode: 'live_api'`.
 */
export const DATA_GOV_SG_PSI_ENDPOINT =
  'https://api-open.data.gov.sg/v2/real-time/api/psi';

export const DATA_GOV_SG_PM25_ENDPOINT =
  'https://api-open.data.gov.sg/v2/real-time/api/pm25';

export async function fetchSingaporePsi(
  scenarioId: ScenarioId = 'baseline',
): Promise<SingaporePsiSnapshot> {
  // Subtle micro-delay so refresh states feel responsive and realistic
  await new Promise((resolve) => setTimeout(resolve, 140));
  return createScenarioSnapshot(scenarioId);
}
