/* ProfiloOperatorePage — the spec the user supplied.
   Sidebar identity card + main account info + change-password card. */

function RoleBadge({ ruolo }) {
  const isRoot = ruolo === 'root';
  return (
    <span className={`role-badge role-badge--${isRoot ? 'root' : 'operatore'}`}>
      {isRoot ? 'Root' : 'Operatore'}
    </span>
  );
}

function PasswordField({ id, label, value, onChange, show, onToggle }) {
  return (
    <div className="field field--with-toggle">
      <label className="field__label" htmlFor={id}>
        {label} <span className="field__required">*</span>
      </label>
      <div className="field__toggle-wrap">
        <input
          id={id}
          className="field__input field__input--with-toggle"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <button type="button" className="field__toggle" onClick={onToggle} aria-label="Mostra/nascondi password">
          {show ? <IconEyeOff size={16}/> : <IconEye size={16}/>}
        </button>
      </div>
    </div>
  );
}

function ProfiloOperatorePage({ onBack }) {
  const nome = 'Marco';
  const cognome = 'Rossi';
  const username = 'm.rossi';
  const ruolo = 'root';

  const [passwordAttuale, setPasswordAttuale] = React.useState('');
  const [nuovaPassword,   setNuovaPassword]   = React.useState('');
  const [confermaPassword,setConfermaPassword]= React.useState('');
  const [showPwd, setShowPwd] = React.useState({ attuale: false, nuova: false, conferma: false });
  const [saving, setSaving]   = React.useState(false);
  const [error,  setError]    = React.useState('');
  const [success,setSuccess]  = React.useState('');

  const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!passwordAttuale || !nuovaPassword || !confermaPassword) {
      setError('Compila tutti i campi'); return;
    }
    if (nuovaPassword !== confermaPassword) {
      setError('Le password non coincidono'); return;
    }
    if (nuovaPassword.length < 8) {
      setError('La nuova password deve essere di almeno 8 caratteri'); return;
    }
    setSaving(true);
    // simulate
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSuccess('Password aggiornata con successo');
    setPasswordAttuale(''); setNuovaPassword(''); setConfermaPassword('');
  };

  const handleAnnulla = () => {
    setPasswordAttuale(''); setNuovaPassword(''); setConfermaPassword('');
    setError(''); setSuccess('');
  };

  return (
    <div className="page">
      <button className="rv-back" onClick={onBack}>
        <IconArrowLeft size={14}/> Profilo operatore
      </button>

      <header className="page-header">
        <h1 className="page-header__title">Il tuo profilo</h1>
        <p className="page-header__subtitle">Gestisci le informazioni del tuo account</p>
      </header>

      <div className="po-layout">

        {/* ── Sidebar ── */}
        <aside className="card po-card">
          <div className="po-identity">
            <div className="po-avatar">{initials}</div>
            <div className="po-id-text">
              <p className="po-name">{nome} {cognome}</p>
              <p className="po-username">@{username}</p>
            </div>
            <RoleBadge ruolo={ruolo} />
          </div>
          <div className="po-divider"/>
          <div className="po-status">
            <span className="po-status__dot"/>
            <span>Account attivo</span>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="po-main">

          <section className="card">
            <span className="section-label">Informazioni</span>
            <div>
              <div className="po-row"><span className="po-row__k">Nome</span><span className="po-row__v">{nome}</span></div>
              <div className="po-row"><span className="po-row__k">Cognome</span><span className="po-row__v">{cognome}</span></div>
              <div className="po-row"><span className="po-row__k">Username</span><span className="po-row__v">@{username}</span></div>
            </div>
          </section>

          <form className="card" onSubmit={handleSubmit} noValidate>
            <span className="section-label">Sicurezza</span>
            <PasswordField id="pwd-att"  label="Password attuale"      value={passwordAttuale}   onChange={setPasswordAttuale}    show={showPwd.attuale}   onToggle={() => setShowPwd(s => ({...s, attuale: !s.attuale}))} />
            <PasswordField id="pwd-new"  label="Nuova password"        value={nuovaPassword}     onChange={setNuovaPassword}      show={showPwd.nuova}     onToggle={() => setShowPwd(s => ({...s, nuova: !s.nuova}))} />
            <PasswordField id="pwd-conf" label="Conferma nuova password" value={confermaPassword} onChange={setConfermaPassword}   show={showPwd.conferma}  onToggle={() => setShowPwd(s => ({...s, conferma: !s.conferma}))} />

            {error   && <p className="form-msg form-msg--error">{error}</p>}
            {success && <p className="form-msg form-msg--success">{success}</p>}

            <div className="po-actions">
              <button type="button" className="btn btn--secondary" onClick={handleAnnulla}>Annulla</button>
              <button type="submit"  className="btn btn--primary" disabled={saving}>
                <IconShield size={15}/> {saving ? 'Aggiornamento…' : 'Aggiorna password'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

window.ProfiloOperatorePage = ProfiloOperatorePage;
