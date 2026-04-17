import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import './TopBar.css';

export default function TopBar({ nome = '', cognome = '' }) {
  const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
  const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Operatore';

  return (
    <header className="topbar">
      <Link to="/dashboard" className="topbar__logo">IoSonoTrento</Link>

      <div className="topbar__right">
        <button className="topbar__bell" aria-label="Notifiche">
          <Bell size={20} color="white" />
        </button>

        <div className="topbar__user">
          <div className="topbar__avatar">{initials}</div>
          <span className="topbar__name">{fullName}</span>
        </div>
      </div>
    </header>
  );
}
