import { Link } from 'react-router-dom';
import type { Event } from '../data/mockData';

interface Props {
  event: Event;
}

function badgeClass(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('championship')) return 'championship';
  if (t.includes('district championship')) return 'district-championship';
  if (t.includes('district')) return 'district';
  return 'regional';
}

function formatDate(start: string, end: string): string {
  const s = new Date(start + 'T12:00:00');
  const e = new Date(end + 'T12:00:00');
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString('en-US', opts)} – ${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}, ${e.getFullYear()}`;
}

export function EventCard({ event }: Props) {
  return (
    <div className="card">
      <Link to={`/events/${event.key}`} className="card-link">
        <div className="event-card">
          <span className={`event-badge ${badgeClass(event.event_type)}`}>
            {event.event_type}
          </span>
          <div className="event-name">{event.name}</div>
          <div className="event-location">{event.city}, {event.state}, {event.country}</div>
          <div className="event-dates">{formatDate(event.start_date, event.end_date)}</div>
          <div className="event-teams-count">{event.teams.length} teams</div>
        </div>
      </Link>
    </div>
  );
}
