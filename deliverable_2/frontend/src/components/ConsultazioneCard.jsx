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
  const { _id, tipo, titolo, data_fine, stato } = activity;
  const isDisabled = mode === 'cittadino' && voted;

  const buttonLabel = mode === 'operatore'
    ? 'Riepilogo'
    : voted
      ? 'Votato'
      : (BUTTON_LABELS[tipo] ?? 'Partecipa');

  return (
    <div className={`activity-card${isDisabled ? ' activity-card--voted' : ''}`}>
      <div className="activity-card__header">
        <span className={`badge badge--tipo badge--${tipo}`}>
          {tipo === 'votazione' ? 'Votazione' : 'Sondaggio'}
        </span>
        <span className="badge badge--stato">
          {stato === 'attivo' ? 'In corso' : stato}
        </span>
      </div>
      <p className="activity-card__titolo">{titolo}</p>
      <div className="activity-card__footer">
        <span className="activity-card__termine">Termine: {formatDate(data_fine)}</span>
        <button
          className={`btn-gestisci${isDisabled ? ' btn-gestisci--disabled' : ''}`}
          disabled={isDisabled}
          onClick={() => onAction(_id, tipo)}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
