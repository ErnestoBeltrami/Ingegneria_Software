import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MAX_DOMANDE = 8;
import { Save, Plus } from 'lucide-react';
import TopBar from '@/components/TopBar';
import BackButton from '@/components/BackButton';
import DomandaCard from '@/components/DomandaCard';
import { API_BASE } from '../../config/api';
import './CreaSondaggioPage.css';

function buildIso(dateString) {
  // dateString is "YYYY-MM-DD" from input[type=date]
  return new Date(dateString).toISOString();
}

function buildDiscussione(dateString) {
  const d = new Date(dateString);
  d.setDate(d.getDate() - 1);
  return d.toISOString();
}

export default function CreaSondaggioPage() {
  const navigate = useNavigate();
  const nome = localStorage.getItem('nome') || '';
  const cognome = localStorage.getItem('cognome') || '';

  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [dataApertura, setDataApertura] = useState('');
  const [dataChiusura, setDataChiusura] = useState('');
  const [domande, setDomande] = useState([{ titolo: '', tipo: 'risposta_singola', opzioni: ['', ''] }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ---- domande helpers ---- */
  const addDomanda = () => {
    if (domande.length >= MAX_DOMANDE) return;
    setDomande((prev) => [...prev, { titolo: '', tipo: 'risposta_singola', opzioni: ['', ''] }]);
  };

  const removeDomanda = (i) => {
    if (domande.length <= 1) return;
    setDomande((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateDomandaTitolo = (i, val) =>
    setDomande((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, titolo: val } : d))
    );

  const updateDomandaTipo = (i) =>
    setDomande((prev) =>
      prev.map((d, idx) =>
        idx === i
          ? { ...d, tipo: d.tipo === 'risposta_multipla' ? 'risposta_singola' : 'risposta_multipla' }
          : d
      )
    );

  const addOpzione = (i) =>
    setDomande((prev) =>
      prev.map((d, idx) =>
        idx === i ? { ...d, opzioni: [...d.opzioni, ''] } : d
      )
    );

  const removeOpzione = (i, j) => {
    if (domande[i].opzioni.length <= 2) return;
    setDomande((prev) =>
      prev.map((d, idx) =>
        idx === i ? { ...d, opzioni: d.opzioni.filter((_, oi) => oi !== j) } : d
      )
    );
  };

  const updateOpzione = (i, j, val) =>
    setDomande((prev) =>
      prev.map((d, idx) =>
        idx === i
          ? { ...d, opzioni: d.opzioni.map((o, oi) => (oi === j ? val : o)) }
          : d
      )
    );

  /* ---- submit ---- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validazione frontend
    if (!titolo.trim()) return setError('Il titolo è obbligatorio.');
    if (!descrizione.trim()) return setError('La descrizione è obbligatoria.');
    if (!dataApertura) return setError('La data di apertura è obbligatoria.');
    if (!dataChiusura) return setError('La data di chiusura è obbligatoria.');
    if (new Date(dataApertura) >= new Date(dataChiusura))
      return setError('La data di apertura deve essere precedente alla data di chiusura.');

    for (let i = 0; i < domande.length; i++) {
      if (!domande[i].titolo.trim())
        return setError(`Il titolo della domanda ${i + 1} è obbligatorio.`);
      const opzioniFilled = domande[i].opzioni.filter((o) => o.trim() !== '');
      if (opzioniFilled.length < 2)
        return setError(`La domanda ${i + 1} deve avere almeno 2 opzioni compilate.`);
    }

    const body = {
      tipo: 'sondaggio',
      titolo: titolo.trim(),
      descrizione: descrizione.trim(),
      data_inizio: buildIso(dataApertura),
      data_fine: buildIso(dataChiusura),
      data_discussione: buildDiscussione(dataApertura),
      domande: domande.map((d) => ({
        titolo: d.titolo.trim(),
        tipo: d.tipo,
        opzioni: d.opzioni
          .filter((o) => o.trim() !== '')
          .map((o) => ({ testo: o.trim() })),
      })),
    };

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/sondaggio`, {
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
        {/* Header */}
        <header className="crea-header">
          <BackButton variant="icon" label="Torna alla dashboard" to="/dashboard" />
          <div>
            <h1 className="crea-header__title">Crea un nuovo sondaggio</h1>
            <p className="crea-header__subtitle">Compila i campi per creare il sondaggio</p>
          </div>
        </header>

        <form className="crea-body" onSubmit={handleSubmit} noValidate>
          {/* ===== Colonna sinistra ===== */}
          <aside className="crea-sidebar">
            {/* Card informazioni */}
            <div className="crea-card">
              <p className="crea-card__section-label">INFORMAZIONI</p>

              <div className="crea-field">
                <label htmlFor="s-titolo" className="crea-field__label">Titolo</label>
                <input
                  id="s-titolo"
                  type="text"
                  className="crea-field__input"
                  placeholder="Inserisci il titolo del sondaggio"
                  value={titolo}
                  onChange={(e) => setTitolo(e.target.value)}
                />
              </div>

              <div className="crea-field">
                <label htmlFor="s-desc" className="crea-field__label">Descrizione</label>
                <textarea
                  id="s-desc"
                  className="crea-field__input crea-field__input--textarea"
                  placeholder="Inserisci la descrizione del sondaggio"
                  value={descrizione}
                  onChange={(e) => setDescrizione(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="crea-field">
                <label htmlFor="s-apertura" className="crea-field__label">Data apertura</label>
                <input
                  id="s-apertura"
                  type="date"
                  className="crea-field__input"
                  value={dataApertura}
                  onChange={(e) => setDataApertura(e.target.value)}
                />
              </div>

              <div className="crea-field">
                <label htmlFor="s-chiusura" className="crea-field__label">Data chiusura</label>
                <input
                  id="s-chiusura"
                  type="date"
                  className="crea-field__input"
                  value={dataChiusura}
                  onChange={(e) => setDataChiusura(e.target.value)}
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

          {/* ===== Colonna destra ===== */}
          <div className="crea-main">
            {domande.map((domanda, i) => (
              <DomandaCard
                key={i}
                domanda={domanda}
                index={i}
                totaleDomande={domande.length}
                onTitoloChange={updateDomandaTitolo}
                onTipoChange={updateDomandaTipo}
                onAddOpzione={addOpzione}
                onUpdateOpzione={updateOpzione}
                onRemoveOpzione={removeOpzione}
                onRemoveDomanda={removeDomanda}
              />
            ))}

            <button
              type="button"
              className="crea-add-domanda"
              onClick={addDomanda}
              disabled={domande.length >= MAX_DOMANDE}
            >
              <Plus size={16} />
              {domande.length >= MAX_DOMANDE
                ? `Limite raggiunto (${MAX_DOMANDE}/${MAX_DOMANDE})`
                : `Aggiungi un'altra domanda (${domande.length}/${MAX_DOMANDE})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
