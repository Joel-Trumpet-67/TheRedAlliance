import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { events } from '../data/mockData';
import { EventCard } from '../components/EventCard';
import { TeamCard } from '../components/TeamCard';
import { usePageEntrance } from '../hooks/usePageEntrance';
import { useStagger } from '../hooks/useStagger';
import { useCountUp } from '../hooks/useCountUp';
import { useTeams } from '../context/TeamsContext';

function AnimatedStat({ value, label }: { value: number; label: string }) {
  const count = useCountUp(value);
  return (
    <div className="hero-stat">
      <div className="hero-stat-value">{count.toLocaleString()}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}

export function Home() {
  const [showBanner, setShowBanner] = useState(false);
  const { teams, loading, count } = useTeams();
  const pageRef   = usePageEntrance();
  const eventsRef = useStagger<HTMLDivElement>([], { delay: 70 });
  const teamsRef  = useStagger<HTMLDivElement>([loading], { delay: 55 });

  useEffect(() => {
    const isIOS       = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed   = localStorage.getItem('install-banner-dismissed');
    if (isIOS && !isStandalone && !dismissed) setShowBanner(true);
  }, []);

  const totalMatches = teams.reduce((s, t) => s + t.wins + t.losses + t.ties, 0);

  const upcomingEvents = [...events]
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 3);

  const topTeams = [...teams]
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 5);

  return (
    <div className="page" ref={pageRef}>
      {showBanner && (
        <div className="install-banner">
          <span style={{ fontSize: '1.4rem' }}>📲</span>
          <div className="install-banner-text">
            <strong>Add to Home Screen</strong>
            Tap the Share button, then "Add to Home Screen" to install the app.
          </div>
          <button
            className="install-banner-close"
            onClick={() => {
              setShowBanner(false);
              localStorage.setItem('install-banner-dismissed', '1');
            }}
          >✕</button>
        </div>
      )}

      <div className="hero">
        <div className="hero-title">The Red Alliance</div>
        <div className="hero-subtitle">FIRST Robotics Competition · All Seasons</div>
        {loading ? (
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value loading-pulse">{count.toLocaleString()}</div>
              <div className="hero-stat-label">Teams loading…</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{events.length}</div>
              <div className="hero-stat-label">Events</div>
            </div>
          </div>
        ) : (
          <div className="hero-stats">
            <AnimatedStat value={teams.length}  label="Teams"   />
            <AnimatedStat value={events.length} label="Events"  />
            <AnimatedStat value={totalMatches}  label="Matches" />
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div className="section-title">Upcoming Events</div>
          <Link to="/events" style={{ fontSize: '0.8rem', color: 'var(--red-400)', fontWeight: 600 }}>View all →</Link>
        </div>
        <div className="card-list" ref={eventsRef}>
          {upcomingEvents.map(e => <EventCard key={e.key} event={e} />)}
        </div>
      </div>

      {/* Top Teams */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div className="section-title">Top Teams by Wins</div>
          <Link to="/teams" style={{ fontSize: '0.8rem', color: 'var(--red-400)', fontWeight: 600 }}>View all →</Link>
        </div>
        {loading ? (
          <div className="card-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card skeleton-card">
                <div className="team-card">
                  <div className="skeleton skeleton-badge" />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-line" style={{ width: '55%' }} />
                    <div className="skeleton skeleton-line" style={{ width: '40%', marginTop: 6 }} />
                  </div>
                  <div className="skeleton skeleton-line" style={{ width: 40 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-list" ref={teamsRef}>
            {topTeams.map(t => <TeamCard key={t.number} team={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}
