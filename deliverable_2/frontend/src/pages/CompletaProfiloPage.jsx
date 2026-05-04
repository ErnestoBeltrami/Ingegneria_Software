/* CompletaProfiloPage.jsx
 *
 * Pagina di onboarding cittadino su IoSonoTrento.
 * Mostrata UNA volta dopo il primo login con Google, prima di poter accedere
 * alle funzioni di voto / sondaggi.
 *
 * Props:
 *   googleUser  { nome, email, picture }   (read-only, from Google identity)
 *   onSubmit    ({ dataNascita, comuneResidenza, circoscrizione }) => Promise<void>
 *
 * Importa il CSS a fianco:
 *   import './CompletaProfiloPage.css';
 */

import React, { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import './CompletaProfiloPage.css';

/* ── Comuni del Trentino (autonoma di Trento). Lista canonica 2024. ── */
const COMUNI_TRENTINO = [
  'Ala','Albiano','Aldeno','Altavalle','Altopiano della Vigolana','Amblar-Don','Andalo',
  'Arco','Avio','Baselga di Pinè','Bedollo','Bersone','Besenello','Bieno','Bleggio Superiore',
  'Bocenago','Bondone','Borgo Chiese','Borgo Lares','Borgo d\u2019Anaunia','Borgo Valsugana',
  'Brentonico','Bresimo','Caderzone Terme','Cagnò','Calceranica al Lago','Caldes','Caldonazzo',
  'Calliano','Campitello di Fassa','Campodenno','Canal San Bovo','Canazei','Capriana',
  'Carisolo','Carzano','Castel Condino','Castel Ivano','Castello Tesino','Castello-Molina di Fiemme',
  'Castelnuovo','Cavalese','Cavareno','Cavedago','Cavedine','Cavizzana','Cembra Lisignago',
  'Cimone','Cinte Tesino','Cis','Civezzano','Cles','Comano Terme','Commezzadura','Contà',
  'Croviana','Daiano','Dambel','Denno','Dimaro Folgarida','Drena','Dro','Fai della Paganella',
  'Faver','Fiavé','Fierozzo','Folgaria','Fondo','Fornace','Frassilongo','Garniga Terme',
  'Giovo','Giustino','Grigno','Imer','Isera','Lavarone','Lavis','Levico Terme','Livo',
  'Lona-Lases','Luserna','Madruzzo','Malé','Malosco','Massimeno','Mazzin','Mezzana',
  'Mezzano','Mezzocorona','Mezzolombardo','Moena','Molveno','Mori','Nago-Torbole','Nogaredo',
  'Nomi','Novaledo','Ospedaletto','Ossana','Padergnone','Palù del Fersina','Panchià','Peio',
  'Pellizzano','Pelugo','Pergine Valsugana','Pieve Tesino','Pieve di Bono-Prezzo',
  'Pinzolo','Pomarolo','Porte di Rendena','Predaia','Predazzo','Primiero San Martino di Castrozza',
  'Rabbi','Riva del Garda','Romeno','Roncegno Terme','Ronchi Valsugana','Ronzo-Chienis',
  'Ronzone','Roverè della Luna','Rovereto','Ruffré-Mendola','Rumo','Sagron Mis',
  'Samone','San Giovanni di Fassa','San Lorenzo Dorsino','San Michele all\u2019Adige','Sant\u2019Orsola Terme',
  'Sanzeno','Sarnonico','Scurelle','Sella Giudicarie','Sfruz','Sover','Soraga di Fassa',
  'Spiazzo','Spormaggiore','Sporminore','Stenico','Storo','Strembo','Taio','Telve',
  'Telve di Sopra','Tenna','Tenno','Terragnolo','Terre d\u2019Adige','Terzolas','Tesero',
  'Tione di Trento','Ton','Torcegno','Trambileno','Trento','Tre Ville','Valbondione',
  'Valdaone','Valfloriana','Vallarsa','Vallelaghi','Vermiglio','Vignola-Falesina','Villa Lagarina',
  'Villa di Tirano','Vipiteno','Volano','Ziano di Fiemme'
];

/* ── Circoscrizioni del Comune di Trento. ── */
const CIRCOSCRIZIONI_TRENTO = [
  'Gardolo',
  'Meano',
  'Bondone',
  'Sardagna',
  'Ravina-Romagnano',
  'Argentario',
  'Povo',
  'Mattarello',
  'Villazzano',
  'Oltrefersina',
  'San Giuseppe-Santa Chiara',
  'Centro Storico-Piedicastello',
];

const DEFAULT_GOOGLE_USER = {
  nome: 'Giulia Bianchi',
  email: 'giulia.bianchi@gmail.com',
  picture: null,
};

export default function CompletaProfiloPage({
  googleUser = DEFAULT_GOOGLE_USER,
  onSubmit,
}) {
  const [dataNascita,     setDataNascita]     = useState('');
  const [comuneResidenza, setComuneResidenza] = useState('');
  const [circoscrizione,  setCircoscrizione]  = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const isTrento = comuneResidenza === 'Trento';

  const initials = (googleUser.nome || googleUser.email || '?')
    .split(/\s+/).map((s) => s.charAt(0)).join('').slice(0, 2).toUpperCase();

  const validate = () => {
    if (!dataNascita)     return 'Inserisci la tua data di nascita';
    const d = new Date(dataNascita);
    if (Number.isNaN(d.getTime())) return 'Data di nascita non valida';
    const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (age < 16)  return 'Devi avere almeno 16 anni per partecipare';
    if (age > 120) return 'Data di nascita non valida';
    if (!comuneResidenza) return 'Seleziona il tuo comune di residenza';
    if (isTrento && !circoscrizione) return 'Seleziona la tua circoscrizione';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError('');

    try {
      setSubmitting(true);
      const payload = {
        dataNascita,
        comuneResidenza,
        circoscrizione: isTrento ? circoscrizione : null,
      };
      if (onSubmit) await onSubmit(payload);
      else await new Promise((r) => setTimeout(r, 700));
    } catch (err) {
      setError(err?.message || 'Errore durante il salvataggio');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cp-page">
      <div className="cp-shell">
        <p className="cp-wordmark">IoSonoTrento</p>

        <header className="cp-header">
          <p className="cp-header__eyebrow">Ultimo passo</p>
          <h1 className="cp-header__title">
            Benvenuto a Trento,<br/>
            <span className="cp-header__title-em">{(googleUser.nome || '').split(' ')[0] || 'cittadino'}.</span>
          </h1>
          <p className="cp-header__subtitle">
            Per partecipare alle votazioni e ai sondaggi della tua città abbiamo bisogno di
            qualche informazione in più. Ti chiediamo solo l’essenziale.
          </p>
        </header>

        {/* Google identity card (read-only) */}
        <div className="cp-google" aria-label="Account Google collegato">
          <div className="cp-google__avatar">
            {googleUser.picture
              ? <img src={googleUser.picture} alt=""/>
              : initials}
          </div>
          <div className="cp-google__info">
            <p className="cp-google__name">{googleUser.nome}</p>
            <p className="cp-google__email">{googleUser.email}</p>
          </div>
          <span className="cp-google__pill">
            <Check size={12}/> da Google
          </span>
        </div>

        <form className="cp-card" onSubmit={handleSubmit} noValidate>
          <p className="cp-section-label">Le tue informazioni</p>

          <div className="cp-field">
            <label className="cp-field__label" htmlFor="cp-data">
              Data di nascita <span className="cp-field__required">*</span>
            </label>
            <input
              id="cp-data"
              type="date"
              className="cp-field__input"
              value={dataNascita}
              onChange={(e) => setDataNascita(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
            <p className="cp-field__hint">Devi avere almeno 16 anni per partecipare alle consultazioni.</p>
          </div>

          <div className="cp-field">
            <label className="cp-field__label" htmlFor="cp-comune">
              Comune di residenza <span className="cp-field__required">*</span>
            </label>
            <div className="cp-field__select-wrap">
              <select
                id="cp-comune"
                className="cp-field__select"
                value={comuneResidenza}
                onChange={(e) => {
                  setComuneResidenza(e.target.value);
                  if (e.target.value !== 'Trento') setCircoscrizione('');
                }}
              >
                <option value="">Seleziona un comune…</option>
                {COMUNI_TRENTINO.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <p className="cp-field__hint">Solo i comuni della Provincia Autonoma di Trento.</p>
          </div>

          {isTrento && (
            <div className="cp-field">
              <label className="cp-field__label" htmlFor="cp-circ">
                Circoscrizione <span className="cp-field__required">*</span>
              </label>
              <div className="cp-field__select-wrap">
                <select
                  id="cp-circ"
                  className="cp-field__select"
                  value={circoscrizione}
                  onChange={(e) => setCircoscrizione(e.target.value)}
                >
                  <option value="">Seleziona la tua circoscrizione…</option>
                  {CIRCOSCRIZIONI_TRENTO.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <p className="cp-field__hint">
                Le 12 circoscrizioni del Comune di Trento. Servono per le consultazioni di quartiere.
              </p>
            </div>
          )}

          {error && <p className="cp-msg cp-msg--error">{error}</p>}

          <button type="submit" className="cp-submit" disabled={submitting}>
            {submitting ? 'Salvataggio…' : 'Completa profilo e accedi'}
          </button>

          <p className="cp-privacy">
            Procedendo accetti la <a href="#privacy">Privacy Policy</a> e i{' '}
            <a href="#tos">Termini di Servizio</a>. I tuoi dati sono trattati dal Comune di
            Trento ai sensi del GDPR e non vengono mai condivisi con terze parti.
          </p>
        </form>

        <p className="cp-footer-note">
          <span className="cp-footer-note__lock"><Lock size={11}/> Connessione cifrata</span>
          {' · '}IoSonoTrento {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
