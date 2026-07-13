import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import TopBar from '@/components/TopBar';
import BackButton from '@/components/BackButton';
import './CreaVotazionePage.css';

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

export default function ModificaVotazionePage() {
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
  const [opzioni, setOpzioni] = useState(['', '']);
  const [risposteMultiple, setRisposteMultiple] = useState(false);

  useEffect(() => {
    apiFetch(`/votazioni/${id}`)
      .then((data) => {
        const v = data.consultazione ?? data.votazione ?? data;
        setTitolo(v.titoloVotazione ?? v.titolo ?? '');
        setDescrizione(v.descrizione ?? '');
        setDataApertura(isoToDate(v.data_inizio));
        setDataChiusura(isoToDate(v.data_fine));
        const domanda = v.ID_domanda;
        if (domanda) {
          setOpzioni(domanda.opzioni?.map((o) => o.testo) ?? ['', '']);
          setRisposteMultiple(domanda.tipo === 'risposta_multipla');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const setOpzione = (i, val) => setOpzioni((prev) => prev.map((o, idx) => idx === i ? val : o));
  const addOpzione = () => setOpzioni((prev) => [...prev, '']);
  const removeOpzione = (i) => setOpzioni((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setError('');
    if (!titolo.trim()) return setError('Il titolo è obbligatorio.');
    if (!descrizione.trim()) return setError('La descrizione è obbligatoria.');
    if (!dataApertura) return setError('La data di apertura è obbligatoria.');
    if (!dataChiusura) return setError('La data di chiusura è obbligatoria.');
    if (dataApertura >= dataChiusura) return setError('La data di apertura deve essere prima della chiusura.');
    const opzioniFilled = opzioni.filter((o) => o.trim());
    if (opzioniFilled.length < 2) return setError('Inserisci almeno 2 opzioni di voto.');

    setSaving(true);
    try {
      await apiFetch(`/votazioni/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          titolo: titolo.trim(),
          descrizione: descrizione.trim(),
          data_inizio: buildIso(dataApertura),
          data_fine: buildIso(dataChiusura),
          data_discussione: buildDiscussione(dataApertura),
          domanda: {
            tipo: risposteMultiple ? 'risposta_multipla' : 'risposta_singola',
            opzioni: opzioniFilled.map((o) => ({ testo: o.trim() })),
          },
        }),
      });
      navigate('/votazioni');
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
          <BackButton variant="icon" label="Torna alle votazioni" to="/votazioni" />
          <div>
            <h1 className="crea-header__title">Modifica votazione</h1>
            <p className="crea-header__subtitle">Solo le bozze possono essere modificate</p>
          </div>
        </header>

        <div className="crea-vot-body">

          {/* Form principale */}
          <div className="crea-card crea-vot-main">
            <div className="crea-field">
              <label className="crea-field__label">Titolo <span className="crea-field__required">*</span></label>
              <input
                className="crea-field__input"
                placeholder="Es. Riqualificazione del parco centrale"
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
              />
            </div>

            <div className="crea-field">
              <label className="crea-field__label">Descrizione <span className="crea-field__required">*</span></label>
              <textarea
                className="crea-field__input crea-field__input--textarea"
                placeholder="Descrivi l'oggetto della votazione…"
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
              />
            </div>

            <div className="crea-field-row">
              <div className="crea-field">
                <label className="crea-field__label">Data apertura <span className="crea-field__required">*</span></label>
                <input type="date" className="crea-field__input" value={dataApertura} onChange={(e) => setDataApertura(e.target.value)} />
              </div>
              <div className="crea-field">
                <label className="crea-field__label">Data chiusura <span className="crea-field__required">*</span></label>
                <input type="date" className="crea-field__input" value={dataChiusura} onChange={(e) => setDataChiusura(e.target.value)} />
              </div>
            </div>

            {/* Opzioni */}
            <div className="crea-field">
              <label className="crea-field__label">Opzioni di voto <span className="crea-field__required">*</span></label>
              <div className="crea-opzioni">
                {opzioni.map((op, i) => (
                  <div key={i} className="crea-vot-opzione">
                    <span className="crea-opzione__indicator" />
                    <input
                      className="crea-opzione__input"
                      placeholder={`Opzione ${i + 1}`}
                      value={op}
                      onChange={(e) => setOpzione(i, e.target.value)}
                    />
                    <button
                      className="crea-opzione__delete"
                      onClick={() => removeOpzione(i)}
                      disabled={opzioni.length <= 2}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button className="crea-add-opzione" onClick={addOpzione} style={{ marginTop: 8 }}>
                <Plus size={13} /> Aggiungi opzione
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="crea-sidebar">
            <div className="crea-card crea-card--toggle">
              <div className="crea-toggle">
                <div>
                  <p className="crea-toggle__label">Risposte multiple</p>
                  <p className="crea-toggle__desc">Permetti più scelte</p>
                </div>
                <button
                  className={`toggle-switch ${risposteMultiple ? 'toggle-switch--on' : ''}`}
                  onClick={() => setRisposteMultiple((v) => !v)}
                />
              </div>
            </div>

            <div className="crea-card crea-card--actions">
              {error && <p className="crea-error">{error}</p>}
              <div className="crea-actions">
                <button className="crea-btn crea-btn--annulla" onClick={() => navigate('/votazioni')} disabled={saving}>
                  Annulla
                </button>
                <button className="crea-btn crea-btn--salva" onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvataggio…' : 'Salva modifiche'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
