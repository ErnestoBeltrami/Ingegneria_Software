import { Clock as ClockIcon, Check as CheckIcon } from 'lucide-react';
import './ActivityCard.css';
const BADGE_STYLES = {
    Ambiente: { bg: '#EAF5EE', color: '#1A5C38' },
    Mobilità: { bg: '#EEF0FA', color: '#3949AB' },
    Salute: { bg: '#FEF3E2', color: '#C56A00' },
    Cultura: { bg: '#F5EEFB', color: '#7B2FA1' },
}

const BUTTON_LABELS = {
    Votazione: 'Vota',
    Sondaggio: 'Rispondi',
    Proposta: 'Sostieni',
}

export function ActivityCard({ activity, onAction }) {
    const { id, category, type, title, deadline, voted } = activity
    const badgeStyle = BADGE_STYLES[category] ?? BADGE_STYLES.Ambiente

    return (
        <div className={`activity-card ${voted ? 'voted' : ''}`}>
            <div className="card-meta">
                <span className="badge" style={{ background: badgeStyle.bg, color: badgeStyle.color }}>
                    {category}
                </span>
                <span className="card-type">
                    <ClockIcon />
                    {type}
                </span>
            </div>

            <p className="card-title">{title}</p>

            {/* card footer qui */}
            <div className="card-footer">
                <span className="deadline">
                    <CheckIcon />
                    Termine: {deadline}
                </span>
                <button
                    className={`btn-action ${voted ? 'btn-voted' : ''}`}
                    disabled={voted}
                    onClick={() => onAction(id)}
                >
                    {voted ? 'Votato' : (BUTTON_LABELS[type] ?? 'Partecipa')}
                </button>
            </div>
        </div>
    )
}