import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, AlertTriangle, Pencil, X, Check, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './ProfiloCittadinePage.css';

const CIRCOSCRIZIONI = [
  'Centro storico - Piedicastello',
  'Argentario',
  'Bondone',
  'Gardolo',
  'Meano',
  'Nomi',
  'Povo',
  'Ravina - Romagnano',
  'Sardagna',
  'Villazzano',
  'Oltrefersina',
  'San Giuseppe - Maddalene',
  'Mattarello',
  'Cognola',
  'Civezzano',
  'Aldeno e Mattarello',
];

function formatData(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toInputDate(iso) {
  if (!iso) return '';
  return new Date(iso).toISOString().split('T')[0];
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

  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ nome: '', cognome: '', dataNascita: '', comuneResidenza: '', circoscrizione: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

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

  const startEdit = () => {
    setEditData({
      nome: profilo.nome || '',
      cognome: profilo.cognome || '',
      dataNascita: toInputDate(profilo.dataNascita),
      comuneResidenza: profilo.comuneResidenza || '',
      circoscrizione: profilo.circoscrizione || '',
    });
    setEditError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditError('');
  };

  const handleSave = async () => {
    setEditError('');
    if (!editData.nome.trim()) return setEditError('Il nome è obbligatorio');
    if (!editData.cognome.trim()) return setEditError('Il cognome è obbligatorio');
    if (!editData.dataNascita) return setEditError('La data di nascita è obbligatoria');
    if (!editData.comuneResidenza.trim()) return setEditError('Il comune di residenza è obbligatorio');
    if (editData.comuneResidenza === 'Trento' && !editData.circoscrizione) {
      return setEditError('Seleziona la circoscrizione per il comune di Trento');
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');

      const [resNome, resCompleta] = await Promise.all([
        fetch('/cittadino/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nome: editData.nome.trim(), cognome: editData.cognome.trim() }),
        }),
        fetch('/auth/complete-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cittadinoId: profilo.id,
            dataNascita: editData.dataNascita,
            comuneResidenza: editData.comuneResidenza.trim(),
            circoscrizione: editData.circoscrizione || null,
          }),
        }),
      ]);

      if (!resNome.ok) {
        const d = await resNome.json();
        throw new Error(d.message || `Errore ${resNome.status}`);
      }
      if (!resCompleta.ok) {
        const d = await resCompleta.json();
        throw new Error(d.message || `Errore ${resCompleta.status}`);
      }

      const dataCompleta = await resCompleta.json();
      if (dataCompleta.token) localStorage.setItem('token', dataCompleta.token);

      setProfilo((p) => ({
        ...p,
        nome: editData.nome.trim(),
        cognome: editData.cognome.trim(),
        dataNascita: new Date(editData.dataNascita).toISOString(),
        comuneResidenza: editData.comuneResidenza.trim(),
        circoscrizione: editData.circoscrizione || null,
        profiloCompleto: true,
      }));
      setEditing(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const nome = profilo?.nome || '';
  const cognome = profilo?.cognome || '';
  const email = profilo?.email || '';
  const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
  const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Cittadino';
  const profiloIncompleto = profilo && (!profilo.dataNascita || !profilo.comuneResidenza);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="cp-page">
      <header className="cp-topbar">
        <span className="cp-topbar__logo">IoSonoTrento</span>
        <div className="cp-topbar__right">
        <button
          className="cp-topbar__theme"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura'}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <div className="cp-topbar__user">
          <div className="cp-topbar__avatar">{initials}</div>
          <span className="cp-topbar__name">{fullName}</span>
        </div>
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

        {!loading && profilo && profiloIncompleto && !editing && (
          <div className="cp-warning">
            <AlertTriangle size={18} className="cp-warning__icon" />
            <div className="cp-warning__body">
              <p className="cp-warning__title">Profilo incompleto</p>
              <p className="cp-warning__desc">
                Alcuni dati obbligatori non sono stati ancora inseriti.
              </p>
            </div>
            <button type="button" className="cp-warning__btn" onClick={startEdit}>
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
                <div className="cp-section-header">
                  <span className="cp-section-label">Informazioni personali</span>
                  {!editing && (
                    <button type="button" className="cp-btn-edit" onClick={startEdit}>
                      <Pencil size={13} /> Modifica
                    </button>
                  )}
                </div>

                {!editing ? (
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
                ) : (
                  <div className="cp-edit-form">
                    <div className="cp-rows">
                      <InfoRow label="Email" value={email} />
                      <InfoRow label="Genere" value={profilo.genere} />
                      <InfoRow label="Categoria" value={profilo.categoria} />
                    </div>

                    <div className="cp-edit-fields">
                      <div className="cp-field">
                        <label className="cp-field__label" htmlFor="editNome">
                          Nome <span className="cp-field__req">*</span>
                        </label>
                        <input
                          id="editNome"
                          type="text"
                          className="cp-field__input"
                          value={editData.nome}
                          onChange={(e) => setEditData((d) => ({ ...d, nome: e.target.value }))}
                          autoComplete="given-name"
                        />
                      </div>

                      <div className="cp-field">
                        <label className="cp-field__label" htmlFor="editCognome">
                          Cognome <span className="cp-field__req">*</span>
                        </label>
                        <input
                          id="editCognome"
                          type="text"
                          className="cp-field__input"
                          value={editData.cognome}
                          onChange={(e) => setEditData((d) => ({ ...d, cognome: e.target.value }))}
                          autoComplete="family-name"
                        />
                      </div>
                      <div className="cp-field">
                        <label className="cp-field__label" htmlFor="dataNascita">
                          Data di nascita <span className="cp-field__req">*</span>
                        </label>
                        <input
                          id="dataNascita"
                          type="date"
                          className="cp-field__input"
                          value={editData.dataNascita}
                          onChange={(e) => setEditData((d) => ({ ...d, dataNascita: e.target.value }))}
                        />
                      </div>

                      <div className="cp-field">
                        <label className="cp-field__label" htmlFor="comune">
                          Comune di residenza <span className="cp-field__req">*</span>
                        </label>
                        <input
                          id="comune"
                          type="text"
                          className="cp-field__input"
                          value={editData.comuneResidenza}
                          onChange={(e) => setEditData((d) => ({ ...d, comuneResidenza: e.target.value, circoscrizione: '' }))}
                          placeholder="es. Trento"
                          autoComplete="off"
                        />
                      </div>

                      {editData.comuneResidenza === 'Trento' && (
                        <div className="cp-field">
                          <label className="cp-field__label" htmlFor="circoscrizione">
                            Circoscrizione <span className="cp-field__req">*</span>
                          </label>
                          <select
                            id="circoscrizione"
                            className="cp-field__input cp-field__select"
                            value={editData.circoscrizione}
                            onChange={(e) => setEditData((d) => ({ ...d, circoscrizione: e.target.value }))}
                          >
                            <option value="">Seleziona circoscrizione…</option>
                            {CIRCOSCRIZIONI.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {editError && <p className="cp-edit-error">{editError}</p>}

                    <div className="cp-edit-actions">
                      <button type="button" className="cp-btn-cancel" onClick={cancelEdit} disabled={saving}>
                        <X size={14} /> Annulla
                      </button>
                      <button type="button" className="cp-btn-save" onClick={handleSave} disabled={saving}>
                        <Check size={14} />
                        {saving ? 'Salvataggio…' : 'Salva modifiche'}
                      </button>
                    </div>
                  </div>
                )}
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
                  {loggingOut ? 'Uscita…' : "Esci dall'account"}
                </button>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
