import { Link } from 'react-router-dom';
import type { Match } from '../data/mockData';
import { compLevelLabel } from '../data/mockData';

interface Props {
  match:          Match;
  highlightTeam?: number;
  onClick?:       (match: Match) => void;
}

export function MatchRow({ match, highlightTeam, onClick }: Props) {
  const redWon  = match.winning_alliance === 'red';
  const blueWon = match.winning_alliance === 'blue';

  const label = match.comp_level === 'qm'
    ? `Q${match.match_number}`
    : match.comp_level === 'f'
    ? `F${match.match_number}`
    : `${compLevelLabel[match.comp_level].slice(0, 2)}${match.set_number}M${match.match_number}`;

  return (
    <div
      className={`match-row${onClick ? ' clickable' : ''}`}
      onClick={onClick ? () => onClick(match) : undefined}
    >
      <div className="match-label">{label}</div>

      <div className="alliance-teams red">
        {match.red_alliance.map(t => (
          <Link
            key={t} to={`/teams/${t}`}
            className={`team-chip red${highlightTeam === t ? ' winner' : ''}`}
            onClick={e => e.stopPropagation()}
          >{t}</Link>
        ))}
      </div>

      <div className="match-scores">
        <div className={`score-box red${redWon ? ' winner' : ''}`}>{match.red_score ?? '–'}</div>
        <span className="score-separator">–</span>
        <div className={`score-box blue${blueWon ? ' winner' : ''}`}>{match.blue_score ?? '–'}</div>
      </div>

      <div className="alliance-teams blue">
        {match.blue_alliance.map(t => (
          <Link
            key={t} to={`/teams/${t}`}
            className={`team-chip blue${highlightTeam === t ? ' winner' : ''}`}
            onClick={e => e.stopPropagation()}
          >{t}</Link>
        ))}
      </div>

      {onClick && <div className="match-row-caret">›</div>}
    </div>
  );
}
