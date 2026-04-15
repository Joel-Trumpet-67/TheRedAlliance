import { useState } from 'react';
import { teams } from '../data/mockData';
import { TeamCard } from '../components/TeamCard';
import { usePageEntrance } from '../hooks/usePageEntrance';
import { useStagger } from '../hooks/useStagger';

type SortKey = 'number' | 'wins' | 'awards';

export function Teams() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('wins');
  const pageRef = usePageEntrance();

  const filtered = teams
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
      if (sort === 'number') return a.number - b.number;
      if (sort === 'wins')   return b.wins - a.wins;
      return b.awards - a.awards;
    });

  const listRef = useStagger<HTMLDivElement>([filtered.length, sort, query]);

  return (
    <div className="page" ref={pageRef}>
      <h1 className="page-title">Teams</h1>

      <div className="search-bar">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search-input"
          type="search"
          placeholder="Search teams by number, name, or location…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="tabs" style={{ marginBottom: '1rem' }}>
        <button className={`tab-btn${sort === 'wins'   ? ' active' : ''}`} onClick={() => setSort('wins')}>By Wins</button>
        <button className={`tab-btn${sort === 'awards' ? ' active' : ''}`} onClick={() => setSort('awards')}>By Awards</button>
        <button className={`tab-btn${sort === 'number' ? ' active' : ''}`} onClick={() => setSort('number')}>By Number</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <div>No teams found for "{query}"</div>
        </div>
      ) : (
        <div className="card-list" ref={listRef}>
          {filtered.map(t => <TeamCard key={t.number} team={t} />)}
        </div>
      )}
    </div>
  );
}
