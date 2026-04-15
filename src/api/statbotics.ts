/** Raw shape returned by Statbotics /v3/teams */
export interface SBTeam {
  team: number;
  name: string;
  country: string | null;
  state: string | null;
  district: string | null;
  rookie_year: number;
  active: boolean;
  last_active_year: number;
  record: {
    wins: number;
    losses: number;
    ties: number;
    count: number;
    winrate: number;
  };
  norm_epa: {
    current: number;
    recent: number;
    mean: number;
    max: number;
  };
}

const BASE      = 'https://api.statbotics.io/v3';
const LIMIT     = 1000;           // max Statbotics allows per page
const MAX_PAGES = 20;             // 20 × 1000 = 20 000 teams ceiling (plenty)
const CACHE_KEY = 'sb_teams_v2';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function fetchPage(page: number): Promise<SBTeam[]> {
  try {
    const res = await fetch(
      `${BASE}/teams?limit=${LIMIT}&offset=${page * LIMIT}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Fetches every FRC team from Statbotics.
 *
 * Strategy:
 *  1. Return cached data if it is < 24 h old.
 *  2. Otherwise fetch page 0 first to confirm the API is reachable.
 *  3. If the first page is full (1 000 teams) fetch all remaining pages
 *     in parallel (batches of 5) and keep going until a batch returns
 *     nothing — then stop.
 *  4. Cache the slim result set to localStorage.
 *
 * @param onProgress  Called with the running total after each batch lands.
 */
export async function fetchAllTeams(
  onProgress?: (count: number) => void
): Promise<SBTeam[]> {
  // ── 1. Cache hit ─────────────────────────────────────────────────────────
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { ts, data } = JSON.parse(raw) as { ts: number; data: SBTeam[] };
      if (Date.now() - ts < CACHE_TTL) {
        onProgress?.(data.length);
        return data as SBTeam[];
      }
    }
  } catch { /* corrupt cache — fall through */ }

  // ── 2. First page ─────────────────────────────────────────────────────────
  const first = await fetchPage(0);
  if (first.length === 0) throw new Error('Statbotics returned no teams');

  const allTeams: SBTeam[] = [...first];
  onProgress?.(allTeams.length);

  // ── 3. Remaining pages in parallel batches of 5 ──────────────────────────
  if (first.length === LIMIT) {
    const BATCH = 5;
    for (let start = 1; start < MAX_PAGES; start += BATCH) {
      const pageNums = Array.from({ length: BATCH }, (_, i) => start + i);
      const pages    = await Promise.all(pageNums.map(fetchPage));
      let   gotAny   = false;

      for (const page of pages) {
        if (page.length > 0) {
          allTeams.push(...page);
          gotAny = true;
        }
      }

      onProgress?.(allTeams.length);
      // Stop as soon as a full batch comes back empty
      if (!gotAny) break;
    }
  }

  // ── 4. Cache ──────────────────────────────────────────────────────────────
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), data: allTeams })
    );
  } catch { /* localStorage quota exceeded — skip caching */ }

  return allTeams;
}
