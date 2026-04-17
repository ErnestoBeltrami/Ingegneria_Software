# TODO — Prossime feature frontend

---

## 1. Pagina profilo operatore

**Route:** `/operatore/profilo`  
**File:** `pages/operatore/ProfiloOperatorePage.jsx`

### Cosa mostra
- Nome, cognome, username dell'operatore loggato (da localStorage / API)
- Sezione **Cambia password**: form con campo "Password attuale", "Nuova password", "Conferma nuova password" → chiama `PATCH /operatore/me/password`
- Badge ruolo (es. "Operatore" o "Root")

### Come ci si arriva
- Cliccare il blocco utente (avatar + nome) nella TopBar → naviga a `/operatore/profilo`
- Aggiornare `TopBar.jsx`: il `div.topbar__user` diventa `<Link to="/operatore/profilo">`

### API coinvolte
- `GET /operatore/profile` — recupera dati profilo
- `PATCH /operatore/me/password` — cambia password (body: `{ passwordAttuale, nuovaPassword }`)

---

## 2. Comportamento bottone "Gestisci" nella dashboard

Il bottone "Gestisci" appare sulle activity card della `DashboardOperatorePage`.

### Comportamento atteso
- Se `a.tipo === 'votazione'` → naviga a `/votazioni/{a._id}/riepilogo`  
- Se `a.tipo === 'sondaggio'` → naviga a `/sondaggi/{a._id}/riepilogo`

### Cosa serve
- Aggiungere `onClick` al `<button className="btn-gestisci">` in `DashboardOperatorePage.jsx`
- Creare la pagina `RiepilogoSondaggioPage` (analoga a `RiepilogoVotazionePage`) per i sondaggi
- Aggiungere route `/sondaggi/:id/riepilogo` in `App.jsx`

### Note
- La route `/votazioni/:id/riepilogo` esiste già → solo collegare il bottone
- Il riepilogo sondaggio è più complesso: ha più domande (`ID_domande[]`), ognuna con le proprie opzioni → la pagina deve iterare per domanda

---

## 3. Landing page (prima del login)

**Route:** `/`  (attualmente redirect diretto a `/login`)  
**File:** `pages/LandingPage.jsx`

### Cosa mostra
- Header con logo "IoSonoTrento"
- Hero section: titolo ("Partecipa alla vita della tua città"), sottotitolo, immagine/illustrazione
- Sezione "Cosa è IoSonoTrento": 3–4 card con le funzionalità principali (Vota, Proponi, Sondaggi, Trasparenza)
- CTA principale: bottone **"Accedi"** → naviga a `/login`
- Footer leggero con "Comune di Trento"

### Routing
- `App.jsx`: `<Route path="/" element={<LandingPage />} />` (rimuovere il redirect a `/login`)
- Il catch-all `*` continua a redirigere a `/login`

### Note di stile
- Pagina pubblica, nessun TopBar operatore
- Stessa palette del progetto (`#1f3a89` blu, font Montserrat)
- Mobile-friendly (layout a colonna su schermi piccoli)
