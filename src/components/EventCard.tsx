import { Link } from 'react-router-dom';
import type { Event } from '../data/mockData';

interface Props {
  event: Event;
}

function badgeClass(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('einstein'))             return 'championship';
  if (t.includes('district championship')) return 'district-championship';
  if (t.includes('championship'))         return 'championship';
  if (t.includes('district'))             return 'district';
  return 'regional';
}

function formatDate(start: string, end: string): string {
  const s = new Date(start + 'T12:00:00');
  const e = new Date(end   + 'T12:00:00');
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString('en-US', opts)} – ${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}, ${e.getFullYear()}`;
}

function statusDot(status?: string) {
  if (!status) return null;
  const s = status.toLowerCase();
  const color = s === 'in progress' ? '#4ade80' : s === 'upcoming' ? '#facc15' : 'var(--text-muted)';
  if (s === 'completed') return null;
  return (
    <span style={{
      display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
      background: color, marginRight: 5, verticalAlign: 'middle',
      boxShadow: `0 0 6px ${color}`,
    }} />
  );
}

export function EventCard({ event }: Props) {
  const location = [event.state, event.country].filter(Boolean).join(', ');
  const teamCount = event.num_teams ?? event.teams.length;

  return (
    <div className="card">
      <Link to={`/events/${event.key}`} className="card-link">
        <div className="event-card">
          <span className={`event-badge ${badgeClass(event.event_type)}`}>
            {event.event_type}
          </span>
          <div className="event-name">{event.name}</div>
          <div className="event-location">{location}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <div className="event-dates">{formatDate(event.start_date, event.end_date)}</div>
            <div className="event-teams-count">
              {statusDot(event.status)}
              {teamCount > 0 ? `${teamCount} teams` : ''}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
