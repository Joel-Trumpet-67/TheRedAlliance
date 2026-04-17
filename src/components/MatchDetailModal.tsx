import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import anime from 'animejs';
import type { Match } from '../data/mockData';
import { fetchMatch, type SBMatch } from '../api/statbotics';

interface Props {
  match:    Match | null;
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

export function MatchDetailModal({ match, onClose }: Props) {
  const [detail,  setDetail]  = useState<SBMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Animate in
  useEffect(() => {
    if (!match || !sheetRef.current) return;
    anime({
      targets: sheetRef.current,
      translateY: ['100%', '0%'],
      duration: 340,
      easing: 'cubicBezier(0.32, 0.72, 0, 1)',
    });
  }, [match]);

  // Fetch breakdown from Statbotics
  useEffect(() => {
    if (!match) { setDetail(null); return; }
    setLoading(true);
    fetchMatch(match.key).then(d => {
      setDetail(d);
      setLoading(false);
    });
  }, [match?.key]);

  if (!match) return null;

  const label = match.comp_level === 'qm'
    ? `Qual ${match.match_number}`
    : match.comp_level === 'f'
    ? `Final ${match.match_number}`
    : `${match.comp_level.toUpperCase()} ${match.set_number}-${match.match_number}`;

  const redWon  = match.winning_alliance === 'red';
  const blueWon = match.winning_alliance === 'blue';

  function close() {
    if (!sheetRef.current) { onClose(); return; }
    anime({
      targets: sheetRef.current,
      translateY: ['0%', '100%'],
      duration: 260,
      easing: 'easeInQuad',
      complete: onClose,
    });
  }

  return (
    <>
      <div className="modal-overlay" onClick={close} />
      <div className="modal-sheet" ref={sheetRef} style={{ transform: 'translateY(100%)' }}>
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

        {loading && (
          <div className="modal-loading">Loading breakdown…</div>
        )}

        {detail && (
          <>
            {/* Score breakdown */}
            <div className="mbd-section-title">Score Breakdown</div>
            <div className="mbd-card">
              <Row label="Total"    red={detail.red.score}    blue={detail.blue.score}
                   redClass={redWon ? 'strong' : ''} blueClass={blueWon ? 'strong' : ''} />
              <Row label="Auto"     red={detail.red.auto}     blue={detail.blue.auto} />
              <Row label="Teleop"   red={detail.red.teleop}   blue={detail.blue.teleop} />
              <Row label="Endgame"  red={detail.red.endgame}  blue={detail.blue.endgame} />
              <Row label="Fouls +"  red={detail.red.fouls}    blue={detail.blue.fouls}
                   redClass="muted" blueClass="muted" />
            </div>

            {/* Ranking points (qual matches only) */}
            {match.comp_level === 'qm' && (
              <>
                <div className="mbd-section-title">Ranking Points</div>
                <div className="mbd-card">
                  <RpRow label="RP 1" redEarned={detail.red.rp_1 === 1} blueEarned={detail.blue.rp_1 === 1} />
                  <RpRow label="RP 2" redEarned={detail.red.rp_2 === 1} blueEarned={detail.blue.rp_2 === 1} />
                  <RpRow label="Win"  redEarned={redWon}                 blueEarned={blueWon} />
                </div>
              </>
            )}

            {/* EPA projections */}
            {detail.epa && (
              <>
                <div className="mbd-section-title">EPA Projections</div>
                <div className="mbd-card">
                  <Row label="Predicted Score"
                       red={detail.epa.red.total_points.mean.toFixed(1)}
                       blue={detail.epa.blue.total_points.mean.toFixed(1)} />
                  <Row label="Auto"
                       red={detail.epa.red.auto_points.mean.toFixed(1)}
                       blue={detail.epa.blue.auto_points.mean.toFixed(1)} />
                  <Row label="Teleop"
                       red={detail.epa.red.teleop_points.mean.toFixed(1)}
                       blue={detail.epa.blue.teleop_points.mean.toFixed(1)} />
                  <Row label="Endgame"
                       red={detail.epa.red.endgame_points.mean.toFixed(1)}
                       blue={detail.epa.blue.endgame_points.mean.toFixed(1)} />
                  <Row label="Win Probability"
                       red={`${(detail.epa.win_prob * 100).toFixed(0)}%`}
                       blue={`${((1 - detail.epa.win_prob) * 100).toFixed(0)}%`} />
                  <Row label="Std Dev"
                       red={`±${detail.epa.red.total_points.sd.toFixed(1)}`}
                       blue={`±${detail.epa.blue.total_points.sd.toFixed(1)}`}
                       redClass="muted" blueClass="muted" />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
