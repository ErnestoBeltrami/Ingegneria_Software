import { Bell, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './TopBar.css';

export default function TopBar({ nome = '', cognome = '' }) {
  const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
  const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Operatore';
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <Link to="/dashboard" className="topbar__logo">IoSonoTrento</Link>

      <div className="topbar__right">
        <button className="topbar__bell" aria-label="Notifiche">
          <Bell size={20} />
        </button>

        <button
          className="topbar__bell"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura'}
        >
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <Link to="/operatore/profilo" className="topbar__user">
          <div className="topbar__avatar">{initials}</div>
          <span className="topbar__name">{fullName}</span>
        </Link>
      </div>
    </header>
  );
}
