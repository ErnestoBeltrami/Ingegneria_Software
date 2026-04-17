# Concept: Landing Page IoSonoTrento

## Osservazione di partenza

La `LoginPage` attuale è un layout a due pannelli:
- **Sinistra (scuro):** logo, tagline, headline, descrizione, 3 feature icon, footer istituzionale
- **Destra (chiaro):** card con selezione ruolo + form operatore

Tutta la parte sinistra è **contenuto informativo** che non appartiene al login. Spostarla su una landing page rende il login più pulito e dà a IoSonoTrento una presenza pubblica propria.

---

## Struttura proposta per la Landing Page

### 1. Navbar fissa
- Logo "IoSonoTrento" a sinistra
- Bottone **"Accedi"** a destra → naviga a `/login`
- Sfondo trasparente che diventa solido allo scroll

### 2. Hero section (above the fold)
- Headline grande: *"Partecipa alla vita della tua città"*
- Subheadline: *"Vota, proponi e lascia la tua voce sulle decisioni che contano a Trento."*
- Due CTA affiancati:
  - **"Accedi con Google"** (cittadino) → diretto a `/auth/google`
  - **"Accedi come operatore"** → naviga a `/login?role=operatore`
- Immagine/illustrazione a destra (es. mappa stilizzata di Trento o icone civic)

> Il doppio CTA nell'hero elimina il passaggio "seleziona ruolo" dalla login page
> per il flusso più comune (cittadino con Google).

### 3. Sezione "Cosa puoi fare"
3 card in griglia:

| Icona       | Titolo                | Descrizione                                            |
|-------------|----------------------|--------------------------------------------------------|
| Vote        | Vota le proposte     | Esprimi la tua opinione su temi che contano per Trento |
| Users       | Proponi iniziative   | Condividi idee con la comunità e raccogli supporto     |
| BarChart2   | Partecipa ai sondaggi| Rispondi alle consultazioni del Comune                 |

### 4. Sezione "Come funziona" (3 step)
Flusso visivo per il cittadino:
1. **Accedi** con il tuo account Google
2. **Esplora** votazioni e iniziative attive
3. **Partecipa** — vota, proponi, fai sentire la tua voce

### 5. Footer
- Logo + tagline "La tua voce per la tua città"
- "Un servizio del Comune di Trento"
- Link: Privacy · Accessibilità

---

## Login page semplificata (dopo la riorganizzazione)

Con il contenuto informativo spostato sulla landing, la login page diventa:
- Layout centrato a colonna singola (no split)
- Card unica con solo:
  - Titolo "Accedi a IoSonoTrento"
  - Bottone **"Accedi come cittadino"** (Google)
  - Bottone **"Accedi come operatore"** → mostra il form username/password inline
  - Link "← Torna alla home" in fondo
- Nessun testo descrittivo, nessuna feature list — già visti sulla landing

---

## Note di routing

| Route | Comportamento attuale    | Comportamento nuovo      |
|-------|--------------------------|--------------------------|
| /     | Redirect a /login        | LandingPage              |
| /login| LoginPage split          | LoginPage semplificata   |
| *     | Redirect a /login        | Redirect a /             |

---

## Stile
- Stessa palette: #1f3a89 blu, #007a52 verde, sfondo #f9fafb
- Font Montserrat già caricato globalmente
- La navbar usa lo stesso sfondo scuro (#090a0a) del pannello sinistro attuale
- Mobile-friendly: hero a colonna singola sotto 768px, feature card impilate
