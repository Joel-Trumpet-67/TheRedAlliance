import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">R</div>
          The Red Alliance
        </Link>
        <div className="navbar-nav">
          <Link to="/" className={`nav-link${path === '/' ? ' active' : ''}`}>Home</Link>
          <Link to="/teams" className={`nav-link${path.startsWith('/teams') ? ' active' : ''}`}>Teams</Link>
          <Link to="/events" className={`nav-link${path.startsWith('/events') ? ' active' : ''}`}>Events</Link>
        </div>
      </div>
    </nav>
  );
}

export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <Link to="/" className={`bottom-nav-item${path === '/' ? ' active' : ''}`}>
          <HomeIcon />
          Home
        </Link>
        <Link to="/teams" className={`bottom-nav-item${path.startsWith('/teams') ? ' active' : ''}`}>
          <TeamIcon />
          Teams
        </Link>
        <Link to="/events" className={`bottom-nav-item${path.startsWith('/events') ? ' active' : ''}`}>
          <EventIcon />
          Events
        </Link>
      </div>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function EventIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
