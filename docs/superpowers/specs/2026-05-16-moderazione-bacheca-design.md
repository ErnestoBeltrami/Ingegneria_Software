# Design: ModerazioneBachecaPage

**Data:** 2026-05-16  
**Stato:** approvato

## Obiettivo

Implementare la pagina `/moderazione` collegata alla card "Moderazione bacheca" della dashboard operatore. La pagina permette all'operatore di visualizzare tutte le iniziative dei cittadini e di approvare o rifiutare quelle in attesa.

## Pattern di riferimento

`GestioneVotazioniPage` — stessa struttura visiva e comportamentale, adattata al dominio delle iniziative.

## Layout

```
<div class="mb-layout">
  <TopBar />
  <div class="mb-page">
    <header>              titolo "Moderazione bacheca" + "N proposte totali"
    <div mb-counters>     3 counter card: In attesa (amber) / Approvate (green) / Rifiutate (red)
    <div mb-search-block> search bar + pill filtri: Tutte / In attesa / Approvate / Rifiutate
    <div mb-grid>         griglia 2 colonne di IniziativaCard
  </div>
</div>
+ modal overlay approve/reject (same as dashboard)
```

## Componente IniziativaCard

Campi mostrati:
- Badge stato (colore per stato)
- Titolo iniziativa
- Autore: `nome cognome`
- Categoria
- Data invio (formattata `gg/mm/aa`)

Azioni per stato:
- `in_attesa` → pulsante "Esamina" (amber) → apre modal
- `approvata` → nessun pulsante (badge verde, read-only)
- `rifiutata` → pulsante "Motivazione" → espande il testo della motivazione in-card (no modal, read-only)

## Modal moderazione

Identico al modal già presente in `DashboardOperatorePage`:
- View mode: pulsanti "Pubblica" (verde) e "Rifiuta" (rosso outline)
- Reject mode: textarea motivazione obbligatoria + "Conferma rifiuto" / "Indietro"
- Chiama `PATCH /iniziative/:id/modera` con `{ stato, motivazione }`
- Alla chiusura con successo: rimuove la card dalla lista locale

CSS modal: le classi `.modal-*` rimangono in `DashboardOperatorePage.css`. La nuova pagina importa il proprio CSS (`ModerazioneBachecaPage.css`) senza duplicare le classi modal.

## Dati e API

- `GET /iniziative` — restituisce tutte le iniziative (operatore vede tutti gli stati)
- `PATCH /iniziative/:id/modera` — `{ stato: 'approvata'|'rifiutata', motivazione? }`

Payload risposta `GET /iniziative`:
```json
{
  "iniziative": [
    {
      "_id": "...",
      "titolo": "...",
      "descrizione": "...",
      "stato": "in_attesa|approvata|rifiutata",
      "categoria": "nome categoria",
      "nome_cittadino": "...",
      "cognome_cittadino": "...",
      "motivazione_moderazione": "...",
      "createdAt": "..."
    }
  ]
}
```

## File coinvolti

| File | Azione |
|---|---|
| `frontend/src/pages/operatore/ModerazioneBachecaPage.jsx` | Crea |
| `frontend/src/pages/operatore/ModerazioneBachecaPage.css` | Crea |
| `frontend/src/App.jsx` | Aggiungi route `/moderazione` |

## Decisioni

- CSS modal lasciato in `DashboardOperatorePage.css` (la dashboard lo usa ancora, no duplicazione)
- La dashboard non viene modificata
- Nessun componente condiviso estratto (YAGNI)
