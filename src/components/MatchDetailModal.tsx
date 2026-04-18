import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import type { Match } from '../data/mockData';
import { parseTBAAllianceBreakdown, type TBAMatch } from '../api/tba';
import { useTeams } from '../context/TeamsContext';

interface Props {
  match:    Match | null;
  tbaMatch: TBAMatch | null;
  onClose:  () => void;
}

function Row({ label, red, blue, redClass = '', blueClass = '' }: {
  label: string; red: string | number; blue: string | number;
  redClass?: string; blueClass?: string;
}) {
  return (
    <div className="mbd-row">
      <span className={`mbd-val red ${redClass}`}>{red}</span>
      <span className="mbd-label">{label}</span>
      <span className={`mbd-val blue ${blueClass}`}>{blue}</span>
    </div>
  );
}


export function MatchDetailModal({ match, tbaMatch, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { teams } = useTeams();

  useEffect(() => {
    if (!match) return;
    const raf = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(raf);
  }, [match]);

  if (!match) return null;

  const label = match.comp_level === 'qm'
    ? `Qual ${match.match_number}`
    : match.comp_level === 'f'
    ? `Final ${match.match_number}`
    : `${match.comp_level.toUpperCase()} ${match.set_number}-${match.match_number}`;

  const redWon  = match.winning_alliance === 'red';
  const blueWon = match.winning_alliance === 'blue';

  function close() {
    setIsOpen(false);
    setTimeout(onClose, 320);
  }

  // ── EPA-based projected scores ────────────────────────────────────────────
  // Each team's EPA = their average scoring contribution per match.
  // Alliance projected score = sum of each robot's EPA.
  function allianceProjection(alliance: number[]): number | null {
    const epas = alliance.map(num => teams.find(t => t.number === num)?.epa ?? null);
    if (epas.every(e => e == null)) return null;
    return Math.round(epas.reduce<number>((s, e) => s + (e ?? 0), 0));
  }

  const redProjected  = match.red_score  == null ? allianceProjection(match.red_alliance)  : null;
  const blueProjected = match.blue_score == null ? allianceProjection(match.blue_alliance) : null;

  // ── TBA score breakdown ───────────────────────────────────────────────────
  const bd = tbaMatch?.score_breakdown;
  const redBd  = bd ? parseTBAAllianceBreakdown(bd.red)  : null;
  const blueBd = bd ? parseTBAAllianceBreakdown(bd.blue) : null;

  // ── Individual EPA rows for upcoming matches ──────────────────────────────
  function EpaRows({ alliance, color }: { alliance: number[]; color: 'red' | 'blue' }) {
    const rows = alliance.map(num => {
      const t = teams.find(t => t.number === num);
      return { num, epa: t?.epa ?? null, name: t?.name };
    });
    if (rows.every(r => r.epa == null)) return null;
    return (
      <div className="mbd-card" style={{ marginTop: '0.5rem' }}>
        {rows.map(({ num, epa }) => (
          <div key={num} className="mbd-row">
            <span className={`mbd-val ${color}`} style={{ fontSize: '0.78rem' }}>
              {color === 'red' ? (epa != null ? `+${Math.round(epa)}` : '—') : ''}
            </span>
            <span className="mbd-label">
              <Link to={`/teams/${num}`} onClick={close} style={{ color: 'inherit' }}>{num}</Link>
            </span>
            <span className={`mbd-val ${color}`} style={{ fontSize: '0.78rem' }}>
              {color === 'blue' ? (epa != null ? `+${Math.round(epa)}` : '—') : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return createPortal(
    <>
      <div className="modal-overlay" onClick={close} />
      <div ref={sheetRef} className={`modal-sheet${isOpen ? ' open' : ''}`}>
        <div className="modal-handle" />

        {/* Header */}
        <div className="modal-header">
          <span className="modal-title">{label}</span>
          <button className="modal-close" onClick={close}>✕</button>
        </div>

        {/* Alliance scores */}
        <div className="modal-alliances">
          <div className={`modal-alliance-block red${redWon ? ' winner' : ''}`}>
            <div className="modal-alliance-teams">
              {match.red_alliance.map(t => (
                <Link key={t} to={`/teams/${t}`} onClick={close} className="modal-team red">{t}</Link>
              ))}
            </div>
            <div className="modal-big-score">
              {match.red_score ?? (redProjected != null ? `~${redProjected}` : '–')}
            </div>
            {redProjected != null && (
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>projected</div>
            )}
          </div>

          <div className="modal-vs">vs</div>

          <div className={`modal-alliance-block blue${blueWon ? ' winner' : ''}`}>
            <div className="modal-big-score">
              {match.blue_score ?? (blueProjected != null ? `~${blueProjected}` : '–')}
            </div>
            {blueProjected != null && (
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>projected</div>
            )}
            <div className="modal-alliance-teams right">
              {match.blue_alliance.map(t => (
                <Link key={t} to={`/teams/${t}`} onClick={close} className="modal-team blue">{t}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Completed match — TBA score breakdown */}
        {redBd && blueBd && (
          <>
            <div className="mbd-section-title">Score Breakdown</div>
            <div className="mbd-card">
              <Row label="Total"   red={match.red_score ?? 0}  blue={match.blue_score ?? 0}
                   redClass={redWon ? 'strong' : ''} blueClass={blueWon ? 'strong' : ''} />
              <Row label="Auto"    red={redBd.auto}    blue={blueBd.auto} />
              <Row label="Teleop"  red={redBd.teleop}  blue={blueBd.teleop} />
              <Row label="Endgame" red={redBd.endgame} blue={blueBd.endgame} />
              {(redBd.foul > 0 || blueBd.foul > 0) && (
                <Row label="Fouls +" red={redBd.foul} blue={blueBd.foul}
                     redClass="muted" blueClass="muted" />
              )}
            </div>
          </>
        )}

        {/* Upcoming match — EPA projection per robot */}
        {match.red_score == null && (redProjected != null || blueProjected != null) && (
          <>
            <div className="mbd-section-title">EPA Projection · Per Robot</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <EpaRows alliance={match.red_alliance}  color="red" />
              <EpaRows alliance={match.blue_alliance} color="blue" />
            </div>
          </>
        )}
      </div>
    </>,
    document.body
  );
}
