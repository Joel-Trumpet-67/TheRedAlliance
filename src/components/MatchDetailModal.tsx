import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import type { Match } from '../data/mockData';
import type { TBAMatch } from '../api/tba';
import { useTeams } from '../context/TeamsContext';

interface Props {
  match:      Match | null;
  tbaMatch:   TBAMatch | null;
  eventName?: string;
  onClose:    () => void;
}

// camelCase → readable label, optionally stripping a known prefix
function fmtLabel(key: string, stripPrefix = ''): string {
  let s = stripPrefix && key.toLowerCase().startsWith(stripPrefix.toLowerCase())
    ? key.slice(stripPrefix.length)
    : key;
  if (!s) s = key;
  return s
    .replace(/([A-Z])/g, ' $1')
    .replace(/(\d+)/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim() || key;
}

function fmtVal(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
}

const SKIP   = new Set(['tba_gameData', 'coopertitionBonus', 'coopertitionCriteriaMet']);
const FOOTER = ['foulCount', 'techFoulCount', 'foulPoints', 'adjustPoints', 'totalPoints', 'rp'];

type BdRow =
  | { kind: 'section'; label: string }
  | { kind: 'row'; label: string; red: string; blue: string; bold?: 'red' | 'blue' | 'both' };

function buildBreakdown(
  redRaw: Record<string, unknown>,
  blueRaw: Record<string, unknown>,
  redWon: boolean,
  blueWon: boolean,
): BdRow[] {
  const rows: BdRow[] = [];
  const allKeys = [...new Set([...Object.keys(redRaw), ...Object.keys(blueRaw)])];
  const seen = new Set<string>();

  const SECTIONS = [
    { prefix: 'auto',    label: 'Auto'    },
    { prefix: 'teleop',  label: 'Teleop'  },
    { prefix: 'endGame', label: 'Endgame' },
  ];

  for (const { prefix, label } of SECTIONS) {
    const keys = allKeys.filter(k =>
      k.toLowerCase().startsWith(prefix.toLowerCase()) &&
      !SKIP.has(k) && !FOOTER.includes(k) && !seen.has(k)
    );
    if (!keys.length) continue;
    rows.push({ kind: 'section', label });
    for (const k of keys) {
      rows.push({ kind: 'row', label: fmtLabel(k, prefix), red: fmtVal(redRaw[k]), blue: fmtVal(blueRaw[k]) });
      seen.add(k);
    }
  }

  // Remaining non-footer keys
  for (const k of allKeys.filter(k => !seen.has(k) && !SKIP.has(k) && !FOOTER.includes(k))) {
    rows.push({ kind: 'row', label: fmtLabel(k), red: fmtVal(redRaw[k]), blue: fmtVal(blueRaw[k]) });
  }

  // Footer
  const footerKeys = FOOTER.filter(k => k in redRaw);
  if (footerKeys.length) {
    rows.push({ kind: 'section', label: 'Final' });
    for (const k of footerKeys) {
      if (k === 'rp') {
        rows.push({
          kind: 'row', label: 'Ranking Points',
          red:  redRaw.rp  != null ? `+${redRaw.rp} RP`  : '—',
          blue: blueRaw.rp != null ? `+${blueRaw.rp} RP` : '—',
        });
      } else {
        rows.push({
          kind: 'row',
          label: fmtLabel(k),
          red:   fmtVal(redRaw[k]),
          blue:  fmtVal(blueRaw[k]),
          bold:  k === 'totalPoints' ? (redWon && blueWon ? 'both' : redWon ? 'red' : blueWon ? 'blue' : undefined) : undefined,
        });
      }
    }
  }

  return rows;
}

export function MatchDetailModal({ match, tbaMatch, eventName, onClose }: Props) {
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

  function allianceEPA(alliance: number[]): number | null {
    const epas = alliance.map(n => teams.find(t => t.number === n)?.epa ?? null);
    if (epas.every(e => e == null)) return null;
    return Math.round(epas.reduce<number>((s, e) => s + (e ?? 0), 0));
  }

  const redProjected  = match.red_score  == null ? allianceEPA(match.red_alliance)  : null;
  const blueProjected = match.blue_score == null ? allianceEPA(match.blue_alliance) : null;

  const bd      = tbaMatch?.score_breakdown;
  const redRaw  = bd?.red  as Record<string, unknown> | undefined;
  const blueRaw = bd?.blue as Record<string, unknown> | undefined;
  const bdRows  = redRaw && blueRaw ? buildBreakdown(redRaw, blueRaw, redWon, blueWon) : [];

  function EpaRows({ alliance, color }: { alliance: number[]; color: 'red' | 'blue' }) {
    const rows = alliance.map(n => ({ n, epa: teams.find(t => t.number === n)?.epa ?? null }));
    if (rows.every(r => r.epa == null)) return null;
    return (
      <div className="mbd-card" style={{ marginTop: '0.5rem' }}>
        {rows.map(({ n, epa }) => (
          <div key={n} className="mbd-row">
            <span className={`mbd-val ${color}`} style={{ fontSize: '0.78rem' }}>
              {color === 'red' ? (epa != null ? `~${Math.round(epa)}` : '—') : ''}
            </span>
            <span className="mbd-label">
              <Link to={`/teams/${n}`} onClick={close} style={{ color: 'inherit' }}>{n}</Link>
            </span>
            <span className={`mbd-val ${color}`} style={{ fontSize: '0.78rem' }}>
              {color === 'blue' ? (epa != null ? `~${Math.round(epa)}` : '—') : ''}
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
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="modal-title">{label}</div>
            {eventName && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {eventName}
              </div>
            )}
          </div>
          <button className="modal-close" onClick={close}>✕</button>
        </div>

        {/* Teams + scores table */}
        <div className="mbd-teams-table">
          <div className="mbd-teams-col red">
            {match.red_alliance.map(t => (
              <Link key={t} to={`/teams/${t}`} onClick={close} className="mbd-team-num red">{t}</Link>
            ))}
          </div>
          <div className="mbd-score-col">
            <div className={`mbd-score red${redWon ? ' winner' : ''}`}>
              {match.red_score ?? (redProjected != null ? `~${redProjected}` : '–')}
            </div>
            <div className="mbd-score-sep">–</div>
            <div className={`mbd-score blue${blueWon ? ' winner' : ''}`}>
              {match.blue_score ?? (blueProjected != null ? `~${blueProjected}` : '–')}
            </div>
            {(redProjected != null || blueProjected != null) && (
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 3 }}>
                projected
              </div>
            )}
          </div>
          <div className="mbd-teams-col blue">
            {match.blue_alliance.map(t => (
              <Link key={t} to={`/teams/${t}`} onClick={close} className="mbd-team-num blue">{t}</Link>
            ))}
          </div>
        </div>

        {/* Detailed results */}
        {bdRows.length > 0 && (
          <>
            <div className="mbd-section-title">Detailed Results</div>
            <div className="mbd-card">
              {bdRows.map((row, i) =>
                row.kind === 'section' ? (
                  <div key={i} className="mbd-group-header">{row.label}</div>
                ) : (
                  <div key={i} className="mbd-row">
                    <span className={`mbd-val red${row.bold === 'red' || row.bold === 'both' ? ' strong' : ''}`}>{row.red}</span>
                    <span className="mbd-label">{row.label}</span>
                    <span className={`mbd-val blue${row.bold === 'blue' || row.bold === 'both' ? ' strong' : ''}`}>{row.blue}</span>
                  </div>
                )
              )}
            </div>
          </>
        )}

        {/* Upcoming — per-robot EPA projection */}
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
