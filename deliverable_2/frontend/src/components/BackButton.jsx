import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './BackButton.css';

const ICON_SIZE = { link: 18, subtle: 16, icon: 18 };

export default function BackButton({ label = 'Torna indietro', to, variant = 'link', className = '', ...rest }) {
    const navigate = useNavigate();

    const handleClick = () => {
        const idx = window.history.state?.idx ?? 0;
        if (idx > 0) {
            navigate(-1);
        } else {
            navigate(to ?? '/');
        }
    };

    return (
        <button
            type="button"
            className={`back-button back-button--${variant}${className ? ` ${className}` : ''}`}
            onClick={handleClick}
            aria-label={variant === 'icon' ? label : undefined}
            {...rest}
        >
            <ArrowLeft size={ICON_SIZE[variant]} />
            {variant !== 'icon' && <span>{label}</span>}
        </button>
    );
}
