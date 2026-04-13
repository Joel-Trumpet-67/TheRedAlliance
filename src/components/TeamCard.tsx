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
            <div className="team-location">{team.city}, {team.state} · Since {team.rookie_year}</div>
          </div>
          <div className="team-record">
            <div className="record-text">{team.wins}-{team.losses}-{team.ties}</div>
            {team.awards > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: 2 }}>
                🏆 {team.awards}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
