import { Link } from 'react-router-dom';
import type { Match, Team } from '../data/mockData';

interface Series {
  id:        string;
  label:     string;
  level:     'qf' | 'sf' | 'f';
  set:       number;
  matches:   Match[];
  redTeams:  number[];
  blueTeams: number[];
  redWins:   number;
  blueWins:  number;
  winner?:   'red' | 'blue';
}

function buildSeries(matches: Match[]): { qf: Series[]; sf: Series[]; finals: Series[] } {
  const playoffs = matches.filter(m => m.comp_level !== 'qm');
  const map = new Map<string, Match[]>();
  for (const m of playoffs) {
    const k = `${m.comp_level}_${m.set_number}`;
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(m);
  }

  const all: Series[] = [];
  for (const [id, ms] of map) {
    const sorted   = [...ms].sort((a, b) => a.match_number - b.match_number);
    const first    = sorted[0];
    const level    = first.comp_level as 'qf' | 'sf' | 'f';
    const redWins  = sorted.filter(m => m.winning_alliance === 'red').length;
    const blueWins = sorted.filter(m => m.winning_alliance === 'blue').length;
    all.push({
      id,
      label: level === 'f' ? 'Finals' : `${level.toUpperCase()} ${first.set_number}`,
      level, set: first.set_number,
      matches: sorted,
      redTeams:  first.red_alliance,
      blueTeams: first.blue_alliance,
      redWins, blueWins,
      winner: redWins >= 2 ? 'red' : blueWins >= 2 ? 'blue' : undefined,
    });
  }

  return {
    qf:     all.filter(s => s.level === 'qf').sort((a, b) => a.set - b.set),
    sf:     all.filter(s => s.level === 'sf').sort((a, b) => a.set - b.set),
    finals: all.filter(s => s.level === 'f'),
  };
}

interface CardProps {
  series:        Series;
  teams:         Team[];
  highlightTeam: number;
  projectScore:  (a: number[]) => number | null;
  onMatchClick:  (m: Match) => void;
}

function SeriesCard({ series, highlightTeam, projectScore, onMatchClick }: CardProps) {
  const anyUnplayed = series.matches.some(m => m.red_score == null);
  const redProj     = anyUnplayed && !series.winner ? projectScore(series.redTeams)  : null;
  const blueProj    = anyUnplayed && !series.winner ? projectScore(series.blueTeams) : null;
  const played      = series.matches.filter(m => m.red_score != null);
  const pending     = series.matches.filter(m => m.red_score == null);
  const DOTS        = 3; // best-of-3

  function AllianceRow({ teams: ats, color, wins, proj }: {
    teams: number[]; color: 'red' | 'blue'; wins: number; proj: number | null;
  }) {
    const won  = series.winner === color;
    const lost = series.winner != null && !won;
    return (
      <div className={`bs-alliance ${color}${won ? ' winner' : lost ? ' loser' : ''}`}>
        <div className="bs-dots">
          {Array.from({ length: DOTS }, (_, i) => (
            <span key={i} className={`bs-dot${i < wins ? ` ${color}` : ''}`} />
          ))}
        </div>
        <div className="bs-teams">
          {ats.map(t => (
            <Link key={t} to={`/teams/${t}`}
              className={`bs-team${t === highlightTeam ? ' mine' : ''}`}>{t}</Link>
          ))}
        </div>
        {proj != null && <span className="bs-proj">~{proj}</span>}
      </div>
    );
  }

  return (
    <div className={`bs-card${series.winner ? ' done' : ''}`}>
      <div className="bs-header">
        <span className="bs-label">{series.label}</span>
        {series.winner ? (
          <span className={`bs-badge ${series.winner}`}>
            {series.redWins}–{series.blueWins}
          </span>
        ) : played.length > 0 ? (
          <span className="bs-badge ongoing">{series.redWins}–{series.blueWins}</span>
        ) : null}
      </div>

      <AllianceRow teams={series.redTeams}  color="red"  wins={series.redWins}  proj={redProj}  />
      <AllianceRow teams={series.blueTeams} color="blue" wins={series.blueWins} proj={blueProj} />

      {/* Per-match score chips (played) */}
      {played.length > 0 && (
        <div className="bs-match-scores">
          {played.map(m => (
            <button key={m.key} className="bs-score-btn" onClick={() => onMatchClick(m)}>
              <span className={`bss red${m.winning_alliance === 'red' ? ' w' : ''}`}>{m.red_score}</span>
              <span className="bss-sep">–</span>
              <span className={`bss blue${m.winning_alliance === 'blue' ? ' w' : ''}`}>{m.blue_score}</span>
            </button>
          ))}
          {pending.map((_, i) => (
            <span key={i} className="bs-score-btn pending">TBD</span>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  matches:       Match[];
  teams:         Team[];
  highlightTeam: number;
  onMatchClick:  (m: Match) => void;
}

export function PlayoffBracket({ matches, teams, highlightTeam, onMatchClick }: Props) {
  const { qf, sf, finals } = buildSeries(matches);

  if (!qf.length && !sf.length && !finals.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏆</div>
        <div>Playoffs haven't started yet</div>
      </div>
    );
  }

  function projectScore(alliance: number[]): number | null {
    const epas = alliance.map(n => teams.find(t => t.number === n)?.epa ?? null);
    if (epas.every(e => e == null)) return null;
    return Math.round(epas.reduce<number>((s, e) => s + (e ?? 0), 0));
  }

  const props = { teams, highlightTeam, projectScore, onMatchClick };

  return (
    <div className="bracket-wrap">
      {qf.length > 0 && (
        <section className="bracket-round">
          <div className="bracket-round-title">Quarterfinals</div>
          <div className="bracket-grid">
            {qf.map(s => <SeriesCard key={s.id} series={s} {...props} />)}
          </div>
        </section>
      )}
      {sf.length > 0 && (
        <section className="bracket-round">
          <div className="bracket-round-title">
            {sf.length > 2 ? 'Playoff Rounds' : 'Semifinals'}
          </div>
          <div className="bracket-grid">
            {sf.map(s => <SeriesCard key={s.id} series={s} {...props} />)}
          </div>
        </section>
      )}
      {finals.length > 0 && (
        <section className="bracket-round">
          <div className="bracket-round-title">Finals</div>
          {finals.map(s => <SeriesCard key={s.id} series={s} {...props} />)}
        </section>
      )}
    </div>
  );
}
