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

// ─── Match interfaces ─────────────────────────────────────────────────────────

export interface SBMatchAlliance {
  team_keys:           number[];
  surrogate_team_keys: number[];
  dq_team_keys:        number[];
}

export interface SBMatchResult {
  winner:               string | null;
  red_score:            number;
  blue_score:           number;
  red_no_foul:          number;
  blue_no_foul:         number;
  red_auto_points:      number;
  blue_auto_points:     number;
  red_teleop_points:    number;
  blue_teleop_points:   number;
  red_endgame_points:   number;
  blue_endgame_points:  number;
  red_rp_1:             boolean;
  blue_rp_1:            boolean;
  red_rp_2:             boolean;
  blue_rp_2:            boolean;
  red_rp_3?:            boolean;
  blue_rp_3?:           boolean;
}

export interface SBMatchPred {
  winner:        string | null;
  red_win_prob:  number;
  red_score:     number;
  blue_score:    number;
  red_rp_1:      number;
  blue_rp_1:     number;
  red_rp_2:      number;
  blue_rp_2:     number;
}

export interface SBMatch {
  key:            string;
  year:           number;
  event:          string;
  elim:           boolean;
  comp_level:     string;
  set_number:     number;
  match_number:   number;
  match_name:     string;
  time:           number | null;
  predicted_time: number | null;
  status:         string;   // 'Upcoming' | 'In Progress' | 'Completed'
  video:          string | null;
  alliances: {
    red:  SBMatchAlliance;
    blue: SBMatchAlliance;
  };
  pred:   SBMatchPred   | null;
  result: SBMatchResult | null;
}

/** Converts a Statbotics match into the app's Match shape. */
export function adaptMatch(sb: SBMatch): import('../data/mockData').Match {
  const r      = sb.result;
  const played = sb.status !== 'Upcoming' && r != null;
  return {
    key:              sb.key,
    comp_level:       (sb.comp_level ?? 'qm') as 'qm' | 'qf' | 'sf' | 'f',
    match_number:     sb.match_number ?? 0,
    set_number:       sb.set_number   ?? 1,
    red_alliance:     sb.alliances?.red?.team_keys  ?? [],
    blue_alliance:    sb.alliances?.blue?.team_keys ?? [],
    red_score:        played ? r!.red_score  : null,
    blue_score:       played ? r!.blue_score : null,
    winning_alliance: played ? (r!.winner || null) as 'red' | 'blue' | 'tie' | null : null,
    time:             sb.time ? new Date(sb.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
  };
}

/** Fetches all matches for an event. No cache — intended for live/frequent use. */
export async function fetchEventMatches(eventKey: string): Promise<SBMatch[]> {
  try {
    const res = await fetch(`${BASE}/matches?event=${eventKey}&limit=500`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Fetches a single match with full breakdown. */
export async function fetchMatch(matchKey: string): Promise<SBMatch | null> {
  try {
    const res = await fetch(`${BASE}/match/${matchKey}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
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
