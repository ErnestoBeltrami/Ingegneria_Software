import { ClipboardList, Newspaper, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './QuickActionCard.css';

const CARDS = [
    {
        id: 'votazioni-concluse',
        icon: ClipboardList,
        title: 'Votazioni concluse',
        actionLabel: 'Visualizza',
        variant: 'light',
        iconBg: '#E8EDF5',
        iconColor: '#3949AB',
        to: '/cittadino/archivio?tipo=votazioni',
    },
    {
        id: 'sondaggi-conclusi',
        icon: ClipboardList,
        title: 'Sondaggi',
        actionLabel: 'Visualizza',
        variant: 'light',
        iconBg: '#E8EDF5',
        iconColor: '#3949AB',
        to: '/cittadino/archivio?tipo=sondaggi',
    },
    {
        id: 'bacheca-iniziative',
        icon: Newspaper,
        title: 'Bacheca iniziative',
        actionLabel: 'Esplora',
        variant: 'light',
        iconBg: '#D1E7DD',
        iconColor: '#007D54',
        to: '/cittadino/bacheca',
    },
];

export function QuickActionCards() {
    const navigate = useNavigate();

    return (
        <div className="quick-actions">
            {CARDS.map(card => (
                <QuickActionCard
                    key={card.id}
                    {...card}
                    onClick={card.to ? () => navigate(card.to) : undefined}
                />
            ))}
        </div>
    );
}

function QuickActionCard({ icon: Icon, title, actionLabel, variant, iconBg, iconColor, onClick }) {
    return (
        <button
            className={`quick-card ${variant === 'dark' ? 'quick-card--dark' : ''} ${!onClick ? 'quick-card--disabled' : ''}`}
            onClick={onClick}
            disabled={!onClick}
        >
            <div className="quick-card__icon" style={{ background: iconBg }}>
                <Icon size={24} color={iconColor} strokeWidth={2} />
            </div>
            <p className="quick-card__title">{title}</p>
            <span className="quick-card__action">
                {actionLabel}
                <ChevronRight size={18} />
            </span>
        </button>
    );
}
