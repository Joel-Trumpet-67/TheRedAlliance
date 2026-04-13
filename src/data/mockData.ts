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

export const teams: Team[] = [
  { number: 254, name: "The Cheesy Poofs", city: "San Jose", state: "CA", country: "USA", rookie_year: 1999, motto: "Robots don't quit", wins: 412, losses: 87, ties: 3, awards: 148 },
  { number: 1114, name: "Simbotics", city: "St. Catharines", state: "ON", country: "Canada", rookie_year: 2003, motto: "Sine Mora", wins: 389, losses: 102, ties: 5, awards: 132 },
  { number: 2056, name: "OP Robotics", city: "Mississauga", state: "ON", country: "Canada", rookie_year: 2007, motto: "Orange Pride", wins: 356, losses: 118, ties: 2, awards: 119 },
  { number: 118, name: "Robonauts", city: "Houston", state: "TX", country: "USA", rookie_year: 1997, motto: "Excellence through hard work", wins: 341, losses: 127, ties: 4, awards: 107 },
  { number: 1678, name: "Citrus Circuits", city: "Davis", state: "CA", country: "USA", rookie_year: 2005, motto: "Simply the best", wins: 334, losses: 134, ties: 6, awards: 98 },
  { number: 3310, name: "Black Hawk Robotics", city: "Rock Hill", state: "SC", country: "USA", rookie_year: 2010, motto: "Lift off!", wins: 298, losses: 156, ties: 1, awards: 86 },
  { number: 4414, name: "HighTide", city: "Aptos", state: "CA", country: "USA", rookie_year: 2013, motto: "Rise with the tide", wins: 276, losses: 168, ties: 3, awards: 74 },
  { number: 6328, name: "Mechanical Advantage", city: "Littleton", state: "MA", country: "USA", rookie_year: 2017, motto: "Work smarter, not harder", wins: 264, losses: 172, ties: 0, awards: 67 },
  { number: 148, name: "Robowranglers", city: "Greenville", state: "TX", country: "USA", rookie_year: 1992, motto: "Wrangling robots since '92", wins: 312, losses: 143, ties: 2, awards: 91 },
  { number: 971, name: "Spartan Robotics", city: "Mountain View", state: "CA", country: "USA", rookie_year: 2002, motto: "Spartan spirit", wins: 287, losses: 159, ties: 4, awards: 83 },
  { number: 1619, name: "Up-A-Creek Robotics", city: "New Milford", state: "CT", country: "USA", rookie_year: 2005, motto: "Never up a creek", wins: 245, losses: 188, ties: 2, awards: 61 },
  { number: 330, name: "Beach Bot", city: "Santa Monica", state: "CA", country: "USA", rookie_year: 1997, motto: "Beach bots rule", wins: 298, losses: 167, ties: 5, awards: 79 },
  { number: 2910, name: "Jack In The Bot", city: "Bonney Lake", state: "WA", country: "USA", rookie_year: 2009, motto: "Pop goes the robot", wins: 267, losses: 178, ties: 3, awards: 72 },
  { number: 5406, name: "Celt-X", city: "Quebec City", state: "QC", country: "Canada", rookie_year: 2015, motto: "For the love of robots", wins: 234, losses: 198, ties: 1, awards: 58 },
  { number: 3538, name: "RoboJackets", city: "Atlanta", state: "GA", country: "USA", rookie_year: 2011, motto: "Building the future", wins: 221, losses: 209, ties: 4, awards: 49 },
  { number: 1241, name: "THEORY6", city: "Hamilton", state: "ON", country: "Canada", rookie_year: 2003, motto: "Theory into practice", wins: 256, losses: 184, ties: 2, awards: 65 },
  { number: 7492, name: "Absolute Zero", city: "Anchorage", state: "AK", country: "USA", rookie_year: 2019, motto: "Cold as ice", wins: 134, losses: 218, ties: 0, awards: 22 },
  { number: 4910, name: "WarriorBots", city: "Dallas", state: "TX", country: "USA", rookie_year: 2013, motto: "Forged in Texas", wins: 198, losses: 214, ties: 3, awards: 41 },
  { number: 3175, name: "AllStars", city: "Portland", state: "OR", country: "USA", rookie_year: 2010, motto: "Stars aligned", wins: 212, losses: 202, ties: 5, awards: 47 },
  { number: 2614, name: "Phoenixes", city: "Phoenix", state: "AZ", country: "USA", rookie_year: 2008, motto: "Rise from the ashes", wins: 187, losses: 225, ties: 2, awards: 38 },
];

export const events: Event[] = [
  {
    key: "2025casj",
    name: "Silicon Valley Regional",
    short_name: "Silicon Valley",
    city: "San Jose",
    state: "CA",
    country: "USA",
    start_date: "2025-03-13",
    end_date: "2025-03-15",
    event_type: "Regional",
    week: 3,
    year: 2025,
    teams: [254, 1678, 4414, 971, 330, 3175, 2614, 4910, 7492, 3538, 6328, 2056],
  },
  {
    key: "2025onca",
    name: "Ontario Provincial Championship",
    short_name: "Ontario Provincial",
    city: "Mississauga",
    state: "ON",
    country: "Canada",
    start_date: "2025-03-20",
    end_date: "2025-03-22",
    event_type: "District Championship",
    week: 4,
    year: 2025,
    teams: [1114, 2056, 5406, 1241, 1619, 2910, 148, 118, 3310, 254, 1678],
  },
  {
    key: "2025txda",
    name: "Dallas Regional",
    short_name: "Dallas",
    city: "Dallas",
    state: "TX",
    country: "USA",
    start_date: "2025-03-27",
    end_date: "2025-03-29",
    event_type: "Regional",
    week: 5,
    year: 2025,
    teams: [118, 148, 3310, 4910, 254, 1678, 971, 330, 3538, 2614, 7492],
  },
  {
    key: "2025new",
    name: "New England District Championship",
    short_name: "NE District Championship",
    city: "Bridgeport",
    state: "CT",
    country: "USA",
    start_date: "2025-04-10",
    end_date: "2025-04-12",
    event_type: "District Championship",
    week: 6,
    year: 2025,
    teams: [1619, 6328, 4414, 254, 1114, 2910, 971, 3175],
  },
  {
    key: "2025cmp",
    name: "FIRST Championship — Houston",
    short_name: "Championship",
    city: "Houston",
    state: "TX",
    country: "USA",
    start_date: "2025-04-16",
    end_date: "2025-04-20",
    event_type: "Championship",
    week: null,
    year: 2025,
    teams: [254, 1114, 2056, 118, 1678, 3310, 4414, 6328, 148, 971, 1619, 330, 2910, 5406, 1241, 3538, 4910, 3175, 2614, 7492],
  },
  {
    key: "2025wasp",
    name: "PNW District Spokane Event",
    short_name: "PNW Spokane",
    city: "Spokane",
    state: "WA",
    country: "USA",
    start_date: "2025-03-07",
    end_date: "2025-03-09",
    event_type: "District",
    week: 2,
    year: 2025,
    teams: [2910, 3175, 7492, 4414, 971, 254],
  },
];

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
