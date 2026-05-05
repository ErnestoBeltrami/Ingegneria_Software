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
        <div className={`activity-card ${isDisabled ? 'voted' : ''}`}>
            <div className="card-meta">
                <span className="badge" style={{ background: badgeStyle.bg, color: badgeStyle.color }}>
                    {type}
                </span>
                <span className={`card-stato ${isConcluded ? 'stato-concluded' : 'stato-active'}`}>
                    {isConcluded ? <ExpiredIcon /> : <ClockIcon />}
                    {STATO_LABELS[stato] || stato}
                </span>
            </div>

            <p className="card-title">{title}</p>

            {description && (
                <p className="card-description">{description}</p>
            )}

            <div className="card-footer">
                <span className="deadline">
                    <CheckIcon />
                    Termine: {deadline}
                </span>
                <button
                    className={`btn-action ${isDisabled ? 'btn-voted' : ''}`}
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