import { useState } from 'react';
import { useEvents } from '../context/EventsContext';
import { usePinnedEvents } from '../context/PinnedEventsContext';
import { EventCard } from '../components/EventCard';
import { usePageEntrance } from '../hooks/usePageEntrance';
import { useStagger } from '../hooks/useStagger';

type FilterType = 'all' | 'regional' | 'district' | 'championship';

const YEARS = [2026, 2025, 2024, 2023, 2022, 2019, 2018];

export function Events() {
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const { events, loading, year, setYear } = useEvents();
  const { pinned } = usePinnedEvents();
  const pageRef = usePageEntrance();

  const filtered = events.filter(e => {
    const q = query.toLowerCase();
    const matchesQuery = !q ||
      e.name.toLowerCase().includes(q) ||
      e.state.toLowerCase().includes(q) ||
      e.country.toLowerCase().includes(q);

    const t = e.event_type.toLowerCase();
    const matchesFilter =
      filter === 'all' ||
      (filter === 'regional'     && t === 'regional') ||
      (filter === 'district'     && (t === 'district' || t === 'district championship')) ||
      (filter === 'championship' && (t.includes('championship') || t.includes('einstein')));

    return matchesQuery && matchesFilter;
  });

  const listRef = useStagger<HTMLDivElement>([loading, filter, query, year]);

  return (
    <div className="page" ref={pageRef}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Events</h1>
        {loading ? (
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading…</span>
        ) : (
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {filtered.length} of {events.length}
          </span>
        )}
      </div>

      {/* Year selector */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {YEARS.map(y => (
          <button
            key={y}
            className={`tab-btn${year === y ? ' active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
            onClick={() => setYear(y)}
          >
            {y}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search-input"
          type="search"
          placeholder="Search by name or state…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="tabs">
        {(['all', 'regional', 'district', 'championship'] as FilterType[]).map(f => (
          <button
            key={f}
            className={`tab-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Pinned events — shown above the main list when any are pinned */}
      {!loading && pinned.size > 0 && (() => {
        const pinnedEvents = events.filter(e => pinned.has(e.key));
        if (pinnedEvents.length === 0) return null;
        return (
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="section-title" style={{ marginBottom: '0.4rem' }}>Pinned</div>
            <div className="card-list">
              {pinnedEvents.map(e => <EventCard key={e.key} event={e} />)}
            </div>
          </div>
        );
      })()}

      {loading ? (
        <div className="card-list">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="card skeleton-card">
              <div style={{ padding: '0.9rem 1rem' }}>
                <div className="skeleton skeleton-line" style={{ width: '25%', marginBottom: 8 }} />
                <div className="skeleton skeleton-line" style={{ width: '65%', height: 18, marginBottom: 6 }} />
                <div className="skeleton skeleton-line" style={{ width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div>No events found</div>
        </div>
      ) : (
        <div className="card-list" ref={listRef}>
          {filtered.map(e => <EventCard key={e.key} event={e} />)}
        </div>
      )}
    </div>
  );
}
