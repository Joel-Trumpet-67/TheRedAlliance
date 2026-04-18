import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchAllTeams, type SBTeam } from '../api/statbotics';
import type { Team } from '../data/mockData';

/** Convert a Statbotics team into the app's Team shape */
function adapt(sb: SBTeam): Team {
  return {
    number:      sb.team,
    name:        sb.name,
    city:        sb.district ?? '',   // Statbotics has no city field; use district code
    state:       sb.state    ?? '',
    country:     sb.country  ?? '',
    rookie_year: sb.rookie_year,
    motto:       '',
    wins:        sb.record.wins,
    losses:      sb.record.losses,
    ties:        sb.record.ties,
    awards:      0,
    epa:         sb.epa?.total_points?.mean ?? undefined,
  };
}

interface TeamsState {
  teams:   Team[];
  loading: boolean;
  error:   string | null;
  /** Running count shown while fetching (may differ from teams.length until done) */
  count:   number;
}

const TeamsCtx = createContext<TeamsState>({
  teams: [], loading: true, error: null, count: 0,
});

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams,   setTeams]   = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [count,   setCount]   = useState(0);

  useEffect(() => {
    fetchAllTeams(loaded => setCount(loaded))
      .then(raw => {
        setTeams(raw.map(adapt));
        setCount(raw.length);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message ?? 'Failed to load teams');
        setLoading(false);
      });
  }, []);

  return (
    <TeamsCtx.Provider value={{ teams, loading, error, count }}>
      {children}
    </TeamsCtx.Provider>
  );
}

export function useTeams() {
  return useContext(TeamsCtx);
}
