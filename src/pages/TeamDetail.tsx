import { useParams, Link, useNavigate } from 'react-router-dom';
import { teams, getTeamEvents, getMatchesForEvent } from '../data/mockData';
import { EventCard } from '../components/EventCard';
import { MatchRow } from '../components/MatchRow';
import { useMemo, useState } from 'react';

export function TeamDetail() {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'events' | 'matches'>('events');

  const team = teams.find(t => t.number === Number(number));

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

  const teamEvents = getTeamEvents(team.number);

  const teamMatches = useMemo(() => {
    return teamEvents.flatMap(e => {
      const matches = getMatchesForEvent(e.key);
      return matches.filter(
        m => m.red_alliance.includes(team.number) || m.blue_alliance.includes(team.number)
      ).map(m => ({ ...m, eventName: e.short_name }));
    });
  }, [teamEvents, team.number]);

  const winRate = team.wins + team.losses + team.ties > 0
    ? ((team.wins / (team.wins + team.losses + team.ties)) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="page">
      <Link to="/teams" className="back-btn">← Teams</Link>

      <div className="detail-header">
        <div className="detail-number">Team {team.number}</div>
        <div className="detail-title">{team.name}</div>
        <div className="detail-subtitle">{team.city}, {team.state}, {team.country}</div>
        <div className="detail-subtitle" style={{ marginTop: 4 }}>
          Rookie Year: {team.rookie_year}
        </div>
        {team.motto && (
          <div style={{ marginTop: 6, fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            "{team.motto}"
          </div>
        )}

        <div className="stat-row">
          <div className="stat-chip">
            <div className="stat-chip-label">Wins</div>
            <div className="stat-chip-value" style={{ color: '#4ade80' }}>{team.wins}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">Losses</div>
            <div className="stat-chip-value" style={{ color: '#f87171' }}>{team.losses}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">Ties</div>
            <div className="stat-chip-value">{team.ties}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">Win %</div>
            <div className="stat-chip-value">{winRate}%</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">Awards</div>
            <div className="stat-chip-value" style={{ color: '#fbbf24' }}>{team.awards}</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn${tab === 'events' ? ' active' : ''}`}
          onClick={() => setTab('events')}
        >
          Events ({teamEvents.length})
        </button>
        <button
          className={`tab-btn${tab === 'matches' ? ' active' : ''}`}
          onClick={() => setTab('matches')}
        >
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
          <div className="card-list">
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
          <div className="card">
            {teamMatches.map(m => (
              <MatchRow key={m.key} match={m} highlightTeam={team.number} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
