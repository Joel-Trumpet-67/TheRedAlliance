import { Link } from 'react-router-dom';
import type { Team } from '../data/mockData';

interface Props {
  team: Team;
}

export function TeamCard({ team }: Props) {
  return (
    <div className="card">
      <Link to={`/teams/${team.number}`} className="card-link">
        <div className="team-card">
          <div className="team-number-badge">{team.number}</div>
          <div className="team-info">
            <div className="team-name">{team.name}</div>
            <div className="team-location">
              {[team.city, team.state, team.country].filter(Boolean).join(', ')}
              {team.rookie_year ? ` · Since ${team.rookie_year}` : ''}
            </div>
          </div>
          <div className="team-record">
            <div className="record-text">{team.wins}-{team.losses}-{team.ties}</div>
            {team.epa != null && (
              <div style={{ fontSize: '0.72rem', color: 'var(--red-400)', marginTop: 2, fontWeight: 600 }}>
                EPA {team.epa.toFixed(0)}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
