import { CheckCircle } from 'lucide-react';
import { getFase } from '../lib/fase';
import './ConsultazioneCard.css';

const BUTTON_LABELS = {
  votazione: 'Vota',
  sondaggio: 'Rispondi',
};

function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

export function ConsultazioneCard({ activity, onAction, mode = 'operatore', voted = false }) {
  const { _id, tipo, titolo, data_inizio, data_fine, stato } = activity;
  const showVoted = mode === 'cittadino' && voted;
  const isInArrivo = mode === 'cittadino' && getFase(activity) === 'in_arrivo';

  const buttonLabel = mode === 'operatore'
    ? 'Riepilogo'
    : voted
      ? 'Partecipato'
      : isInArrivo
        ? 'Scopri'
        : (BUTTON_LABELS[tipo] ?? 'Partecipa');

  return (
    <div className={`activity-card${showVoted ? ' activity-card--voted' : ''}`}>
      <div className="activity-card__header">
        <span className={`badge badge--tipo badge--${tipo}`}>
          {tipo === 'votazione' ? 'Votazione' : 'Sondaggio'}
        </span>
        <span className={`badge badge--stato${isInArrivo ? ' badge--arrivo' : ''}`}>
          {isInArrivo ? 'In arrivo' : stato === 'attivo' ? 'In corso' : stato}
        </span>
      </div>
      <p className="activity-card__titolo">{titolo}</p>
      <div className="activity-card__footer">
        {showVoted ? (
          <span className="activity-card__voted-tag">
            <CheckCircle size={13} />
            Già partecipato
          </span>
        ) : isInArrivo ? (
          <span className="activity-card__termine">Apertura: {formatDate(data_inizio)}</span>
        ) : (
          <span className="activity-card__termine">Termine: {formatDate(data_fine)}</span>
        )}
        <button
          className={`btn-gestisci${showVoted ? ' btn-gestisci--voted' : ''}`}
          onClick={() => onAction(_id, tipo)}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
