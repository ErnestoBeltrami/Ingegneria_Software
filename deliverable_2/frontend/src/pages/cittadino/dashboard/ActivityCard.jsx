import { Clock as ClockIcon, Check as CheckIcon, AlertCircle as ExpiredIcon } from 'lucide-react';
import './ActivityCard.css';

const TYPE_BADGE_STYLES = {
    Votazione: { bg: '#EEF0FA', color: '#3949AB' },
    Sondaggio: { bg: '#FEF3E2', color: '#C56A00' },
}

const BUTTON_LABELS = {
    Votazione: 'Vota',
    Sondaggio: 'Rispondi',
    Proposta: 'Sostieni',
}

const STATO_LABELS = {
    attivo: 'Attivo',
    concluso: 'Concluso',
    archiviato: 'Archiviato',
}

export function ActivityCard({ activity, onAction }) {
    const { id, type, title, description, deadline, voted, stato } = activity;
    const badgeStyle = TYPE_BADGE_STYLES[type] ?? TYPE_BADGE_STYLES.Votazione;
    const isConcluded = stato === 'concluso' || stato === 'archiviato';
    const isDisabled = voted || isConcluded;

    return (
        <div className={`cd-activity-card ${isDisabled ? 'voted' : ''}`}>
            <div className="cd-card-meta">
                <span className="cd-badge" style={{ background: badgeStyle.bg, color: badgeStyle.color }}>
                    {type}
                </span>
                <span className={`cd-card-stato ${isConcluded ? 'cd-stato-concluded' : 'cd-stato-active'}`}>
                    {isConcluded ? <ExpiredIcon /> : <ClockIcon />}
                    {STATO_LABELS[stato] || stato}
                </span>
            </div>

            <p className="cd-card-title">{title}</p>

            {description && (
                <p className="cd-card-description">{description}</p>
            )}

            <div className="cd-card-footer">
                <span className="cd-deadline">
                    <CheckIcon />
                    Termine: {deadline}
                </span>
                <button
                    className={`cd-btn-action ${isDisabled ? 'btn-voted' : ''}`}
                    disabled={isDisabled}
                    onClick={() => onAction(id)}
                >
                    {voted
                        ? 'Votato'
                        : isConcluded
                            ? 'Chiuso'
                            : (BUTTON_LABELS[type] ?? 'Partecipa')}
                </button>
            </div>
        </div>
    )
}
