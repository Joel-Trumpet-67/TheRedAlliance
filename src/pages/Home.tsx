import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teams, events } from '../data/mockData';
import { EventCard } from '../components/EventCard';
import { TeamCard } from '../components/TeamCard';

export function Home() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = localStorage.getItem('install-banner-dismissed');
    if (isIOS && !isStandalone && !dismissed) {
      setShowBanner(true);
    }
  }, []);

  const upcomingEvents = [...events]
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 3);

  const topTeams = [...teams]
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 5);

  return (
    <div className="page">
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
          >
            ✕
          </button>
        </div>
      )}

      <div className="hero">
        <div className="hero-title">The Red Alliance</div>
        <div className="hero-subtitle">FIRST Robotics Competition · 2025 Season</div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{teams.length}</div>
            <div className="hero-stat-label">Teams</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{events.length}</div>
            <div className="hero-stat-label">Events</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">
              {teams.reduce((s, t) => s + t.wins + t.losses + t.ties, 0)}
            </div>
            <div className="hero-stat-label">Matches</div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div className="section-title">Upcoming Events</div>
          <Link to="/events" style={{ fontSize: '0.82rem', color: 'var(--red-400)', fontWeight: 500 }}>
            View all →
          </Link>
        </div>
        <div className="card-list">
          {upcomingEvents.map(e => (
            <EventCard key={e.key} event={e} />
          ))}
        </div>
      </div>

      {/* Top Teams */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div className="section-title">Top Teams by Wins</div>
          <Link to="/teams" style={{ fontSize: '0.82rem', color: 'var(--red-400)', fontWeight: 500 }}>
            View all →
          </Link>
        </div>
        <div className="card-list">
          {topTeams.map(t => (
            <TeamCard key={t.number} team={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
