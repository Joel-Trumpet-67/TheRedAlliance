import { useParams, Link, useNavigate } from 'react-router-dom';
import { EventCard } from '../components/EventCard';
import { MatchRow } from '../components/MatchRow';
import { MatchDetailModal } from '../components/MatchDetailModal';
import { useEffect, useState } from 'react';
import { usePageEntrance } from '../hooks/usePageEntrance';
import { useStagger } from '../hooks/useStagger';
import { useCountUp } from '../hooks/useCountUp';
import { useTeams } from '../context/TeamsContext';
import { fetchTeamEvents, type SBTeamEvent } from '../api/statbotics';
import { fetchTBATeamMatches, adaptTBAMatch, type TBAMatch } from '../api/tba';
import { MY_TEAM } from '../constants';
import type { Event, Match } from '../data/mockData';

function adaptSBTeamEvent(sb: SBTeamEvent): Event {
  const typeMap: Record<string, string> = {
    regional:     'Regional',
    district:     'District',
    district_cmp: 'District Championship',
    champs_div:   'Championship Division',
    einstein:     'Einstein Championship',
  };
  return {
    key:        sb.event,
    name:       sb.event_name,
    short_name: sb.event_name
      .replace(/ Regional$/, '')
      .replace(/ District$/, '')
      .replace(/ Championship.*/, ''),
    city:       '',
    state:      sb.state    ?? '',
    country:    sb.country  ?? '',
    start_date: sb.start_date ?? '',
    end_date:   sb.end_date   ?? '',
    event_type: typeMap[sb.type] ?? sb.type,
    week:       sb.week,
    year:       sb.year,
    teams:      [],
    status:     sb.status,
  };
}

const YEARS = [2026, 2025, 2024, 2023, 2022, 2019, 2018];

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
  const [evYear, setEvYear] = useState(new Date().getFullYear());
  const pageRef     = usePageEntrance();
  const { teams, loading } = useTeams();

  const team = teams.find(t => t.number === Number(number));

  // Async team events
  const [teamEvents,    setTeamEvents]    = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Real matches fetched from Statbotics
  const [matches,        setMatches]        = useState<Match[]>([]);
  const [rawMatches,     setRawMatches]     = useState<TBAMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [selectedMatch,  setSelectedMatch]  = useState<Match | null>(null);

  useEffect(() => {
    if (!team) return;
    setEventsLoading(true);
    setTeamEvents([]);
    fetchTeamEvents(team.number, evYear).then(data => {
      setTeamEvents(
        data
          .map(adaptSBTeamEvent)
          .sort((a, b) => (a.week ?? 99) - (b.week ?? 99))
      );
      setEventsLoading(false);
    });
  }, [team?.number, evYear]);

  // Fetch real matches for this team in a single API call
  useEffect(() => {
    if (!team) { setMatches([]); setRawMatches([]); return; }
    let cancelled = false;
    setMatchesLoading(true);
    fetchTBATeamMatches(team.number, evYear).then(raw => {
      if (cancelled) return;
      setRawMatches(raw);
      setMatches(raw.map(adaptTBAMatch));
      setMatchesLoading(false);
    });
    return () => { cancelled = true; };
  }, [team?.number, evYear]);

  const eventsRef  = useStagger<HTMLDivElement>([tab, team?.number, evYear, eventsLoading]);
  const matchesRef = useStagger<HTMLDivElement>([tab, team?.number, matches.length]);

  /* Still fetching teams list */
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
      <MatchDetailModal
        match={selectedMatch}
        tbaMatch={selectedMatch ? (rawMatches.find(r => r.key === selectedMatch.key) ?? null) : null}
        onClose={() => setSelectedMatch(null)}
      />
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
              <div className="stat-chip-label">
                EPA <span className="epa-info" title="Expected Points Added — measures a team's average scoring contribution per match">ⓘ</span>
              </div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>
                {team.epa.toFixed(0)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn${tab === 'events'  ? ' active' : ''}`} onClick={() => setTab('events')}>
          Events
        </button>
        <button className={`tab-btn${tab === 'matches' ? ' active' : ''}`} onClick={() => setTab('matches')}>
          Matches ({matchesLoading ? '…' : matches.length})
        </button>
      </div>

      {tab === 'events' && (
        <>
          {/* Year selector */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {YEARS.map(y => (
              <button
                key={y}
                className={`tab-btn${evYear === y ? ' active' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
                onClick={() => setEvYear(y)}
              >
                {y}
              </button>
            ))}
          </div>

          {eventsLoading ? (
            <div className="card-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card skeleton-card">
                  <div style={{ padding: '0.9rem 1rem' }}>
                    <div className="skeleton skeleton-line" style={{ width: '25%', marginBottom: 8 }} />
                    <div className="skeleton skeleton-line" style={{ width: '65%', height: 18, marginBottom: 6 }} />
                    <div className="skeleton skeleton-line" style={{ width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : teamEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <div>No events in {evYear}</div>
            </div>
          ) : (
            <div className="card-list" ref={eventsRef}>
              {teamEvents.map(e => <EventCard key={e.key} event={e} />)}
            </div>
          )}
        </>
      )}

      {tab === 'matches' && (
        matchesLoading ? (
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
        ) : matches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <div>No matches on record</div>
          </div>
        ) : (
          <div className="card" ref={matchesRef}>
            {matches.map(m => (
              <MatchRow key={m.key} match={m} highlightTeam={MY_TEAM} onClick={setSelectedMatch} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
