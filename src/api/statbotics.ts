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

// ─── Event interfaces ────────────────────────────────────────────────────────

/** Raw shape returned by Statbotics /v3/events */
export interface SBEvent {
  key: string;
  year: number;
  name: string;
  time: number;
  country: string | null;
  state: string | null;
  district: string | null;
  start_date: string;
  end_date: string;
  type: string;   // 'regional' | 'district' | 'district_cmp' | 'champs_div' | 'einstein'
  week: number | null;
  video: string | null;
  status: string; // 'Upcoming' | 'In Progress' | 'Completed'
  status_str: string;
  num_teams: number;
  qual_matches: number;
}

/** Raw shape returned by Statbotics /v3/team_events */
export interface SBTeamEvent {
  team: number;
  year: number;
  event: string;
  event_name: string;
  type: string;
  week: number | null;
  status: string;
  country: string | null;
  state: string | null;
  district: string | null;
  start_date?: string;
  end_date?: string;
}

// ─────────────────────────────────────────────────────────────────────────────

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

// ─── Event fetchers ───────────────────────────────────────────────────────────

const EVENT_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours (events change more often)

/** Fetches all events for a given year, with 6-hour localStorage cache. */
export async function fetchEventsForYear(year: number): Promise<SBEvent[]> {
  const cacheKey = `sb_events_${year}`;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const { ts, data } = JSON.parse(raw) as { ts: number; data: SBEvent[] };
      if (Date.now() - ts < EVENT_CACHE_TTL) return data;
    }
  } catch { /* corrupt — fall through */ }

  const res = await fetch(`${BASE}/events?limit=500&year=${year}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to load events for ${year}`);
  const data: SBEvent[] = await res.json();

  try {
    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
  } catch { /* quota */ }

  return data;
}

/**
 * Fetches the team numbers attending a specific event.
 * Used by EventDetail to populate the Teams tab on demand.
 */
export async function fetchTeamNumbersForEvent(eventKey: string): Promise<number[]> {
  try {
    const res = await fetch(`${BASE}/team_events?event=${eventKey}&limit=200`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data: SBTeamEvent[] = await res.json();
    return data.map(t => t.team);
  } catch {
    return [];
  }
}

/**
 * Fetches the events a team attended in a given year (defaults to current year).
 * Used by TeamDetail to list events and their matches.
 */
export async function fetchTeamEvents(
  teamNumber: number,
  year: number
): Promise<SBTeamEvent[]> {
  try {
    const res = await fetch(
      `${BASE}/team_events?team=${teamNumber}&year=${year}&limit=50`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
