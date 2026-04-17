import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import TopBar from '@/components/TopBar';
import './CreaVotazionePage.css';

function buildIso(dateString) {
  return new Date(dateString).toISOString();
}

function buildDiscussione(dateString) {
  const d = new Date(dateString);
  d.setDate(d.getDate() - 1);
  return d.toISOString();
}

export default function CreaVotazionePage() {
  const navigate = useNavigate();
  const nome = localStorage.getItem('nome') || '';
  const cognome = localStorage.getItem('cognome') || '';

  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [dataApertura, setDataApertura] = useState('');
  const [dataChiusura, setDataChiusura] = useState('');
  const [opzioni, setOpzioni] = useState(['Favorevole', 'Contrario', 'Indifferente']);
  const [risposteMultiple, setRisposteMultiple] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addOpzione = () => setOpzioni((prev) => [...prev, '']);

  const removeOpzione = (i) => {
    if (opzioni.length <= 2) return;
    setOpzioni((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateOpzione = (i, val) =>
    setOpzioni((prev) => prev.map((o, idx) => (idx === i ? val : o)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!titolo.trim()) return setError('Il titolo è obbligatorio.');
    if (!descrizione.trim()) return setError('La descrizione è obbligatoria.');
    if (!dataApertura) return setError('La data di apertura è obbligatoria.');
    if (!dataChiusura) return setError('La data di chiusura è obbligatoria.');
    if (new Date(dataApertura) >= new Date(dataChiusura))
      return setError('La data di apertura deve essere precedente alla data di chiusura.');

    const opzioniFilled = opzioni.filter((o) => o.trim() !== '');
    if (opzioniFilled.length < 2)
      return setError('La votazione deve avere almeno 2 opzioni compilate.');

    const tipo = risposteMultiple ? 'risposta_multipla' : 'risposta_singola';
    const body = {
      titoloVotazione: titolo.trim(),
      descrizione: descrizione.trim(),
      data_inizio: buildIso(dataApertura),
      data_fine: buildIso(dataChiusura),
      data_discussione: buildDiscussione(dataApertura),
      domanda: {
        titolo: titolo.trim(),
        tipo,
        opzioni: opzioniFilled.map((o) => ({ testo: o.trim() })),
      },
    };

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/votazioni', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Errore ${res.status}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crea-layout">
      <TopBar nome={nome} cognome={cognome} />

      <div className="crea-page">
        <header className="crea-header">
          <button
            type="button"
            className="crea-header__back"
            onClick={() => navigate('/dashboard')}
            aria-label="Torna alla dashboard"
          >
            <ArrowLeft size={16} color="#4a5565" />
          </button>
          <div>
            <h1 className="crea-header__title">Crea una nuova votazione</h1>
            <p className="crea-header__subtitle">Compila i campi per creare la votazione</p>
          </div>
        </header>

        <form className="crea-vot-body" onSubmit={handleSubmit} noValidate>
          {/* ===== Colonna sinistra — form ===== */}
          <div className="crea-card crea-vot-main">
            <div className="crea-field">
              <label htmlFor="v-titolo" className="crea-field__label">
                Titolo <span className="crea-field__required">*</span>
              </label>
              <input
                id="v-titolo"
                type="text"
                className="crea-field__input"
                placeholder="Inserisci il titolo della votazione"
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
              />
            </div>

            <div className="crea-field">
              <label htmlFor="v-desc" className="crea-field__label">Descrizione</label>
              <textarea
                id="v-desc"
                className="crea-field__input crea-field__input--textarea"
                placeholder="Inserisci la descrizione della tua iniziativa qui"
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                rows={5}
              />
            </div>

            <div className="crea-field-row">
              <div className="crea-field">
                <label htmlFor="v-apertura" className="crea-field__label">Data apertura</label>
                <input
                  id="v-apertura"
                  type="date"
                  className="crea-field__input"
                  value={dataApertura}
                  onChange={(e) => setDataApertura(e.target.value)}
                />
              </div>
              <div className="crea-field">
                <label htmlFor="v-chiusura" className="crea-field__label">Data chiusura</label>
                <input
                  id="v-chiusura"
                  type="date"
                  className="crea-field__input"
                  value={dataChiusura}
                  onChange={(e) => setDataChiusura(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ===== Colonna destra — opzioni + toggle + azioni ===== */}
          <aside className="crea-sidebar">
            {/* Card opzioni */}
            <div className="crea-card">
              <p className="crea-field__label">Crea le tue opzioni</p>

              <div className="crea-opzioni">
                {opzioni.map((opzione, i) => (
                  <div key={i} className="crea-vot-opzione">
                    <div className="crea-opzione__indicator" />
                    <input
                      type="text"
                      className="crea-field__input crea-opzione__input"
                      placeholder={`Opzione ${i + 1}`}
                      value={opzione}
                      onChange={(e) => updateOpzione(i, e.target.value)}
                    />
                    <button
                      type="button"
                      className="crea-opzione__delete"
                      onClick={() => removeOpzione(i)}
                      aria-label={`Rimuovi opzione ${i + 1}`}
                      disabled={opzioni.length <= 2}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="crea-add-opzione"
                onClick={addOpzione}
              >
                <Plus size={13} />
                Aggiungi un'altra opzione
              </button>
            </div>

            {/* Card toggle risposte multiple */}
            <div className="crea-card crea-card--toggle">
              <div className="crea-toggle">
                <div>
                  <p className="crea-toggle__label">Risposte multiple</p>
                  <p className="crea-toggle__desc">
                    Gli utenti possono selezionare più di una opzione
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={risposteMultiple}
                  className={`toggle-switch ${risposteMultiple ? 'toggle-switch--on' : ''}`}
                  onClick={() => setRisposteMultiple((v) => !v)}
                />
              </div>
            </div>

            {/* Card azioni */}
            <div className="crea-card crea-card--actions">
              {error && <p className="crea-error" role="alert">{error}</p>}
              <div className="crea-actions">
                <button
                  type="button"
                  className="crea-btn crea-btn--annulla"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="crea-btn crea-btn--salva"
                  disabled={loading}
                >
                  <Save size={15} />
                  {loading ? 'Salvataggio…' : 'Salva bozza'}
                </button>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
