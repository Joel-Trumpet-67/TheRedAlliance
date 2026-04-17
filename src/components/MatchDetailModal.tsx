import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Match } from '../data/mockData';
import type { SBMatch } from '../api/statbotics';

interface Props {
  match:    Match | null;
  sbMatch:  SBMatch | null;
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

function RpRow({ label, redEarned, blueEarned }: {
  label: string; redEarned: boolean; blueEarned: boolean;
}) {
  return (
    <div className="mbd-row">
      <span className={`rp-dot ${redEarned ? 'earned' : ''}`}>{redEarned ? '✓' : '✗'}</span>
      <span className="mbd-label">{label}</span>
      <span className={`rp-dot ${blueEarned ? 'earned' : ''}`}>{blueEarned ? '✓' : '✗'}</span>
    </div>
  );
}

export function MatchDetailModal({ match, sbMatch, onClose }: Props) {
  const sheetRef   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Open: trigger CSS transition on next frame so translateY(100%) is painted first
  useEffect(() => {
    if (!match) return;
    const raf = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(raf);
  }, [match]);

  if (!match) return null;

  const detail = sbMatch;

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

  return (
    <>
      <div ref={overlayRef} className="modal-overlay" onClick={close} />
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
            <div className="modal-big-score">{match.red_score ?? '–'}</div>
          </div>

          <div className="modal-vs">vs</div>

          <div className={`modal-alliance-block blue${blueWon ? ' winner' : ''}`}>
            <div className="modal-big-score">{match.blue_score ?? '–'}</div>
            <div className="modal-alliance-teams right">
              {match.blue_alliance.map(t => (
                <Link key={t} to={`/teams/${t}`} onClick={close} className="modal-team blue">{t}</Link>
              ))}
            </div>
          </div>
        </div>

        {detail?.result && (() => {
          const res  = detail.result!;
          const pred = detail.pred;
          const redFouls  = res.red_score  - res.red_no_foul;
          const blueFouls = res.blue_score - res.blue_no_foul;
          return (
            <>
              {/* Score breakdown */}
              <div className="mbd-section-title">Score Breakdown</div>
              <div className="mbd-card">
                <Row label="Total"   red={res.red_score}           blue={res.blue_score}
                     redClass={redWon ? 'strong' : ''} blueClass={blueWon ? 'strong' : ''} />
                <Row label="Auto"    red={res.red_auto_points}     blue={res.blue_auto_points} />
                <Row label="Teleop"  red={res.red_teleop_points}   blue={res.blue_teleop_points} />
                <Row label="Endgame" red={res.red_endgame_points}  blue={res.blue_endgame_points} />
                {(redFouls > 0 || blueFouls > 0) && (
                  <Row label="Fouls +" red={redFouls} blue={blueFouls} redClass="muted" blueClass="muted" />
                )}
              </div>

              {/* Ranking points (qual only) */}
              {match.comp_level === 'qm' && (
                <>
                  <div className="mbd-section-title">Ranking Points</div>
                  <div className="mbd-card">
                    <RpRow label="RP 1" redEarned={res.red_rp_1}  blueEarned={res.blue_rp_1} />
                    <RpRow label="RP 2" redEarned={res.red_rp_2}  blueEarned={res.blue_rp_2} />
                    {(res.red_rp_3 !== undefined) && (
                      <RpRow label="RP 3" redEarned={!!res.red_rp_3} blueEarned={!!res.blue_rp_3} />
                    )}
                    <RpRow label="Win"  redEarned={redWon}         blueEarned={blueWon} />
                  </div>
                </>
              )}

              {/* Predictions */}
              {pred && (
                <>
                  <div className="mbd-section-title">Predictions</div>
                  <div className="mbd-card">
                    <Row label="Predicted Score"
                         red={pred.red_score.toFixed(1)}
                         blue={pred.blue_score.toFixed(1)} />
                    <Row label="Win Probability"
                         red={`${(pred.red_win_prob * 100).toFixed(0)}%`}
                         blue={`${((1 - pred.red_win_prob) * 100).toFixed(0)}%`} />
                    <Row label="RP 1 Chance"
                         red={`${(pred.red_rp_1 * 100).toFixed(0)}%`}
                         blue={`${(pred.blue_rp_1 * 100).toFixed(0)}%`}
                         redClass="muted" blueClass="muted" />
                    <Row label="RP 2 Chance"
                         red={`${(pred.red_rp_2 * 100).toFixed(0)}%`}
                         blue={`${(pred.blue_rp_2 * 100).toFixed(0)}%`}
                         redClass="muted" blueClass="muted" />
                  </div>
                </>
              )}
            </>
          );
        })()}

        {/* Upcoming match — show predictions only */}
        {!detail?.result && detail?.pred && (() => {
          const pred = detail.pred!;
          return (
            <>
              <div className="mbd-section-title">Predictions</div>
              <div className="mbd-card">
                <Row label="Predicted Score"
                     red={pred.red_score.toFixed(1)}
                     blue={pred.blue_score.toFixed(1)} />
                <Row label="Win Probability"
                     red={`${(pred.red_win_prob * 100).toFixed(0)}%`}
                     blue={`${((1 - pred.red_win_prob) * 100).toFixed(0)}%`} />
                <Row label="RP 1 Chance"
                     red={`${(pred.red_rp_1 * 100).toFixed(0)}%`}
                     blue={`${(pred.blue_rp_1 * 100).toFixed(0)}%`}
                     redClass="muted" blueClass="muted" />
                <Row label="RP 2 Chance"
                     red={`${(pred.red_rp_2 * 100).toFixed(0)}%`}
                     blue={`${(pred.blue_rp_2 * 100).toFixed(0)}%`}
                     redClass="muted" blueClass="muted" />
              </div>
            </>
          );
        })()}
      </div>
    </>
  );
}
