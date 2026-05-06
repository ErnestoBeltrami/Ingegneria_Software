/* CreaVotazionePage — recreation of the create-vote screen.
   Two-column layout: form on the left, sidebar (date pickers + toggle + actions) on the right. */

function Field({ label, required, children }) {
  return (
    <div className="field">
      <label className="field__label">
        {label}{required && <> <span className="field__required">*</span></>}
      </label>
      {children}
    </div>
  );
}

function CreaVotazionePage({ onBack }) {
  const [titolo, setTitolo] = React.useState('Riqualificazione Piazza Duomo');
  const [descrizione, setDescrizione] = React.useState('Vota la proposta del Comune per la riqualificazione di Piazza Duomo, inclusa la pedonalizzazione parziale e l\'aggiunta di nuove aree verdi.');
  const [dataInizio, setDataInizio] = React.useState('2026-05-01');
  const [dataFine,   setDataFine]   = React.useState('2026-05-12');
  const [opzioni, setOpzioni] = React.useState([
    'Approvo la proposta integralmente',
    'Approvo solo la pedonalizzazione',
    'Non approvo'
  ]);
  const [multiple, setMultiple] = React.useState(false);
  const [error, setError] = React.useState('');

  const updOpzione = (i, v) => setOpzioni(o => o.map((x,idx) => idx===i ? v : x));
  const addOpzione = () => setOpzioni(o => [...o, '']);
  const delOpzione = (i) => setOpzioni(o => o.length > 2 ? o.filter((_,idx) => idx!==i) : o);

  const onSalva = (e) => {
    e.preventDefault();
    if (!titolo.trim()) { setError('Inserisci un titolo'); return; }
    if (opzioni.filter(o => o.trim()).length < 2) { setError('Servono almeno 2 opzioni'); return; }
    setError('Bozza salvata (demo)');
  };

  return (
    <div className="page">
      <header className="page-header page-header--row">
        <button className="icon-back-btn" onClick={onBack} aria-label="Indietro"><IconArrowLeft size={16}/></button>
        <div>
          <h1 className="page-header__title">Crea una nuova votazione</h1>
          <p className="page-header__subtitle">Compila i campi per pubblicare una nuova consultazione</p>
        </div>
      </header>

      <form className="crea-body" onSubmit={onSalva}>

        {/* main */}
        <div className="crea-main">
          <div className="card">
            <Field label="Titolo" required>
              <input className="field__input" value={titolo} onChange={e => setTitolo(e.target.value)} placeholder="Es. Riqualificazione Piazza Duomo"/>
            </Field>
            <Field label="Descrizione">
              <textarea className="field__input crea-field__textarea" value={descrizione} onChange={e => setDescrizione(e.target.value)} placeholder="Descrivi il contesto della votazione…"/>
            </Field>
          </div>

          <div className="card">
            <span className="section-label">Opzioni di voto</span>
            <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
              {opzioni.map((opt, i) => (
                <div key={i} className="opzione">
                  <span className="opzione__indicator"/>
                  <input
                    className="opzione__input"
                    placeholder={`Opzione ${i+1}`}
                    value={opt}
                    onChange={e => updOpzione(i, e.target.value)}
                  />
                  <button type="button" className="opzione__delete" disabled={opzioni.length<=2} onClick={() => delOpzione(i)}>
                    <IconTrash size={14}/>
                  </button>
                </div>
              ))}
              <button type="button" className="add-opzione" onClick={addOpzione}>
                <IconPlus size={14}/> Aggiungi opzione
              </button>
            </div>
          </div>
        </div>

        {/* sidebar */}
        <div className="crea-side">
          <div className="card">
            <span className="section-label">Periodo</span>
            <Field label="Inizio" required>
              <input type="date" className="field__input" value={dataInizio} onChange={e => setDataInizio(e.target.value)} />
            </Field>
            <Field label="Fine" required>
              <input type="date" className="field__input" value={dataFine} onChange={e => setDataFine(e.target.value)} />
            </Field>
          </div>

          <div className="card">
            <div className="toggle-row">
              <div>
                <p className="toggle-row__label">Risposte multiple</p>
                <p className="toggle-row__desc">Permetti la selezione di più opzioni</p>
              </div>
              <button type="button" className={`switch ${multiple ? 'switch--on' : ''}`} onClick={() => setMultiple(m => !m)} aria-pressed={multiple}/>
            </div>
          </div>

          <div className="card">
            {error && <p className="form-msg form-msg--error">{error}</p>}
            <div style={{ display:'flex', gap: 10 }}>
              <button type="button" className="btn btn--secondary" style={{ flex: 1 }} onClick={onBack}>Annulla</button>
              <button type="submit"  className="btn btn--primary"   style={{ flex: 2 }}>Salva</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

window.CreaVotazionePage = CreaVotazionePage;
