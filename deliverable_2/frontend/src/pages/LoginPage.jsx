import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckSquare, Users, MapPin, ShieldCheck } from 'lucide-react';
import './LoginPage.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function LoginPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('select'); // 'select' | 'operatore'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCittadinoLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleOperatoreLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/operatore/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password_inserita: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Credenziali non valide');
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'operatore');
      localStorage.setItem('nome', data.operatore?.nome ?? '');
      localStorage.setItem('cognome', data.operatore?.cognome ?? '');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setView('select');
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-page">
      {/* Pannello sinistro — branding */}
      <div className="login-left">
        <div className="login-left__header">
          <h1 className="login-left__title">IoSonoTrento</h1>
          <p className="login-left__subtitle">La tua voce per la tua città</p>
        </div>

        <p className="login-left__footer">Servizio offerto dal Comune di Trento</p>
      </div>

      {/* Pannello destro — form */}
      <div className="login-right">
        {view === 'success' ? (
          <div className="login-card">
            <div className="login-card__header">
              <h2 className="login-card__title">Accesso effettuato</h2>
              <p className="login-card__subtitle">
                Bentornato, <strong>{username}</strong>. La dashboard è in costruzione.
              </p>
            </div>
            <div className="login-card__security">
              <ShieldCheck size={13} />
              <span>Piattaforma sicura — Comune di Trento</span>
            </div>
          </div>
        ) : view === 'select' ? (
          <div className="login-card">
            <div className="login-card__header">
              <h2 className="login-card__title">Benvenuto</h2>
              <p className="login-card__subtitle">
                Scegli il tuo ruolo per accedere alla piattaforma
              </p>
            </div>

            <div className="login-card__buttons">
              <button className="btn btn--cittadino" onClick={handleCittadinoLogin}>
                <span>Accedi come cittadino</span>
                <ArrowRight size={18} />
              </button>
              <button className="btn btn--operatore" onClick={() => setView('operatore')}>
                <span>Accedi come operatore</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="login-card__security">
              <ShieldCheck size={13} />
              <span>Piattaforma sicura — Comune di Trento</span>
            </div>
          </div>
        ) : (
          <div className="login-card">
            <div className="login-card__header">
              <h2 className="login-card__title">Accesso operatore</h2>
              <p className="login-card__subtitle">
                Inserisci le tue credenziali per accedere
              </p>
            </div>

            <form className="login-card__form" onSubmit={handleOperatoreLogin} noValidate>
              <div className="form-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Inserisci username"
                  required
                  autoComplete="username"
                />
              </div>
              <div className="form-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci password"
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button
                className="btn btn--operatore btn--full"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Accesso in corso...' : 'Accedi'}
              </button>
            </form>

            <button className="btn-back" onClick={handleBack}>
              ← Torna alla selezione ruolo
            </button>

            <div className="login-card__security">
              <ShieldCheck size={13} />
              <span>Piattaforma sicura — Comune di Trento</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
