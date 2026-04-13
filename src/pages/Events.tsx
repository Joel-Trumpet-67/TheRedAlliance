import { useState } from 'react';
import { events } from '../data/mockData';
import { EventCard } from '../components/EventCard';

type FilterType = 'all' | 'regional' | 'district' | 'championship';

export function Events() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = events.filter(e => {
    const q = query.toLowerCase();
    const matchesQuery = !q ||
      e.name.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.state.toLowerCase().includes(q);

    const t = e.event_type.toLowerCase();
    const matchesFilter =
      filter === 'all' ||
      (filter === 'regional' && t === 'regional') ||
      (filter === 'district' && (t === 'district' || t === 'district championship')) ||
      (filter === 'championship' && t === 'championship');

    return matchesQuery && matchesFilter;
  }).sort((a, b) => a.start_date.localeCompare(b.start_date));

  return (
    <div className="page">
      <h1 className="page-title">Events</h1>

      <div className="search-bar">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search-input"
          type="search"
          placeholder="Search events…"
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

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div>No events found</div>
        </div>
      ) : (
        <div className="card-list">
          {filtered.map(e => <EventCard key={e.key} event={e} />)}
        </div>
      )}
    </div>
  );
}
