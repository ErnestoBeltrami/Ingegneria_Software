/* CompletaProfiloPage.jsx
 *
 * Pagina di onboarding cittadino su IoSonoTrento.
 * Mostrata UNA volta dopo il primo login con Google, prima di poter accedere
 * alle funzioni di voto / sondaggi.
 *
 * Props:
 *   googleUser  { nome, email, picture }   (read-only, from Google identity)
 *   onSubmit    ({ dataNascita, circoscrizione, genere, categoria }) => Promise<void>
 *
 * Importa il CSS a fianco:
 *   import './CompletaProfiloPage.css';
 */

import React, { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { CIRCOSCRIZIONI_TRENTO } from '../constants/circoscrizioni';
import './CompletaProfiloPage.css';

const GENERI = ['Uomo', 'Donna'];

const CATEGORIE = ['Lavoratore', 'Disoccupato', 'Pensionato', 'Studente', 'Altro'];

const DEFAULT_GOOGLE_USER = {
  nome: 'Giulia Bianchi',
  email: 'giulia.bianchi@gmail.com',
  picture: null,
};

export default function CompletaProfiloPage({
  googleUser = DEFAULT_GOOGLE_USER,
  onSubmit,
}) {
  const [dataNascita,    setDataNascita]    = useState('');
  const [circoscrizione, setCircoscrizione] = useState('');
  const [genere,         setGenere]         = useState('');
  const [categoria,      setCategoria]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const initials = (googleUser.nome || googleUser.email || '?')
    .split(/\s+/).map((s) => s.charAt(0)).join('').slice(0, 2).toUpperCase();

  const validate = () => {
    if (!dataNascita)     return 'Inserisci la tua data di nascita';
    const d = new Date(dataNascita);
    if (Number.isNaN(d.getTime())) return 'Data di nascita non valida';
    const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (age < 16)  return 'Devi avere almeno 16 anni per partecipare';
    if (age > 120) return 'Data di nascita non valida';
    if (!circoscrizione) return 'Seleziona la tua circoscrizione';
    if (!genere)         return 'Seleziona il tuo genere';
    if (!categoria)      return 'Seleziona la tua occupazione';
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
        circoscrizione,
        genere,
        categoria,
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
            Ehi {(googleUser.nome || '').split(' ')[0] || 'ciao'}, ci siamo quasi.
          </h1>
          <p className="cp-header__subtitle">
            Ancora un attimo e potrai dire la tua sulle scelte della città. Completa il tuo
            profilo con qualche informazione: bastano pochi secondi.
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

          <div className="cp-field">
            <label className="cp-field__label" htmlFor="cp-genere">
              Genere <span className="cp-field__required">*</span>
            </label>
            <div className="cp-field__select-wrap">
              <select
                id="cp-genere"
                className="cp-field__select"
                value={genere}
                onChange={(e) => setGenere(e.target.value)}
              >
                <option value="">Seleziona…</option>
                {GENERI.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="cp-field">
            <label className="cp-field__label" htmlFor="cp-categoria">
              Occupazione <span className="cp-field__required">*</span>
            </label>
            <div className="cp-field__select-wrap">
              <select
                id="cp-categoria"
                className="cp-field__select"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">Seleziona…</option>
                {CATEGORIE.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

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
