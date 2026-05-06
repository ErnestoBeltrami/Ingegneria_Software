import { ClipboardList, Newspaper, Lightbulb, ChevronRight } from 'lucide-react';
import './QuickActionCard.css';

/**
 * Card configuration for the 3 quick-action cards from Figma.
 * Each card links to a specific section/feature of the dashboard.
 */
const CARDS = [
    {
        id: 'votazioni-concluse',
        icon: ClipboardList,
        title: 'Votazioni concluse',
        actionLabel: 'Visualizza',
        variant: 'light',          // white card
        iconBg: '#E8EDF5',         // light blue-grey circle
        iconColor: '#3949AB',      // dark blue icon
        onClick: () => console.log('TODO: navigare a votazioni concluse'),
    },
    {
        id: 'sondaggi-conclusi',
        icon: ClipboardList,
        title: 'Sondaggi',
        actionLabel: 'Visualizza',
        variant: 'light',          
        iconBg: '#E8EDF5',         
        iconColor: '#3949AB',      
        onClick: () => console.log('TODO: navigare a sondaggi conclusi'),
    },
    {
        id: 'bacheca-iniziative',
        icon: Newspaper,
        title: 'Bacheca iniziative',
        actionLabel: 'Esplora',
        variant: 'light',          // white card
        iconBg: '#D1E7DD',         // light green circle
        iconColor: '#007D54',      // dark green icon
        onClick: () => console.log('TODO: navigare a bacheca iniziative'),
    },
    {
        id: 'proponi-idea',
        icon: Lightbulb,
        title: 'Proponi un\'idea',
        actionLabel: 'Crea proposta',
        variant: 'dark',           // dark green card
        iconBg: 'rgba(255,255,255,0.15)',
        iconColor: '#FFFFFF',
        onClick: () => console.log('TODO: navigare a form creazione proposta'),
    },
];

export function QuickActionCards() {
    return (
        <div className="quick-actions">
            {CARDS.map(card => (
                <QuickActionCard key={card.id} {...card} />
            ))}
        </div>
    );
}

function QuickActionCard({ icon: Icon, title, actionLabel, variant, iconBg, iconColor, onClick }) {
    return (
        <button
            className={`quick-card ${variant === 'dark' ? 'quick-card--dark' : ''}`}
            onClick={onClick}
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
