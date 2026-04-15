import { useParams, Link, useNavigate } from 'react-router-dom';
import { teams, getTeamEvents, getMatchesForEvent } from '../data/mockData';
import { EventCard } from '../components/EventCard';
import { MatchRow } from '../components/MatchRow';
import { useMemo, useState } from 'react';
import { usePageEntrance } from '../hooks/usePageEntrance';
import { useStagger } from '../hooks/useStagger';
import { useCountUp } from '../hooks/useCountUp';

function StatChip({ label, value, color }: { label: string; value: number | string; color?: string }) {
  const numeric = typeof value === 'number' ? value : parseFloat(value as string);
  const counted = useCountUp(isNaN(numeric) ? 0 : numeric, 900);
  const display = typeof value === 'string' && value.includes('%')
    ? `${counted.toFixed(1)}%`
    : isNaN(numeric) ? value : counted;

  return (
    <div className="stat-chip">
      <div className="stat-chip-label">{label}</div>
      <div className="stat-chip-value" style={color ? { color } : undefined}>{display}</div>
    </div>
  );
}

export function TeamDetail() {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'events' | 'matches'>('events');
  const pageRef = usePageEntrance();

  const team = teams.find(t => t.number === Number(number));

  const teamEvents = team ? getTeamEvents(team.number) : [];

  const teamMatches = useMemo(() => {
    if (!team) return [];
    return teamEvents.flatMap(e => {
      const matches = getMatchesForEvent(e.key);
      return matches.filter(
        m => m.red_alliance.includes(team.number) || m.blue_alliance.includes(team.number)
      ).map(m => ({ ...m, eventName: e.short_name }));
    });
  }, [teamEvents, team]);

  const eventsRef  = useStagger<HTMLDivElement>([tab, team?.number]);
  const matchesRef = useStagger<HTMLDivElement>([tab, team?.number]);

  if (!team) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <div>Team {number} not found</div>
          <button
            onClick={() => navigate('/teams')}
            style={{ marginTop: '1rem', color: 'var(--red-400)', fontSize: '0.9rem' }}
          >
            ← Back to Teams
          </button>
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
        <div className="detail-subtitle">{team.city}, {team.state}, {team.country}</div>
        <div className="detail-subtitle" style={{ marginTop: 4 }}>
          Rookie Year: {team.rookie_year}
        </div>
        {team.motto && (
          <div style={{ marginTop: 7, fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.84rem', position: 'relative', zIndex: 1 }}>
            "{team.motto}"
          </div>
        )}

        <div className="stat-row">
          <StatChip label="Wins"    value={team.wins}             color="#4ade80" />
          <StatChip label="Losses"  value={team.losses}           color="#f87171" />
          <StatChip label="Ties"    value={team.ties} />
          <StatChip label="Win %"   value={`${winRate}%`} />
          <StatChip label="Awards"  value={team.awards}           color="#fbbf24" />
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
            <div>No events this season</div>
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
            <div>No matches played yet</div>
          </div>
        ) : (
          <div className="card" ref={matchesRef}>
            {teamMatches.map(m => (
              <MatchRow key={m.key} match={m} highlightTeam={team.number} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
