import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTeamEvents, getMatchesForEvent } from '../data/mockData';
import { EventCard } from '../components/EventCard';
import { MatchRow } from '../components/MatchRow';
import { useMemo, useState } from 'react';
import { usePageEntrance } from '../hooks/usePageEntrance';
import { useStagger } from '../hooks/useStagger';
import { useCountUp } from '../hooks/useCountUp';
import { useTeams } from '../context/TeamsContext';

function StatChip({ label, value, color }: { label: string; value: number; color?: string }) {
  const counted = useCountUp(value, 900);
  return (
    <div className="stat-chip">
      <div className="stat-chip-label">{label}</div>
      <div className="stat-chip-value" style={color ? { color } : undefined}>{counted}</div>
    </div>
  );
}

export function TeamDetail() {
  const { number }  = useParams<{ number: string }>();
  const navigate    = useNavigate();
  const [tab, setTab] = useState<'events' | 'matches'>('events');
  const pageRef     = usePageEntrance();
  const { teams, loading } = useTeams();

  const team = teams.find(t => t.number === Number(number));

  const teamEvents  = team ? getTeamEvents(team.number) : [];
  const teamMatches = useMemo(() => {
    if (!team) return [];
    return teamEvents.flatMap(e => {
      const matches = getMatchesForEvent(e.key);
      return matches
        .filter(m => m.red_alliance.includes(team.number) || m.blue_alliance.includes(team.number))
        .map(m => ({ ...m, eventName: e.short_name }));
    });
  }, [teamEvents, team]);

  const eventsRef  = useStagger<HTMLDivElement>([tab, team?.number]);
  const matchesRef = useStagger<HTMLDivElement>([tab, team?.number]);

  /* Still fetching */
  if (loading && !team) {
    return (
      <div className="page">
        <div className="skeleton skeleton-line" style={{ width: 80, height: 14, marginBottom: '1rem' }} />
        <div className="card" style={{ padding: '1.4rem 1.25rem', marginBottom: '1.25rem' }}>
          <div className="skeleton skeleton-line" style={{ width: '30%', marginBottom: 8 }} />
          <div className="skeleton skeleton-line" style={{ width: '60%', height: 22, marginBottom: 6 }} />
          <div className="skeleton skeleton-line" style={{ width: '45%' }} />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
            {[60, 60, 60, 72, 60].map((w, i) => (
              <div key={i} className="skeleton" style={{ width: w, height: 52, borderRadius: 9 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <div>Team {number} not found</div>
          <button
            onClick={() => navigate('/teams')}
            style={{ marginTop: '1rem', color: 'var(--red-400)', fontSize: '0.9rem' }}
          >← Back to Teams</button>
        </div>
      </div>
    );
  }

  const winRate = team.wins + team.losses + team.ties > 0
    ? ((team.wins / (team.wins + team.losses + team.ties)) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="page" ref={pageRef}>
      <Link to="/teams" className="back-btn">← Teams</Link>

      <div className="detail-header">
        <div className="detail-number">Team {team.number}</div>
        <div className="detail-title">{team.name}</div>
        <div className="detail-subtitle">
          {[team.city, team.state, team.country].filter(Boolean).join(', ')}
        </div>
        <div className="detail-subtitle" style={{ marginTop: 4 }}>
          Rookie Year: {team.rookie_year}
        </div>
        {team.motto && (
          <div style={{ marginTop: 7, fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.84rem', position: 'relative', zIndex: 1 }}>
            "{team.motto}"
          </div>
        )}

        <div className="stat-row">
          <StatChip label="Wins"   value={team.wins}   color="#4ade80" />
          <StatChip label="Losses" value={team.losses} color="#f87171" />
          <StatChip label="Ties"   value={team.ties} />
          <div className="stat-chip">
            <div className="stat-chip-label">Win %</div>
            <div className="stat-chip-value">{winRate}%</div>
          </div>
          {team.epa != null && (
            <div className="stat-chip">
              <div className="stat-chip-label">EPA</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>
                {team.epa.toFixed(0)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn${tab === 'events'  ? ' active' : ''}`} onClick={() => setTab('events')}>
          Events ({teamEvents.length})
        </button>
        <button className={`tab-btn${tab === 'matches' ? ' active' : ''}`} onClick={() => setTab('matches')}>
          Matches ({teamMatches.length})
        </button>
      </div>

      {tab === 'events' && (
        teamEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <div>No events on record</div>
          </div>
        ) : (
          <div className="card-list" ref={eventsRef}>
            {teamEvents.map(e => <EventCard key={e.key} event={e} />)}
          </div>
        )
      )}

      {tab === 'matches' && (
        teamMatches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <div>No matches on record</div>
          </div>
        ) : (
          <div className="card" ref={matchesRef}>
            {teamMatches.map(m => <MatchRow key={m.key} match={m} highlightTeam={team.number} />)}
          </div>
        )
      )}
    </div>
  );
}
