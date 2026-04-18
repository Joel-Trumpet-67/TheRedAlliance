import { useState } from 'react';
import { useTeams } from '../context/TeamsContext';
import { TeamCard } from '../components/TeamCard';
import { usePageEntrance } from '../hooks/usePageEntrance';
import { useStagger } from '../hooks/useStagger';

type SortKey = 'number' | 'wins' | 'epa';

export function Teams() {
  const [query,    setQuery]    = useState('');
  const [sort,     setSort]     = useState<SortKey>('wins');
  const [top100,   setTop100]   = useState(false);
  const { teams, loading, count } = useTeams();
  const pageRef = usePageEntrance();

  // Build the top-100 list (sorted by EPA desc, only teams with EPA data first)
  const top100List = [...teams]
    .filter(t => t.epa != null)
    .sort((a, b) => (b.epa ?? 0) - (a.epa ?? 0))
    .slice(0, 100);

  const filtered = (top100 ? top100List : teams)
    .filter(t => {
      const q = query.toLowerCase();
      return (
        !q ||
        t.name.toLowerCase().includes(q) ||
        String(t.number).includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.state.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (top100) return (b.epa ?? 0) - (a.epa ?? 0); // always EPA-sorted in top100 mode
      if (sort === 'number') return a.number - b.number;
      if (sort === 'epa')    return (b.epa ?? 0) - (a.epa ?? 0);
      return b.wins - a.wins;
    });

  const listRef = useStagger<HTMLDivElement>([loading, sort, query, top100]);

  return (
    <div className="page" ref={pageRef}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Teams</h1>
        {loading ? (
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Loading… {count.toLocaleString()}
          </span>
        ) : (
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {teams.length.toLocaleString()} total
          </span>
        )}
      </div>

      <div className="search-bar">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search-input"
          type="search"
          placeholder="Search by number, name, state…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="tabs" style={{ marginBottom: '1rem' }}>
        <button className={`tab-btn${sort === 'wins'   ? ' active' : ''}`} onClick={() => { setSort('wins');   setTop100(false); }}>By Wins</button>
        <button className={`tab-btn${sort === 'epa'    ? ' active' : ''}`} onClick={() => { setSort('epa');    setTop100(false); }}>By EPA</button>
        <button className={`tab-btn${sort === 'number' ? ' active' : ''}`} onClick={() => { setSort('number'); setTop100(false); }}>By Number</button>
        <button
          className={`tab-btn${top100 ? ' active' : ''}`}
          style={top100 ? { color: '#fbbf24', borderColor: 'rgba(251,191,36,0.4)' } : undefined}
          onClick={() => setTop100(v => !v)}
        >
          Top 100
        </button>
      </div>

      {loading && teams.length === 0 ? (
        /* Skeleton list while initial fetch is in progress */
        <div className="card-list">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card skeleton-card">
              <div className="team-card">
                <div className="skeleton skeleton-badge" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-line" style={{ width: '50%' }} />
                  <div className="skeleton skeleton-line" style={{ width: '35%', marginTop: 6 }} />
                </div>
                <div className="skeleton skeleton-line" style={{ width: 44 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <div>No teams found{query ? ` for "${query}"` : ''}</div>
        </div>
      ) : (
        <div className="card-list" ref={listRef}>
          {filtered.map((t, idx) => (
            <div key={t.number} style={{ position: 'relative' }}>
              {top100 && (
                <span style={{
                  position: 'absolute', top: 8, right: 8, zIndex: 1,
                  fontSize: '0.65rem', fontWeight: 800,
                  padding: '2px 7px', borderRadius: 5,
                  background: 'rgba(251,191,36,0.12)',
                  color: '#fbbf24',
                  border: '1px solid rgba(251,191,36,0.25)',
                  pointerEvents: 'none',
                }}>
                  #{idx + 1}
                </span>
              )}
              <TeamCard team={t} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
