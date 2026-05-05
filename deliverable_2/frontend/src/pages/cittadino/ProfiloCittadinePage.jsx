import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, AlertTriangle } from 'lucide-react';
import './ProfiloCittadinePage.css';

function formatData(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function InfoRow({ label, value, missing }) {
  return (
    <div className={`cp-row${missing ? ' cp-row--missing' : ''}`}>
      <span className="cp-row__k">{label}</span>
      <span className={`cp-row__v${missing ? ' cp-row__v--missing' : ''}`}>{value || '—'}</span>
    </div>
  );
}

export default function ProfiloCittadinePage() {
  const navigate = useNavigate();

  const [profilo, setProfilo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/cittadino/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401 || r.status === 403) {
          localStorage.clear();
          navigate('/login', { replace: true });
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.data) setProfilo(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/cittadino/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) {}
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const nome = profilo?.nome || '';
  const cognome = profilo?.cognome || '';
  const email = profilo?.email || '';
  const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
  const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Cittadino';
  const profiloIncompleto = profilo && (!profilo.dataNascita || !profilo.comuneResidenza);

  const handleCompletaProfilo = () => {
    const params = new URLSearchParams({
      cittadinoId: profilo.id,
      nome,
      email,
      picture: '',
    });
    navigate(`/completa-profilo?${params.toString()}`);
  };

  return (
    <div className="cp-page">
      <header className="cp-topbar">
        <span className="cp-topbar__logo">IoSonoTrento</span>
        <div className="cp-topbar__user">
          <div className="cp-topbar__avatar">{initials}</div>
          <span className="cp-topbar__name">{fullName}</span>
        </div>
      </header>

      <div className="cp-shell">
        <button type="button" className="cp-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Indietro
        </button>

        <header className="cp-header">
          <h1>Il tuo profilo</h1>
          <p>Gestisci le informazioni del tuo account</p>
        </header>

        {loading && <p className="cp-status">Caricamento…</p>}

        {!loading && profilo && profiloIncompleto && (
          <div className="cp-warning">
            <AlertTriangle size={18} className="cp-warning__icon" />
            <div className="cp-warning__body">
              <p className="cp-warning__title">Profilo incompleto</p>
              <p className="cp-warning__desc">
                Alcuni dati obbligatori non sono stati ancora inseriti. Completa il profilo per accedere a tutte le funzionalità.
              </p>
            </div>
            <button type="button" className="cp-warning__btn" onClick={handleCompletaProfilo}>
              Completa ora
            </button>
          </div>
        )}

        {!loading && profilo && (
          <div className="cp-layout">
            {/* Sidebar identità */}
            <aside className="cp-card">
              <div className="cp-identity">
                <div className="cp-avatar">{initials}</div>
                <div className="cp-id-text">
                  <p className="cp-name">{fullName}</p>
                  <p className="cp-email">{email}</p>
                </div>
                <span className="cp-badge">Cittadino</span>
              </div>
              <div className="cp-divider" />
              <div className="cp-status-row">
                <span className="cp-status-dot" />
                <span>Account attivo</span>
              </div>
            </aside>

            {/* Main */}
            <div className="cp-main">
              <section className="cp-card">
                <span className="cp-section-label">Informazioni personali</span>
                <div className="cp-rows">
                  <InfoRow label="Nome" value={nome} />
                  <InfoRow label="Cognome" value={cognome} />
                  <InfoRow label="Email" value={email} />
                  <InfoRow label="Data di nascita" value={formatData(profilo.dataNascita)} missing={!profilo.dataNascita} />
                  <InfoRow label="Comune di residenza" value={profilo.comuneResidenza} missing={!profilo.comuneResidenza} />
                  <InfoRow label="Circoscrizione" value={profilo.circoscrizione} missing={profilo.comuneResidenza === 'Trento' && !profilo.circoscrizione} />
                  <InfoRow label="Genere" value={profilo.genere} />
                  <InfoRow label="Categoria" value={profilo.categoria} />
                </div>
              </section>

              <section className="cp-card">
                <span className="cp-section-label">Sessione</span>
                <p className="cp-logout-desc">
                  Accedi con Google. Per cambiare account esci e accedi di nuovo.
                </p>
                <button
                  type="button"
                  className="cp-btn-logout"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut size={15} />
                  {loggingOut ? 'Uscita…' : 'Esci dall\'account'}
                </button>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
