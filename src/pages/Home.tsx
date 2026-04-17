import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import anime from 'animejs';
import { events } from '../data/mockData';
import { EventCard } from '../components/EventCard';
import { TeamCard } from '../components/TeamCard';
import { usePageEntrance } from '../hooks/usePageEntrance';
import { useStagger } from '../hooks/useStagger';
import { useCountUp } from '../hooks/useCountUp';
import { useScrollReveal } from '../hooks/useScrollReveal';
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

  const heroRef    = useRef<HTMLDivElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  const eventsHeaderRef = useScrollReveal();
  const teamsHeaderRef  = useScrollReveal({ delay: 60 });

  // Hide subtitle before paint so it can fade in after chars
  useLayoutEffect(() => {
    if (subtitleRef.current) subtitleRef.current.style.opacity = '0';
  }, []);

  // Split hero title into chars and stagger-animate them in
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const text = el.textContent ?? '';
    const words = text.trim().split(' ');
    el.innerHTML = words.map(word => {
      const chars = word.split('').map(ch =>
        `<span class="hero-char">${ch}</span>`
      ).join('');
      return `<span class="hero-word">${chars}</span>`;
    }).join('<span style="display:inline-block;width:0.28em"></span>');

    const charCount = text.replace(/ /g, '').length;

    anime({
      targets: el.querySelectorAll('.hero-char'),
      opacity: [0, 1],
      translateY: [28, 0],
      duration: 600,
      delay: anime.stagger(28, { start: 260 }),
      easing: 'easeOutQuart',
    });

    // Subtitle fades in after chars land
    anime({
      targets: subtitleRef.current,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 480,
      delay: 260 + charCount * 28 + 80,
      easing: 'easeOutCubic',
    });
  }, []);

  // Mousemove parallax on hero orbs
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      hero.querySelectorAll<HTMLElement>('.hero-orb').forEach(orb => {
        const depth = parseFloat(orb.dataset.depth ?? '0.03');
        anime({
          targets: orb,
          translateX: (e.clientX - cx) * depth,
          translateY: (e.clientY - cy) * depth,
          duration: 1200,
          easing: 'easeOutQuad',
        });
      });
    };
    hero.addEventListener('mousemove', onMove);
    return () => hero.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const isIOS        = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed    = localStorage.getItem('install-banner-dismissed');
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

      <div className="hero" ref={heroRef}>
        {/* Ambient orbs — shift with mouse for subtle depth */}
        <div className="hero-orb hero-orb-1" data-depth="0.04"></div>
        <div className="hero-orb hero-orb-2" data-depth="-0.03"></div>

        <div className="hero-title" ref={titleRef}>The Red Alliance</div>
        <div className="hero-subtitle" ref={subtitleRef}>FIRST Robotics Competition · All Seasons</div>

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
        <div
          ref={eventsHeaderRef}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}
        >
          <div className="section-title">Upcoming Events</div>
          <Link to="/events" style={{ fontSize: '0.8rem', color: 'var(--red-400)', fontWeight: 600 }}>View all →</Link>
        </div>
        <div className="card-list" ref={eventsRef}>
          {upcomingEvents.map(e => <EventCard key={e.key} event={e} />)}
        </div>
      </div>

      {/* Top Teams */}
      <div>
        <div
          ref={teamsHeaderRef}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}
        >
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
