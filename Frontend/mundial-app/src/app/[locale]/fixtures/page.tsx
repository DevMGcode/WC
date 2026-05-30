/**
 * Fixtures page — React Server Component (RSC)
 *
 * Ventajas del patrón RSC + Client hybrid:
 *  - El HTML de los fixtures se pre-renderiza en el servidor → 0 spinner inicial
 *  - El cliente recibe `initialData` ya hidratado en TanStack Query
 *  - Si el usuario navega y vuelve, TanStack Query re-valida silenciosamente
 *  - getAllFixtures() usa URL absoluta → funciona tanto en server como client
 */

import { getAllFixtures } from '@/services/publicTournament';
import FixturesClient from './FixturesClient';

export default async function FixturesPage() {
  // Fetch server-side — se ejecuta en el servidor antes de enviar HTML
  const initialFixtures = await getAllFixtures().catch(() => []);
  return <FixturesClient initialFixtures={initialFixtures} />;
}
