import { useParams, Link, useNavigate } from 'react-router-dom';
import { events, getMatchesForEvent, getRankingsForEvent, teams } from '../data/mockData';
import { MatchRow } from '../components/MatchRow';
import { useMemo, useState } from 'react';

type Tab = 'matches' | 'rankings' | 'teams';

export function EventDetail() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('matches');

  const event = events.find(e => e.key === key);

  const matches = useMemo(() => key ? getMatchesForEvent(key) : [], [key]);
  const rankings = useMemo(() => key ? getRankingsForEvent(key) : [], [key]);

  if (!event) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div>Event not found</div>
          <button
            onClick={() => navigate('/events')}
            style={{ marginTop: '1rem', color: 'var(--red-400)', fontSize: '0.9rem' }}
          >
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  const eventTeams = teams.filter(t => event.teams.includes(t.number));

  function formatDate(start: string, end: string) {
    const s = new Date(start + 'T12:00:00');
    const e = new Date(end + 'T12:00:00');
    const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    if (s.getMonth() === e.getMonth()) {
      return `${s.toLocaleDateString('en-US', opts)} – ${e.getDate()}, ${e.getFullYear()}`;
    }
    return `${s.toLocaleDateString('en-US', { ...opts })} – ${e.toLocaleDateString('en-US', { ...opts })}, ${e.getFullYear()}`;
  }

  const quals = matches.filter(m => m.comp_level === 'qm');
  const playoffs = matches.filter(m => m.comp_level !== 'qm');

  return (
    <div className="page">
      <Link to="/events" className="back-btn">← Events</Link>

      <div className="detail-header">
        <span
          className={`event-badge ${event.event_type.toLowerCase().includes('championship') ? 'championship' : event.event_type.toLowerCase().includes('district') ? 'district' : 'regional'}`}
          style={{ marginBottom: '0.5rem', display: 'inline-block' }}
        >
          {event.event_type}
        </span>
        <div className="detail-title">{event.name}</div>
        <div className="detail-subtitle">{event.city}, {event.state}, {event.country}</div>
        <div className="detail-subtitle" style={{ marginTop: 4 }}>
          {formatDate(event.start_date, event.end_date)}
        </div>

        <div className="stat-row">
          <div className="stat-chip">
            <div className="stat-chip-label">Teams</div>
            <div className="stat-chip-value">{event.teams.length}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">Qual Matches</div>
            <div className="stat-chip-value">{quals.length}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">Playoff Matches</div>
            <div className="stat-chip-value">{playoffs.length}</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn${tab === 'matches' ? ' active' : ''}`} onClick={() => setTab('matches')}>
          Matches
        </button>
        <button className={`tab-btn${tab === 'rankings' ? ' active' : ''}`} onClick={() => setTab('rankings')}>
          Rankings
        </button>
        <button className={`tab-btn${tab === 'teams' ? ' active' : ''}`} onClick={() => setTab('teams')}>
          Teams
        </button>
      </div>

      {tab === 'matches' && (
        <>
          {quals.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div className="section-title" style={{ marginBottom: '0.4rem' }}>Qualification Matches</div>
              <div className="card">
                {quals.map(m => <MatchRow key={m.key} match={m} />)}
              </div>
            </div>
          )}
          {playoffs.length > 0 && (
            <div>
              <div className="section-title" style={{ marginBottom: '0.4rem' }}>Playoff Matches</div>
              <div className="card">
                {playoffs.map(m => <MatchRow key={m.key} match={m} />)}
              </div>
            </div>
          )}
          {matches.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">⚙️</div>
              <div>No matches scheduled yet</div>
            </div>
          )}
        </>
      )}

      {tab === 'rankings' && (
        rankings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div>Rankings not available yet</div>
          </div>
        ) : (
          <div className="card">
            <table className="rankings-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>#</th>
                  <th>Team</th>
                  <th>W-L-T</th>
                  <th>RP</th>
                  <th>Avg</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map(r => (
                  <tr key={r.team_number}>
                    <td className="rank-num">{r.rank}</td>
                    <td>
                      <Link to={`/teams/${r.team_number}`} className="team-link">
                        {r.team_number}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {r.wins}-{r.losses}-{r.ties}
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.rp}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.avg_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'teams' && (
        eventTeams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <div>No team data available</div>
          </div>
        ) : (
          <div className="card-list">
            {eventTeams.sort((a, b) => a.number - b.number).map(t => (
              <div className="card" key={t.number}>
                <Link to={`/teams/${t.number}`} className="card-link">
                  <div className="team-card">
                    <div className="team-number-badge">{t.number}</div>
                    <div className="team-info">
                      <div className="team-name">{t.name}</div>
                      <div className="team-location">{t.city}, {t.state}</div>
                    </div>
                    <div className="record-text" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {t.wins}-{t.losses}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
