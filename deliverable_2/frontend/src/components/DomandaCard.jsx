import { Plus, X } from 'lucide-react';

export default function DomandaCard({
  domanda,
  index,
  totaleDomande,
  onTitoloChange,
  onTipoChange,
  onAddOpzione,
  onUpdateOpzione,
  onRemoveOpzione,
  onRemoveDomanda,
}) {
  const isMultipla = domanda.tipo === 'risposta_multipla';

  return (
    <div className="crea-card crea-domanda">
      <div className="crea-domanda__header">
        <span className="crea-domanda__num">Domanda {index + 1}</span>
        {totaleDomande > 1 && (
          <button
            type="button"
            className="crea-domanda__remove"
            onClick={() => onRemoveDomanda(index)}
            aria-label={`Rimuovi domanda ${index + 1}`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="crea-field">
        <label className="crea-field__label">Testo della domanda</label>
        <input
          type="text"
          className="crea-field__input"
          placeholder="Inserisci la domanda"
          value={domanda.titolo}
          onChange={(e) => onTitoloChange(index, e.target.value)}
        />
      </div>

      <div className="crea-opzioni">
        {domanda.opzioni.map((opzione, j) => (
          <div key={j} className="crea-opzione">
            <div className={`crea-opzione__indicator ${isMultipla ? 'crea-opzione__indicator--check' : ''}`} />
            <input
              type="text"
              className="crea-field__input crea-opzione__input"
              placeholder={`Opzione ${j + 1}`}
              value={opzione}
              onChange={(e) => onUpdateOpzione(index, j, e.target.value)}
            />
            {domanda.opzioni.length > 2 && (
              <button
                type="button"
                className="crea-opzione__delete"
                onClick={() => onRemoveOpzione(index, j)}
                aria-label={`Rimuovi opzione ${j + 1}`}
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button type="button" className="crea-add-opzione" onClick={() => onAddOpzione(index)}>
        <Plus size={13} />
        Aggiungi un'altra opzione
      </button>

      <div className="crea-domanda__tipo">
        <div>
          <p className="crea-toggle__label">Risposte multiple</p>
          <p className="crea-toggle__desc">Gli utenti possono selezionare più opzioni</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isMultipla}
          className={`toggle-switch ${isMultipla ? 'toggle-switch--on' : ''}`}
          onClick={() => onTipoChange(index)}
        />
      </div>
    </div>
  );
}
