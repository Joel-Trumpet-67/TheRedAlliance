export interface Team {
  number: number;
  name: string;
  city: string;
  state: string;
  country: string;
  rookie_year: number;
  motto: string;
  wins: number;
  losses: number;
  ties: number;
  awards: number;
  ranking?: number;
  /** Normalised EPA from Statbotics (higher = stronger team) */
  epa?: number;
}

export interface Match {
  key: string;
  comp_level: 'qm' | 'qf' | 'sf' | 'f';
  match_number: number;
  set_number: number;
  red_alliance: number[];
  blue_alliance: number[];
  red_score: number | null;
  blue_score: number | null;
  winning_alliance: 'red' | 'blue' | 'tie' | null;
  time: string;
}

export interface Event {
  key: string;
  name: string;
  short_name: string;
  city: string;
  state: string;
  country: string;
  start_date: string;
  end_date: string;
  event_type: string;
  week: number | null;
  year: number;
  teams: number[];
  /** Total team count from API (teams array may be empty until lazy-loaded) */
  num_teams?: number;
  /** Event status from API: 'Upcoming' | 'In Progress' | 'Completed' */
  status?: string;
  /** Livestream URL */
  video?: string;
  /** District abbreviation e.g. 'fim', 'fit', 'fma', 'ne', 'in', 'ont' */
  district?: string | null;
}

export interface Ranking {
  team_number: number;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  rp: number;
  avg_score: number;
}

// Teams are loaded at runtime from Statbotics via TeamsContext.
// This empty array is kept so existing imports don't break during the transition.
export const teams: Team[] = [];

// Events are loaded at runtime from Statbotics via EventsContext.
// This empty array is kept so existing imports don't break.
export const events: Event[] = [];

export function getMatchesForEvent(eventKey: string): Match[] {
  const eventTeams = events.find(e => e.key === eventKey)?.teams ?? [];
  if (eventTeams.length < 6) return [];

  const matches: Match[] = [];

  // Generate qualification matches
  for (let i = 1; i <= 12; i++) {
    const shuffle = [...eventTeams].sort(() => Math.random() - 0.5);
    const redScore = Math.floor(Math.random() * 80) + 30;
    const blueScore = Math.floor(Math.random() * 80) + 30;
    matches.push({
      key: `${eventKey}_qm${i}`,
      comp_level: 'qm',
      match_number: i,
      set_number: 1,
      red_alliance: shuffle.slice(0, 3),
      blue_alliance: shuffle.slice(3, 6),
      red_score: redScore,
      blue_score: blueScore,
      winning_alliance: redScore > blueScore ? 'red' : blueScore > redScore ? 'blue' : 'tie',
      time: `Q${i}`,
    });
  }

  // Quarterfinals
  for (let s = 1; s <= 4; s++) {
    for (let m = 1; m <= 2; m++) {
      const shuffle = [...eventTeams].sort(() => Math.random() - 0.5);
      const redScore = Math.floor(Math.random() * 80) + 40;
      const blueScore = Math.floor(Math.random() * 80) + 40;
      matches.push({
        key: `${eventKey}_qf${s}m${m}`,
        comp_level: 'qf',
        match_number: m,
        set_number: s,
        red_alliance: shuffle.slice(0, 3),
        blue_alliance: shuffle.slice(3, 6),
        red_score: redScore,
        blue_score: blueScore,
        winning_alliance: redScore > blueScore ? 'red' : blueScore > redScore ? 'blue' : 'tie',
        time: `QF${s}M${m}`,
      });
    }
  }

  // Semifinals
  for (let s = 1; s <= 2; s++) {
    for (let m = 1; m <= 2; m++) {
      const shuffle = [...eventTeams].sort(() => Math.random() - 0.5);
      const redScore = Math.floor(Math.random() * 80) + 50;
      const blueScore = Math.floor(Math.random() * 80) + 50;
      matches.push({
        key: `${eventKey}_sf${s}m${m}`,
        comp_level: 'sf',
        match_number: m,
        set_number: s,
        red_alliance: shuffle.slice(0, 3),
        blue_alliance: shuffle.slice(3, 6),
        red_score: redScore,
        blue_score: blueScore,
        winning_alliance: redScore > blueScore ? 'red' : blueScore > redScore ? 'blue' : 'tie',
        time: `SF${s}M${m}`,
      });
    }
  }

  // Finals
  for (let m = 1; m <= 3; m++) {
    const shuffle = [...eventTeams].sort(() => Math.random() - 0.5);
    const redScore = Math.floor(Math.random() * 60) + 60;
    const blueScore = Math.floor(Math.random() * 60) + 60;
    matches.push({
      key: `${eventKey}_f1m${m}`,
      comp_level: 'f',
      match_number: m,
      set_number: 1,
      red_alliance: shuffle.slice(0, 3),
      blue_alliance: shuffle.slice(3, 6),
      red_score: redScore,
      blue_score: blueScore,
      winning_alliance: redScore > blueScore ? 'red' : blueScore > redScore ? 'blue' : 'tie',
      time: `F1M${m}`,
    });
  }

  return matches;
}

export function getRankingsForEvent(eventKey: string): Ranking[] {
  const eventTeams = events.find(e => e.key === eventKey)?.teams ?? [];
  return eventTeams
    .map((teamNum, i) => ({
      team_number: teamNum,
      rank: i + 1,
      wins: Math.floor(Math.random() * 8) + 3,
      losses: Math.floor(Math.random() * 5),
      ties: Math.random() > 0.8 ? 1 : 0,
      rp: parseFloat((Math.random() * 1.5 + 0.5).toFixed(2)),
      avg_score: Math.floor(Math.random() * 40) + 45,
    }))
    .sort((a, b) => b.rp - a.rp)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

export function getTeamEvents(teamNumber: number): Event[] {
  return events.filter(e => e.teams.includes(teamNumber));
}

export const compLevelLabel: Record<string, string> = {
  qm: 'Quals',
  qf: 'Quarters',
  sf: 'Semis',
  f: 'Finals',
};
