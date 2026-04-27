import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import TopBar from '@/components/TopBar';
import './CreaSondaggioPage.css';

const MAX_DOMANDE = 8;

function isoToDate(iso) {
  if (!iso) return '';
  return new Date(iso).toISOString().split('T')[0];
}

function buildIso(dateStr) {
  return dateStr ? new Date(dateStr + 'T00:00:00').toISOString() : undefined;
}

function buildDiscussione(dataApertura) {
  if (!dataApertura) return undefined;
  const d = new Date(dataApertura + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString();
}

async function apiFetch(url, options) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Errore ${res.status}`);
  return data;
}

export default function ModificaSondaggioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const nome = localStorage.getItem('nome') || '';
  const cognome = localStorage.getItem('cognome') || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [dataApertura, setDataApertura] = useState('');
  const [dataChiusura, setDataChiusura] = useState('');
  const [risposteMultiple, setRisposteMultiple] = useState(false);
  const [domande, setDomande] = useState([{ titolo: '', opzioni: ['', ''] }]);

  useEffect(() => {
    apiFetch(`/sondaggio/${id}`)
      .then((data) => {
        const s = data.sondaggio ?? data;
        setTitolo(s.titolo ?? '');
        setDescrizione(s.descrizione ?? '');
        setDataApertura(isoToDate(s.data_inizio));
        setDataChiusura(isoToDate(s.data_fine));

        const rawDomande = s.ID_domande ?? [];
        if (rawDomande.length > 0) {
          setRisposteMultiple(rawDomande[0].tipo === 'risposta_multipla');
          setDomande(rawDomande.map((d) => ({
            titolo: d.titolo ?? '',
            opzioni: d.opzioni?.map((o) => o.testo ?? o) ?? ['', ''],
          })));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const addDomanda = () => {
    if (domande.length >= MAX_DOMANDE) return;
    setDomande((prev) => [...prev, { titolo: '', opzioni: ['', ''] }]);
  };

  const removeDomanda = (i) => {
    if (domande.length <= 1) return;
    setDomande((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateDomandaTitolo = (i, val) =>
    setDomande((prev) => prev.map((d, idx) => idx === i ? { ...d, titolo: val } : d));

  const addOpzione = (i) =>
    setDomande((prev) => prev.map((d, idx) => idx === i ? { ...d, opzioni: [...d.opzioni, ''] } : d));

  const removeOpzione = (i, j) => {
    if (domande[i].opzioni.length <= 2) return;
    setDomande((prev) => prev.map((d, idx) =>
      idx === i ? { ...d, opzioni: d.opzioni.filter((_, oi) => oi !== j) } : d
    ));
  };

  const updateOpzione = (i, j, val) =>
    setDomande((prev) => prev.map((d, idx) =>
      idx === i ? { ...d, opzioni: d.opzioni.map((o, oi) => oi === j ? val : o) } : d
    ));

  const handleSave = async () => {
    setError('');
    if (!titolo.trim()) return setError('Il titolo è obbligatorio.');
    if (!descrizione.trim()) return setError('La descrizione è obbligatoria.');
    if (!dataApertura) return setError('La data di apertura è obbligatoria.');
    if (!dataChiusura) return setError('La data di chiusura è obbligatoria.');
    if (dataApertura >= dataChiusura) return setError('La data di apertura deve essere prima della chiusura.');

    for (let i = 0; i < domande.length; i++) {
      if (!domande[i].titolo.trim()) return setError(`Il titolo della domanda ${i + 1} è obbligatorio.`);
      const filled = domande[i].opzioni.filter((o) => o.trim());
      if (filled.length < 2) return setError(`La domanda ${i + 1} deve avere almeno 2 opzioni compilate.`);
    }

    const tipo = risposteMultiple ? 'risposta_multipla' : 'risposta_singola';
    setSaving(true);
    try {
      await apiFetch(`/sondaggio/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          titolo: titolo.trim(),
          descrizione: descrizione.trim(),
          data_inizio: buildIso(dataApertura),
          data_fine: buildIso(dataChiusura),
          data_discussione: buildDiscussione(dataApertura),
          domande: domande.map((d) => ({
            titolo: d.titolo.trim(),
            tipo,
            opzioni: d.opzioni.filter((o) => o.trim()).map((o) => ({ testo: o.trim() })),
          })),
        }),
      });
      navigate('/sondaggi');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="crea-layout">
      <TopBar nome={nome} cognome={cognome} />
      <div className="crea-page"><p style={{ color: 'rgba(255,255,255,0.5)' }}>Caricamento…</p></div>
    </div>
  );

  return (
    <div className="crea-layout">
      <TopBar nome={nome} cognome={cognome} />
      <div className="crea-page">

        <header className="crea-header">
          <button className="crea-header__back" onClick={() => navigate('/sondaggi')}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="crea-header__title">Modifica sondaggio</h1>
            <p className="crea-header__subtitle">Solo le bozze possono essere modificate</p>
          </div>
        </header>

        <div className="crea-body">

          {/* Sidebar sinistra */}
          <aside className="crea-sidebar">
            <div className="crea-card">
              <p className="crea-card__section-label">INFORMAZIONI</p>

              <div className="crea-field">
                <label className="crea-field__label">Titolo</label>
                <input
                  className="crea-field__input"
                  placeholder="Es. Soddisfazione servizi pubblici"
                  value={titolo}
                  onChange={(e) => setTitolo(e.target.value)}
                />
              </div>

              <div className="crea-field">
                <label className="crea-field__label">Descrizione</label>
                <textarea
                  className="crea-field__input crea-field__input--textarea"
                  placeholder="Descrivi il sondaggio…"
                  value={descrizione}
                  onChange={(e) => setDescrizione(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="crea-field">
                <label className="crea-field__label">Data apertura</label>
                <input type="date" className="crea-field__input" value={dataApertura} onChange={(e) => setDataApertura(e.target.value)} />
              </div>

              <div className="crea-field">
                <label className="crea-field__label">Data chiusura</label>
                <input type="date" className="crea-field__input" value={dataChiusura} onChange={(e) => setDataChiusura(e.target.value)} />
              </div>
            </div>

            <div className="crea-card crea-card--toggle">
              <div className="crea-toggle">
                <div>
                  <p className="crea-toggle__label">Risposte multiple</p>
                  <p className="crea-toggle__desc">Gli utenti possono selezionare più opzioni</p>
                </div>
                <button
                  type="button"
                  className={`toggle-switch ${risposteMultiple ? 'toggle-switch--on' : ''}`}
                  onClick={() => setRisposteMultiple((v) => !v)}
                />
              </div>
            </div>

            <div className="crea-card crea-card--actions">
              {error && <p className="crea-error">{error}</p>}
              <div className="crea-actions">
                <button className="crea-btn crea-btn--annulla" onClick={() => navigate('/sondaggi')} disabled={saving}>
                  Annulla
                </button>
                <button className="crea-btn crea-btn--salva" onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvataggio…' : 'Salva modifiche'}
                </button>
              </div>
            </div>
          </aside>

          {/* Colonna destra — domande */}
          <div className="crea-main">
            {domande.map((domanda, i) => (
              <div key={i} className="crea-card crea-domanda">
                <div className="crea-domanda__header">
                  <span className="crea-domanda__num">Domanda {i + 1}</span>
                  {domande.length > 1 && (
                    <button
                      type="button"
                      className="crea-domanda__remove"
                      onClick={() => removeDomanda(i)}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="crea-field">
                  <label className="crea-field__label">Testo della domanda</label>
                  <input
                    className="crea-field__input"
                    placeholder="Inserisci la domanda"
                    value={domanda.titolo}
                    onChange={(e) => updateDomandaTitolo(i, e.target.value)}
                  />
                </div>

                <div className="crea-opzioni">
                  {domanda.opzioni.map((opzione, j) => (
                    <div key={j} className="crea-opzione">
                      <div className={`crea-opzione__indicator ${risposteMultiple ? 'crea-opzione__indicator--check' : ''}`} />
                      <input
                        className="crea-field__input crea-opzione__input"
                        placeholder={`Opzione ${j + 1}`}
                        value={opzione}
                        onChange={(e) => updateOpzione(i, j, e.target.value)}
                      />
                      {domanda.opzioni.length > 2 && (
                        <button
                          type="button"
                          className="crea-opzione__delete"
                          onClick={() => removeOpzione(i, j)}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button type="button" className="crea-add-opzione" onClick={() => addOpzione(i)}>
                  <Plus size={13} /> Aggiungi un'altra opzione
                </button>
              </div>
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

        </div>
      </div>
    </div>
  );
}
