export interface FixtureAdmin {
  id: number; name: string; status: string;
  homeTeam: { id?: number; name: string; shortName?: string; flagUrl?: string };
  awayTeam: { id?: number; name: string; shortName?: string; flagUrl?: string };
  homeScore: number | null; awayScore: number | null; kickoffAt: string;
  stageName?: string; groupCode?: string;
  externalProviderId?: number | null;
}

export interface ApiFootballStatus {
  account:      { firstname: string; lastname: string; email: string } | null;
  subscription: { plan: string; end: string; active: boolean } | null;
  requests:     { current: number; limit_day: number } | null;
}

export interface SyncResult { created: number; updated: number; errors: string[] }

export interface TeamItem   { id: number; name: string; shortName: string; flagUrl?: string; }
export interface StageItem  { id: number; code: string; name: string; sortOrder: number; }
export interface GroupItem  { id: number; code: string; name: string; }
