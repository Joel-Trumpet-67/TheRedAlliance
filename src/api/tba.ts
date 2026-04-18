import type { Match, Ranking } from '../data/mockData';

const BASE = 'https://www.thebluealliance.com/api/v3';
const KEY  = import.meta.env.VITE_TBA_API_KEY as string;

function h() {
  return { Accept: 'application/json', 'X-TBA-Auth-Key': KEY };
}

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface TBAAlliance {
  score:               number;
  team_keys:           string[];
  surrogate_team_keys: string[];
  dq_team_keys:        string[];
}

export interface TBAMatch {
  key:              string;
  comp_level:       string;   // 'qm' | 'ef' | 'qf' | 'sf' | 'f'
  set_number:       number;
  match_number:     number;
  alliances: {
    red:  TBAAlliance;
    blue: TBAAlliance;
  };
  winning_alliance:  string | null;   // '' | 'red' | 'blue'
  event_key:        string;
  time:             number | null;
  actual_time:      number | null;
  predicted_time:   number | null;
  post_result_time: number | null;
  score_breakdown:  Record<string, Record<string, unknown>> | null;
  videos:           Array<{ key: string; type: string }>;
}

export interface TBARankings {
  rankings: Array<{
    rank:        number;
    team_key:    string;
    record:      { wins: number; losses: number; ties: number };
    extra_stats: number[];
    sort_orders: number[];
  }>;
  sort_order_info: Array<{ name: string; precision: number }>;
  extra_stats_info: Array<{ name: string; precision: number }>;
}

export interface TBATeamSimple {
  key:         string;
  team_number: number;
  nickname:    string;
  city:        string | null;
  state_prov:  string | null;
  country:     string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function tbaTeamNum(key: string): number {
  return parseInt(key.replace('frc', ''), 10);
}

function matchSortKey(m: TBAMatch): [number, number, number] {
  const lvl = ['qm', 'ef', 'qf', 'sf', 'f'];
  return [lvl.indexOf(m.comp_level), m.set_number, m.match_number];
}

export function adaptTBAMatch(m: TBAMatch): Match {
  const played   = m.post_result_time != null;
  const scoreTime = m.actual_time ?? m.predicted_time ?? m.time;
  return {
    key:              m.key,
    comp_level:       (m.comp_level === 'ef' ? 'qf' : m.comp_level) as 'qm' | 'qf' | 'sf' | 'f',
    match_number:     m.match_number,
    set_number:       m.set_number,
    red_alliance:     m.alliances.red.team_keys.map(tbaTeamNum),
    blue_alliance:    m.alliances.blue.team_keys.map(tbaTeamNum),
    red_score:        played ? m.alliances.red.score  : null,
    blue_score:       played ? m.alliances.blue.score : null,
    winning_alliance: played ? ((m.winning_alliance || null) as 'red' | 'blue' | 'tie' | null) : null,
    time: scoreTime
      ? new Date(scoreTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
  };
}

/**
 * Extracts auto / teleop / endgame / foul point totals from a TBA score_breakdown
 * alliance half-object. Field names are game-specific; we probe the most common ones.
 */
export function parseTBAAllianceBreakdown(b: Record<string, unknown> | undefined) {
  if (!b) return null;
  const n = (k: string) => (typeof b[k] === 'number' ? (b[k] as number) : null);
  const auto     = n('autoPoints')    ?? n('autoTotalPoints')    ?? n('auto_points')    ?? 0;
  const teleop   = n('teleopPoints')  ?? n('teleopTotalPoints')  ?? n('teleop_points')  ?? 0;
  const endgame  = n('endGamePoints') ?? n('endGameTotalPoints') ?? n('endgame_points') ?? n('endGameParkPoints') ?? 0;
  const foul     = n('foulPoints')    ?? n('foul_points')        ?? 0;
  return { auto, teleop, endgame, foul };
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

export async function fetchTBAEventMatches(eventKey: string): Promise<TBAMatch[]> {
  try {
    const res = await fetch(`${BASE}/event/${eventKey}/matches`, { headers: h() });
    if (!res.ok) return [];
    const data: TBAMatch[] = await res.json();
    return data.sort((a, b) => {
      const [la, sa, ma] = matchSortKey(a);
      const [lb, sb, mb] = matchSortKey(b);
      return la !== lb ? la - lb : sa !== sb ? sa - sb : ma - mb;
    });
  } catch { return []; }
}

export async function fetchTBAEventRankings(eventKey: string): Promise<Ranking[]> {
  try {
    const res = await fetch(`${BASE}/event/${eventKey}/rankings`, { headers: h() });
    if (!res.ok) return [];
    const data: TBARankings = await res.json();
    if (!data?.rankings?.length) return [];
    return data.rankings.map(r => ({
      team_number: tbaTeamNum(r.team_key),
      rank:        r.rank,
      wins:        r.record.wins,
      losses:      r.record.losses,
      ties:        r.record.ties,
      rp:          +(r.sort_orders[0] ?? 0).toFixed(2),
      avg_score:   Math.round(r.sort_orders[1] ?? 0),
    }));
  } catch { return []; }
}

export async function fetchTBAEventTeams(eventKey: string): Promise<number[]> {
  try {
    const res = await fetch(`${BASE}/event/${eventKey}/teams/simple`, { headers: h() });
    if (!res.ok) return [];
    const data: TBATeamSimple[] = await res.json();
    return data.map(t => t.team_number).sort((a, b) => a - b);
  } catch { return []; }
}

export async function fetchTBATeamMatches(teamNumber: number, year: number): Promise<TBAMatch[]> {
  try {
    const res = await fetch(`${BASE}/team/frc${teamNumber}/matches/${year}`, { headers: h() });
    if (!res.ok) return [];
    const data: TBAMatch[] = await res.json();
    return data.sort((a, b) => {
      if (a.event_key !== b.event_key) return a.event_key.localeCompare(b.event_key);
      const [la, sa, ma] = matchSortKey(a);
      const [lb, sb, mb] = matchSortKey(b);
      return la !== lb ? la - lb : sa !== sb ? sa - sb : ma - mb;
    });
  } catch { return []; }
}

export interface TBADistrictRanking {
  team_key: string;
  rank: number;
  point_total: number;
  rookie_bonus: number;
  event_points: Array<{
    event_key: string;
    district_cmp: boolean;
    total: number;
    alliance_points: number;
    award_points: number;
    qual_points: number;
    elim_points: number;
  }>;
}

export async function fetchDistrictRankings(districtKey: string): Promise<TBADistrictRanking[]> {
  try {
    const res = await fetch(`${BASE}/district/${districtKey}/rankings`, { headers: h() });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}
