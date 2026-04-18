import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageEntrance } from '../hooks/usePageEntrance';
import { useTeams } from '../context/TeamsContext';
import { fetchDistrictRankings, type TBADistrictRanking, tbaTeamNum } from '../api/tba';
import { MY_TEAM, MY_DISTRICT, CURRENT_YEAR } from '../constants';

const WORLDS_SLOTS = 83;
const BUBBLE_ZONE  = 10; // show "Bubble" warning for ranks 84–93

function qualStatus(rank: number): { label: string; className: string } | null {
  if (rank <= WORLDS_SLOTS)               return { label: '🌍 Worlds',  className: 'qual-worlds' };
  if (rank <= WORLDS_SLOTS + BUBBLE_ZONE) return { label: 'Bubble',    className: 'qual-bubble'  };
  if (rank <= 175)                        return { label: 'DCMP',       className: 'qual-dcmp'   };
  return null;
}

export function Districts() {
  const pageRef = usePageEntrance();
  const { teams } = useTeams();
  const [rankings, setRankings] = useState<TBADistrictRanking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('');
  const [showAll,  setShowAll]  = useState(false);

  useEffect(() => {
    fetchDistrictRankings(`${CURRENT_YEAR}${MY_DISTRICT}`).then(data => {
      setRankings(data);
      setLoading(false);
    });
  }, []);

  const myRow      = rankings.find(r => tbaTeamNum(r.team_key) === MY_TEAM);
  const cutoffRow  = rankings.find(r => r.rank === WORLDS_SLOTS);
  const cutoffPts  = cutoffRow?.point_total ?? null;

  const filtered = filter.trim()
    ? rankings.filter(r => String(tbaTeamNum(r.team_key)).includes(filter.trim()))
    : showAll
    ? rankings
    : rankings.slice(0, WORLDS_SLOTS + BUBBLE_ZONE);

  const worldsTeams    = rankings.filter(r => r.rank <= WORLDS_SLOTS);
  const predictedCount = worldsTeams.length;

  return (
    <div className="page" ref={pageRef}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>FIM District Standings</h1>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: 20,
          background: 'rgba(185,28,28,0.15)', color: 'var(--red-400)', border: '1px solid rgba(185,28,28,0.3)' }}>
          {CURRENT_YEAR}
        </span>
      </div>

      {/* Worlds prediction summary */}
      {!loading && predictedCount > 0 && (
        <div className="card" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem',
          border: '1px solid rgba(251,191,36,0.25)', background: 'rgba(251,191,36,0.05)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fbbf24', marginBottom: 4 }}>
            🌍 Worlds Prediction — Top {WORLDS_SLOTS}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Based on current standings, the cutoff is&nbsp;
            <strong style={{ color: 'var(--text-primary)' }}>
              {cutoffPts != null ? `${cutoffPts} pts` : '—'}
            </strong>
            &nbsp;(rank #{WORLDS_SLOTS}).
            Teams within {BUBBLE_ZONE} ranks of the cutoff are in the bubble zone.
          </div>
        </div>
      )}

      {/* My Team card */}
      {myRow && (
        <div className="card my-team-summary" style={{ marginBottom: '1.25rem', padding: '1rem 1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="team-number-badge" style={{ width: 46, height: 46, fontSize: '0.9rem' }}>{MY_TEAM}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                {teams.find(t => t.number === MY_TEAM)?.name ?? `Team ${MY_TEAM}`}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Rank #{myRow.rank} · {myRow.point_total} pts
                {cutoffPts != null && myRow.rank > WORLDS_SLOTS && (
                  <span style={{ color: '#f87171', marginLeft: 6 }}>
                    ({cutoffPts - myRow.point_total} pts from cutoff)
                  </span>
                )}
                {cutoffPts != null && myRow.rank <= WORLDS_SLOTS && (
                  <span style={{ color: '#4ade80', marginLeft: 6 }}>
                    (+{myRow.point_total - cutoffPts} above cutoff)
                  </span>
                )}
              </div>
            </div>
            {qualStatus(myRow.rank) && (
              <span className={`qual-badge ${qualStatus(myRow.rank)!.className}`}>
                {qualStatus(myRow.rank)!.label}
              </span>
            )}
          </div>
          {myRow.event_points.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              {myRow.event_points.map(ep => (
                <Link key={ep.event_key} to={`/events/${ep.event_key}`}
                  style={{ fontSize: '0.72rem', padding: '3px 9px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)' }}>
                  {ep.event_key.replace(/^\d{4}/, '')} · {ep.total} pts
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="search-bar" style={{ marginBottom: '1rem' }}>
        <input className="search-input" style={{ paddingLeft: '1rem' }}
          placeholder="Filter by team number…"
          value={filter} onChange={e => setFilter(e.target.value)} />
      </div>

      {loading ? (
        <div className="card">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div className="skeleton skeleton-line" style={{ width: 28, height: 13 }} />
              <div className="skeleton skeleton-line" style={{ width: 48, height: 13 }} />
              <div className="skeleton skeleton-line" style={{ width: 80, height: 13, marginLeft: 'auto' }} />
            </div>
          ))}
        </div>
      ) : rankings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <div>District standings not yet available</div>
        </div>
      ) : (
        <>
          <div className="card">
            <table className="rankings-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Team</th>
                  <th>Pts</th>
                  <th>Gap</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const num    = tbaTeamNum(r.team_key);
                  const isMe   = num === MY_TEAM;
                  const status = qualStatus(r.rank);
                  const gap    = cutoffPts != null ? r.point_total - cutoffPts : null;
                  const isCutoff = r.rank === WORLDS_SLOTS;

                  // Insert cutoff row after last worlds team
                  const nextRank = filtered[idx + 1]?.rank;
                  const insertCutoff = isCutoff && nextRank != null && nextRank > WORLDS_SLOTS && !filter.trim();

                  return (
                    <>
                      <tr key={r.team_key} className={isMe ? 'my-team-row' : ''}>
                        <td className="rank-num">{r.rank}</td>
                        <td>
                          <Link to={`/teams/${num}`} className="team-link"
                            style={isMe ? { color: 'var(--red-400)', fontWeight: 800 } : undefined}>
                            {num}
                          </Link>
                          <span style={{ marginLeft: 8, fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                            {teams.find(t => t.number === num)?.name?.split(' ').slice(0, 3).join(' ')}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{r.point_total}</td>
                        <td style={{ fontSize: '0.75rem', color: gap != null && gap >= 0 ? '#4ade80' : '#f87171' }}>
                          {gap != null && r.rank !== WORLDS_SLOTS
                            ? (gap > 0 ? `+${gap}` : `${gap}`)
                            : '—'}
                        </td>
                        <td>
                          {status && (
                            <span className={`qual-badge ${status.className}`}>{status.label}</span>
                          )}
                        </td>
                      </tr>
                      {insertCutoff && (
                        <tr key="cutoff-line" className="worlds-cutoff-row">
                          <td colSpan={5}>
                            ── Worlds cutoff ({cutoffPts} pts) ──
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!filter.trim() && (
            <button
              className="tab-btn"
              style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.8rem' }}
              onClick={() => setShowAll(v => !v)}
            >
              {showAll ? 'Show Less' : `Show All ${rankings.length} Teams`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
