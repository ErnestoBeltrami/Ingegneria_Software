import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Bell, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { fetchNotifiche, marcaNotificaLetta, marcaTutteNotificheLette } from '../services/api';
import '../pages/cittadino/dashboard/DashboardCittadinePage.css';

function formatRelativeTime(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Adesso';
    if (mins < 60) return `${mins}m fa`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h fa`;
    return `${Math.floor(hours / 24)}g fa`;
}

export default function TopBarCittadino({ nome = '', cognome = '' }) {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const bellRef = useRef(null);

    const [notifiche, setNotifiche] = useState([]);
    const [showNotifiche, setShowNotifiche] = useState(false);

    const nonLette = notifiche.filter(n => !n.letta).length;
    const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
    const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Cittadino';

    useEffect(() => {
        let cancelled = false;
        const load = () =>
            fetchNotifiche()
                .then(data => { if (!cancelled) setNotifiche(data.notifiche || []); })
                .catch(() => {});

        load();
        const interval = setInterval(load, 2 * 60 * 1000);
        return () => { cancelled = true; clearInterval(interval); };
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target))
                setShowNotifiche(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleNotificaClick = async (n) => {
        if (n.letta) return;
        try {
            await marcaNotificaLetta(n._id);
            setNotifiche(prev => prev.map(x => x._id === n._id ? { ...x, letta: true } : x));
        } catch {}
    };

    const handleLeggiTutte = async () => {
        try {
            await marcaTutteNotificheLette();
            setNotifiche(prev => prev.map(n => ({ ...n, letta: true })));
        } catch {}
    };

    return (
        <header className="cd-topbar">
            <Link to="/cittadino/dashboard" className="cd-topbar__logo">IoSonoTrento</Link>
            <div className="cd-topbar__right">
                <button
                    className="cd-topbar__theme"
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura'}
                >
                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                <div className="cd-notifiche-wrap" ref={bellRef}>
                    <button className="cd-bell" onClick={() => setShowNotifiche(v => !v)} aria-label="Notifiche">
                        <Bell size={17} />
                        {nonLette > 0 && (
                            <span className="cd-bell__badge">{nonLette > 9 ? '9+' : nonLette}</span>
                        )}
                    </button>

                    {showNotifiche && (
                        <div className="cd-notifiche-panel">
                            <div className="cd-notifiche-panel__header">
                                <span className="cd-notifiche-panel__title">Notifiche</span>
                                {nonLette > 0 && (
                                    <button className="cd-notifiche-panel__leggi-tutte" onClick={handleLeggiTutte}>
                                        Segna tutte come lette
                                    </button>
                                )}
                            </div>
                            <div className="cd-notifiche-lista">
                                {notifiche.length === 0 ? (
                                    <p className="cd-notifiche-vuote">Nessuna notifica</p>
                                ) : (
                                    notifiche.map(n => (
                                        <div
                                            key={n._id}
                                            className={`cd-notifica ${!n.letta ? 'cd-notifica--nuova' : ''}`}
                                            onClick={() => handleNotificaClick(n)}
                                        >
                                            <div className={`cd-notifica__icon ${n.tipo === 'iniziativa_approvata' ? 'cd-notifica__icon--ok' : 'cd-notifica__icon--ko'}`}>
                                                {n.tipo === 'iniziativa_approvata' ? <Check size={13} /> : <X size={13} />}
                                            </div>
                                            <div className="cd-notifica__body">
                                                <p className="cd-notifica__msg">{n.messaggio}</p>
                                                <span className="cd-notifica__time">{formatRelativeTime(n.createdAt)}</span>
                                            </div>
                                            {!n.letta && <span className="cd-notifica__dot" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="cd-topbar__user" onClick={() => navigate('/cittadino/profilo')}>
                    <div className="cd-topbar__avatar">{initials}</div>
                    <span className="cd-topbar__name">{fullName}</span>
                </div>
            </div>
        </header>
    );
}
