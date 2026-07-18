import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, LogOut } from 'lucide-react';
import TopBar from '@/components/TopBar';
import BackButton from '@/components/BackButton';
import { API_BASE } from '../../config/api';
import './ProfiloOperatorePage.css';

function RoleBadge({ ruolo }) {
  const isRoot = ruolo === 'root';
  return (
    <span className={`po-badge po-badge--${isRoot ? 'root' : 'operatore'}`}>
      {isRoot ? 'Root' : 'Operatore'}
    </span>
  );
}

function PasswordField({ id, label, value, onChange, show, onToggle, autoComplete }) {
  return (
    <div className="po-field">
      <label className="po-field__label" htmlFor={id}>
        {label} <span className="po-field__required">*</span>
      </label>
      <div className="po-field__inputwrap">
        <input
          id={id}
          className="po-field__input"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="po-field__toggle"
          onClick={onToggle}
          aria-label={show ? 'Nascondi password' : 'Mostra password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function ProfiloOperatorePage() {
  const navigate = useNavigate();
  const nome = localStorage.getItem('nome') || '';
  const cognome = localStorage.getItem('cognome') || '';
  const username = localStorage.getItem('username') || '';
  const ruolo = localStorage.getItem('ruolo') || 'operatore';
  const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';

  const [passwordAttuale, setPasswordAttuale] = useState('');
  const [nuovaPassword, setNuovaPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const [showPwd, setShowPwd] = useState({ attuale: false, nuova: false, conferma: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const reset = () => {
    setPasswordAttuale('');
    setNuovaPassword('');
    setConfermaPassword('');
  };

  const handleAnnulla = () => {
    reset();
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordAttuale || !nuovaPassword || !confermaPassword) return setError('Compila tutti i campi');
    if (nuovaPassword !== confermaPassword) return setError('Le password non coincidono');
    if (nuovaPassword.length < 8) return setError('La nuova password deve essere di almeno 8 caratteri');

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/operatore/me/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vecchia_password: passwordAttuale, nuova_password: nuovaPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Errore ${res.status}`);
      setSuccess('Password aggiornata con successo');
      reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="po-page">
      <TopBar nome={nome} cognome={cognome} />
      <div className="po-shell">

        <BackButton variant="subtle" label="Indietro" to="/dashboard" />

        <header className="po-header">
          <h1>Il tuo profilo</h1>
          <p>Gestisci le informazioni del tuo account</p>
        </header>

        <div className="po-layout">

          {/* Sidebar identità */}
          <aside className="po-card">
            <div className="po-identity">
              <div className="po-avatar">{initials}</div>
              <div className="po-id-text">
                <p className="po-name">{nome} {cognome}</p>
                <p className="po-username">@{username}</p>
              </div>
              <RoleBadge ruolo={ruolo} />
            </div>
            <div className="po-divider" />
            <div className="po-status">
              <span className="po-status__dot" />
              <span>Account attivo</span>
            </div>
          </aside>

          {/* Main */}
          <div className="po-main">

            <section className="po-card">
              <span className="po-section-label">Informazioni</span>
              <div className="po-rows">
                <div className="po-row">
                  <span className="po-row__k">Nome</span>
                  <span className="po-row__v">{nome}</span>
                </div>
                <div className="po-row">
                  <span className="po-row__k">Cognome</span>
                  <span className="po-row__v">{cognome}</span>
                </div>
                <div className="po-row">
                  <span className="po-row__k">Username</span>
                  <span className="po-row__v">@{username}</span>
                </div>
              </div>
            </section>

            <form className="po-card" onSubmit={handleSubmit} noValidate>
              <span className="po-section-label">Sicurezza</span>

              <PasswordField
                id="pwd-att"
                label="Password attuale"
                value={passwordAttuale}
                onChange={setPasswordAttuale}
                show={showPwd.attuale}
                onToggle={() => setShowPwd((s) => ({ ...s, attuale: !s.attuale }))}
                autoComplete="current-password"
              />
              <PasswordField
                id="pwd-new"
                label="Nuova password"
                value={nuovaPassword}
                onChange={setNuovaPassword}
                show={showPwd.nuova}
                onToggle={() => setShowPwd((s) => ({ ...s, nuova: !s.nuova }))}
                autoComplete="new-password"
              />
              <PasswordField
                id="pwd-conf"
                label="Conferma nuova password"
                value={confermaPassword}
                onChange={setConfermaPassword}
                show={showPwd.conferma}
                onToggle={() => setShowPwd((s) => ({ ...s, conferma: !s.conferma }))}
                autoComplete="new-password"
              />

              {error && <p className="po-msg po-msg--error">{error}</p>}
              {success && <p className="po-msg po-msg--success">{success}</p>}

              <div className="po-actions">
                <button type="button" className="po-btn po-btn--secondary" onClick={handleAnnulla}>
                  Annulla
                </button>
                <button type="submit" className="po-btn po-btn--primary" disabled={saving}>
                  <Shield size={15} />
                  {saving ? 'Aggiornamento…' : 'Aggiorna password'}
                </button>
              </div>
            </form>

            <section className="po-card">
              <span className="po-section-label">Sessione</span>
              <p className="po-logout-desc">
                Esci dal tuo account per terminare la sessione su questo dispositivo.
              </p>
              <button
                type="button"
                className="po-btn-logout"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut size={15} />
                {loggingOut ? 'Uscita…' : "Esci dall'account"}
              </button>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
