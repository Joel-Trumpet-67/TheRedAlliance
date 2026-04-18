import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Match, Ranking } from '../data/mockData';
import { MatchRow } from '../components/MatchRow';
import { MatchDetailModal } from '../components/MatchDetailModal';
import { useEffect, useState } from 'react';
import { usePageEntrance } from '../hooks/usePageEntrance';
import { useStagger } from '../hooks/useStagger';
import { useTeams } from '../context/TeamsContext';
import { useEvents } from '../context/EventsContext';
import { usePinnedEvents } from '../context/PinnedEventsContext';
import {
  fetchTBAEventMatches, fetchTBAEventRankings, fetchTBAEventTeams,
  adaptTBAMatch, type TBAMatch,
} from '../api/tba';
import { MY_TEAM } from '../constants';
import {
  fetchEventMatches, fetchEventRankings, fetchTeamNumbersForEvent, adaptMatch,
} from '../api/statbotics';

type Tab = 'matches' | 'rankings' | 'teams';

function formatDate(start: string, end: string) {
  const s = new Date(start + 'T12:00:00');
  const e = new Date(end   + 'T12:00:00');
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  if (s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString('en-US', opts)} – ${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}, ${e.getFullYear()}`;
}

function badgeClass(type: string) {
  const t = type.toLowerCase();
  if (t.includes('einstein'))              return 'championship';
  if (t.includes('district championship')) return 'district-championship';
  if (t.includes('championship'))          return 'championship';
  if (t.includes('district'))              return 'district';
  return 'regional';
}

export function EventDetail() {
  const { key }     = useParams<{ key: string }>();
  const navigate    = useNavigate();
  const [tab, setTab] = useState<Tab>('matches');
  const pageRef     = usePageEntrance();
  const { teams }   = useTeams();
  const { events, loading: eventsLoading } = useEvents();

  // Lazy-loaded team numbers for this event
  const [eventTeamNums,    setEventTeamNums]    = useState<number[]>([]);
  const [teamsLoading,     setTeamsLoading]      = useState(false);

  const { isPinned, toggle } = usePinnedEvents();
  const event    = events.find(e => e.key === key);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [rankingsLoading, setRankingsLoading] = useState(false);

  // Live match data from TBA
  const [matches,        setMatches]        = useState<Match[]>([]);
  const [rawMatches,     setRawMatches]     = useState<TBAMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [selectedMatch,  setSelectedMatch]  = useState<Match | null>(null);
  const [matchFilter,    setMatchFilter]    = useState('');

  function applyMatches(raw: TBAMatch[]) {
    setRawMatches(raw);
    setMatches(raw.map(adaptTBAMatch));
  }

  // Initial fetch — TBA primary, Statbotics fallback
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    setMatchesLoading(true);
    fetchTBAEventMatches(key).then(async raw => {
      if (cancelled) return;
      if (raw.length > 0) {
        applyMatches(raw);
      } else {
        // TBA returned nothing (missing key or network error) — fall back to Statbotics
        const sbRaw = await fetchEventMatches(key);
        if (!cancelled && sbRaw.length > 0) {
          setRawMatches([]);   // no TBAMatch to store
          setMatches(sbRaw.map(adaptMatch));
        }
      }
      setMatchesLoading(false);
    }).catch(async () => {
      if (cancelled) return;
      const sbRaw = await fetchEventMatches(key);
      if (!cancelled) { setMatches(sbRaw.map(adaptMatch)); }
      setMatchesLoading(false);
    });
    return () => { cancelled = true; };
  }, [key]);

  // Clear match filter when tab changes
  useEffect(() => { setMatchFilter(''); }, [tab]);

  // 30s polling when event is in progress (TBA is the official live source)
  useEffect(() => {
    if (!key || event?.status !== 'In Progress') return;
    const id = setInterval(() => {
      fetchTBAEventMatches(key).then(raw => { if (raw.length) applyMatches(raw); });
      if (tab === 'rankings' && key) {
        fetchTBAEventRankings(key).then(r => { if (r.length) setRankings(r); });
      }
    }, 30000);
    return () => clearInterval(id);
  }, [key, event?.status, tab]);

  // Fetch rankings — TBA primary, Statbotics fallback
  useEffect(() => {
    if (tab !== 'rankings' || !key || rankings.length > 0 || rankingsLoading) return;
    setRankingsLoading(true);
    fetchTBAEventRankings(key).then(async r => {
      if (r.length > 0) { setRankings(r); }
      else { const sb = await fetchEventRankings(key); setRankings(sb); }
      setRankingsLoading(false);
    });
  }, [tab, key, rankings.length, rankingsLoading]);

  // Fetch teams — TBA primary, Statbotics fallback
  useEffect(() => {
    if (tab !== 'teams' || !key || eventTeamNums.length > 0 || teamsLoading) return;
    setTeamsLoading(true);
    fetchTBAEventTeams(key).then(async nums => {
      if (nums.length > 0) { setEventTeamNums(nums); }
      else { const sb = await fetchTeamNumbersForEvent(key); setEventTeamNums(sb.sort((a,b) => a-b)); }
      setTeamsLoading(false);
    });
  }, [tab, key, eventTeamNums.length, teamsLoading]);

  const teamsRef = useStagger<HTMLDivElement>([tab, eventTeamNums.length]);

  // Still loading events list
  if (eventsLoading && !event) {
    return (
      <div className="page">
        <div className="skeleton skeleton-line" style={{ width: 80, height: 14, marginBottom: '1rem' }} />
        <div className="card" style={{ padding: '1.4rem 1.25rem', marginBottom: '1.25rem' }}>
          <div className="skeleton skeleton-line" style={{ width: '25%', marginBottom: 8 }} />
          <div className="skeleton skeleton-line" style={{ width: '70%', height: 22, marginBottom: 6 }} />
          <div className="skeleton skeleton-line" style={{ width: '40%' }} />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
            {[60, 80, 80].map((w, i) => (
              <div key={i} className="skeleton" style={{ width: w, height: 52, borderRadius: 9 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div>Event not found</div>
          <button
            onClick={() => navigate('/events')}
            style={{ marginTop: '1rem', color: 'var(--red-400)', fontSize: '0.9rem' }}
          >← Back to Events</button>
        </div>
      </div>
    );
  }

  // Resolve full team objects for the teams tab
  const eventTeams = eventTeamNums.map(num => {
    const found = teams.find(t => t.number === num);
    return found ?? {
      number: num, name: `Team ${num}`, city: '', state: '', country: '',
      rookie_year: 0, motto: '', wins: 0, losses: 0, ties: 0, awards: 0,
    };
  });

  const teamCount = event.num_teams ?? eventTeamNums.length;
  const location  = [event.state, event.country].filter(Boolean).join(', ');

  const pinned = event ? isPinned(event.key) : false;

  return (
    <div className="page" ref={pageRef}>
      <MatchDetailModal
        match={selectedMatch}
        tbaMatch={selectedMatch ? (rawMatches.find(r => r.key === selectedMatch.key) ?? null) : null}
        eventName={event?.name}
        onClose={() => setSelectedMatch(null)}
      />

      <Link to="/events" className="back-btn">← Events</Link>

      <div className="detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span className={`event-badge ${badgeClass(event.event_type)}`}>
            {event.event_type}
          </span>
          {event.status && event.status !== 'Completed' && (
            <span style={{
              fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem',
              borderRadius: 6,
              background: event.status === 'In Progress' ? 'rgba(74,222,128,0.12)' : 'rgba(250,204,21,0.12)',
              color: event.status === 'In Progress' ? '#4ade80' : '#facc15',
              border: `1px solid ${event.status === 'In Progress' ? 'rgba(74,222,128,0.3)' : 'rgba(250,204,21,0.3)'}`,
            }}>
              {event.status}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div className="detail-title">{event.name}</div>
          <button
            className={`pin-btn detail-pin${pinned ? ' pinned' : ''}`}
            onClick={() => toggle(event.key)}
            title={pinned ? 'Unpin event' : 'Pin event'}
          >{pinned ? '★' : '☆'}</button>
        </div>
        <div className="detail-subtitle">{location}</div>
        <div className="detail-subtitle" style={{ marginTop: 4 }}>
          {formatDate(event.start_date, event.end_date)}
          {event.week != null && <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>Week {event.week}</span>}
        </div>
        {event.video && (
          <a
            href={event.video}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: 8,
              fontSize: '0.8rem', color: 'var(--red-400)', textDecoration: 'none' }}
          >
            ▶ Watch stream
          </a>
        )}

        <div className="stat-row">
          <div className="stat-chip">
            <div className="stat-chip-label">Teams</div>
            <div className="stat-chip-value">{teamCount || '—'}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">Qual Matches</div>
            <div className="stat-chip-value">{matches.filter(m => m.comp_level === 'qm').length || '—'}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">Playoff Matches</div>
            <div className="stat-chip-value">{matches.filter(m => m.comp_level !== 'qm').length || '—'}</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn${tab === 'matches'  ? ' active' : ''}`} onClick={() => setTab('matches')}>
          Matches {event?.status === 'In Progress' && <span className="live-badge"><span className="live-dot"/>LIVE</span>}
        </button>
        <button className={`tab-btn${tab === 'rankings' ? ' active' : ''}`} onClick={() => setTab('rankings')}>Rankings</button>
        <button className={`tab-btn${tab === 'teams'    ? ' active' : ''}`} onClick={() => setTab('teams')}>
          Teams{teamCount ? ` (${teamCount})` : ''}
        </button>
      </div>

      {tab === 'matches' && (() => {
        const today = new Date().toISOString().slice(0, 10);
        const filtered = matchFilter.trim()
          ? matches.filter(m =>
              [...m.red_alliance, ...m.blue_alliance]
                .some(num => String(num).includes(matchFilter.trim()))
            )
          : matches;
        const quals    = filtered.filter(m => m.comp_level === 'qm');
        const playoffs = filtered.filter(m => m.comp_level !== 'qm');
        return (
          <>
            {matchesLoading && (
              <div className="card">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="match-row">
                    <div className="skeleton skeleton-line" style={{ width: 28, height: 13 }} />
                    <div className="skeleton skeleton-line" style={{ width: '22%', height: 34 }} />
                    <div className="skeleton skeleton-line" style={{ width: 72, height: 28 }} />
                    <div className="skeleton skeleton-line" style={{ width: '22%', height: 34 }} />
                  </div>
                ))}
              </div>
            )}
            {!matchesLoading && matches.length > 0 && (
              <div className="search-bar">
                <input
                  className="search-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="Filter by team number…"
                  value={matchFilter}
                  onChange={e => setMatchFilter(e.target.value)}
                />
              </div>
            )}
            {!matchesLoading && quals.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div className="section-title" style={{ marginBottom: '0.4rem' }}>Qualification Matches</div>
                <div className="card">
                  {quals.map(m => <MatchRow key={m.key} match={m} highlightTeam={MY_TEAM} onClick={setSelectedMatch} />)}
                </div>
              </div>
            )}
            {!matchesLoading && playoffs.length > 0 && (
              <div>
                <div className="section-title" style={{ marginBottom: '0.4rem' }}>Playoff Matches</div>
                <div className="card">
                  {playoffs.map(m => <MatchRow key={m.key} match={m} highlightTeam={MY_TEAM} onClick={setSelectedMatch} />)}
                </div>
              </div>
            )}
            {!matchesLoading && matches.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">⚙️</div>
                <div>
                  {event?.start_date && event.start_date > today
                    ? `Match schedule posts closer to the event · Starts ${new Date(event.start_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : 'Match schedule not yet available'}
                </div>
              </div>
            )}
            {!matchesLoading && matches.length > 0 && filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div>No matches found for team "{matchFilter}"</div>
              </div>
            )}
          </>
        );
      })()}

      {tab === 'rankings' && (
        rankingsLoading ? (
          <div className="card">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
                <div className="skeleton skeleton-line" style={{ width: 24, height: 13 }} />
                <div className="skeleton skeleton-line" style={{ width: 48, height: 13 }} />
                <div className="skeleton skeleton-line" style={{ width: 60, height: 13, marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div>Rankings not available</div>
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
                  <tr key={r.team_number} className={r.team_number === MY_TEAM ? 'my-team-row' : ''}>
                    <td className="rank-num">{r.rank}</td>
                    <td><Link to={`/teams/${r.team_number}`} className="team-link">{r.team_number}</Link></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.wins}-{r.losses}-{r.ties}</td>
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
        teamsLoading ? (
          <div className="card-list">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card skeleton-card">
                <div className="team-card">
                  <div className="skeleton skeleton-badge" />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-line" style={{ width: '50%' }} />
                    <div className="skeleton skeleton-line" style={{ width: '35%', marginTop: 6 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : eventTeams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <div>Team list not available</div>
          </div>
        ) : (
          <div className="card-list" ref={teamsRef}>
            {eventTeams.map(t => (
              <div className="card" key={t.number}>
                <Link to={`/teams/${t.number}`} className="card-link">
                  <div className="team-card">
                    <div className="team-number-badge">{t.number}</div>
                    <div className="team-info">
                      <div className="team-name">{t.name}</div>
                      <div className="team-location">
                        {[t.city, t.state].filter(Boolean).join(', ')}
                      </div>
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
