# Moderazione Bacheca — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Creare la pagina `/moderazione` per la gestione delle iniziative dei cittadini, collegata alla card "Moderazione bacheca" della dashboard operatore.

**Architecture:** Nuova pagina `ModerazioneBachecaPage` che segue il pattern di `GestioneVotazioniPage`: TopBar, counter cards (In attesa / Approvate / Rifiutate), ricerca + filtri pill, griglia di card. Le iniziative `in_attesa` mostrano il pulsante "Esamina" che apre un modal inline identico a quello già presente nella dashboard. Il modal chiama `PATCH /iniziative/:id/modera`. Le classi CSS `.modal-*` sono già disponibili globalmente tramite `DashboardOperatorePage.css`; le classi `.badge` tramite `ConsultazioneCard.css`.

**Tech Stack:** React 18, React Router v6, Vite, CSS vanilla, Lucide React icons

---

### Contesto del codebase

- Tutte le pagine operatore si trovano in `deliverable_2/frontend/src/pages/operatore/`
- Ogni pagina ha il suo CSS dedicato con prefisso abbreviato (es. `gv-*` per GestioneVotazioni)
- Le classi `.badge`, `.badge--categoria`, `.badge--attesa` sono in `ConsultazioneCard.css` (già globale)
- Le classi `.modal-*` sono in `DashboardOperatorePage.css` (già globale — App.jsx non usa lazy loading)
- `apiFetch` è un pattern locale ripetuto in ogni pagina (non estratto come utility)
- Auth: JWT in `localStorage.getItem('token')`, redirect a `/login` su 401/403

---

### Task 1: Crea il branch

**Files:** nessuno

- [ ] **Step 1: Crea il branch**

```bash
cd /home/fallenangel/Ingegneria_Software
git checkout -b feat/moderazione-bacheca
```

Expected: `Switched to a new branch 'feat/moderazione-bacheca'`

---

### Task 2: Crea ModerazioneBachecaPage.css

**Files:**
- Create: `deliverable_2/frontend/src/pages/operatore/ModerazioneBachecaPage.css`

- [ ] **Step 1: Crea il file CSS**

Crea `deliverable_2/frontend/src/pages/operatore/ModerazioneBachecaPage.css` con il seguente contenuto:

```css
/* Layout */
.mb-layout {
  --topbar-bg: #1f3a89;
  --topbar-fg: white;
  --topbar-border: rgba(255,255,255,0.12);
  --topbar-pill-bg: rgba(255,255,255,0.15);
  --topbar-pill-border: rgba(255,255,255,0.25);
  --topbar-pill-hover: rgba(255,255,255,0.22);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
}

.mb-page {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: 'Montserrat', sans-serif;
  flex: 1;
}

/* Header */
.mb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--border);
}

.mb-header__title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  line-height: 32px;
  margin: 0;
}

.mb-header__subtitle {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-secondary);
  line-height: 20px;
  margin: 2px 0 0;
}

/* Counter cards */
.mb-counters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.mb-counter {
  border-radius: 16px;
  border: 1px solid;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mb-counter--attesa {
  background: rgba(245, 158, 11, 0.10);
  border-color: rgba(245, 158, 11, 0.28);
}

.mb-counter--approvata {
  background: rgba(0, 122, 82, 0.10);
  border-color: rgba(0, 196, 122, 0.28);
}

.mb-counter--rifiutata {
  background: rgba(220, 38, 38, 0.10);
  border-color: rgba(220, 38, 38, 0.28);
}

.mb-counter__num {
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
}

.mb-counter--attesa   .mb-counter__num { color: #f5c842; }
.mb-counter--approvata .mb-counter__num { color: #00d48a; }
.mb-counter--rifiutata .mb-counter__num { color: #f87171; }

.mb-counter__label {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
  line-height: 16px;
}

/* Status / error */
.mb-status {
  font-size: 14px;
  color: var(--text-muted);
  padding: 4px 0;
}

.mb-error {
  font-size: 14px;
  font-weight: 500;
  color: #ff6b6b;
}

/* Search + filters */
.mb-search-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mb-filters {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.mb-filter-btn {
  height: 34px;
  border-radius: 9999px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.mb-filter-btn:hover {
  background: var(--surface-raised);
  color: var(--text);
}

.mb-filter-btn--active {
  background: rgba(245, 158, 11, 0.25);
  border-color: rgba(245, 158, 11, 0.55);
  color: #fbbf24;
  font-weight: 600;
}

/* Grid */
.mb-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

/* Card iniziativa */
.mb-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.mb-card:hover {
  background: var(--surface-raised);
  border-color: var(--border-strong);
}

/* Badge stato */
.mb-badge {
  height: 26px;
  padding: 0 12px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  line-height: 26px;
  white-space: nowrap;
  align-self: flex-start;
  letter-spacing: 0.3px;
}

.mb-badge--in_attesa {
  background: rgba(245, 158, 11, 0.25);
  color: #f5c842;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.mb-badge--approvata {
  background: rgba(0, 122, 82, 0.30);
  color: #00d48a;
  border: 1px solid rgba(0, 196, 122, 0.3);
}

.mb-badge--rifiutata {
  background: rgba(220, 38, 38, 0.20);
  color: #f87171;
  border: 1px solid rgba(220, 38, 38, 0.35);
}

.mb-card__titolo {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  line-height: 22px;
  margin: 0;
  flex: 1;
}

.mb-card__meta {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
}

.mb-card__data {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
  margin: 0;
}

.mb-card__motivazione {
  font-size: 13px;
  color: rgba(248, 113, 113, 0.85);
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.18);
  border-radius: 10px;
  padding: 10px 14px;
  margin: 4px 0 0;
  line-height: 1.5;
}

/* Azioni card */
.mb-card__actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.mb-action {
  height: 32px;
  padding: 0 14px;
  border-radius: 9999px;
  border: 1px solid transparent;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: opacity 0.15s ease;
}

.mb-action:hover { opacity: 0.85; }

.mb-action--esamina {
  background: rgba(245, 158, 11, 0.20);
  border-color: rgba(245, 158, 11, 0.40);
  color: #fbbf24;
}

.mb-action--motivazione {
  background: rgba(220, 38, 38, 0.12);
  border-color: rgba(220, 38, 38, 0.28);
  color: #f87171;
  font-size: 11px;
}
```

---

### Task 3: Crea ModerazioneBachecaPage.jsx

**Files:**
- Create: `deliverable_2/frontend/src/pages/operatore/ModerazioneBachecaPage.jsx`

- [ ] **Step 1: Crea il file JSX**

Crea `deliverable_2/frontend/src/pages/operatore/ModerazioneBachecaPage.jsx`:

```jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import TopBar from '@/components/TopBar';
import './ModerazioneBachecaPage.css';
import '../operatore/DashboardOperatorePage.css';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Errore ${res.status}`);
  return data;
}

const FILTRI = [
  { key: 'tutte',     label: 'Tutte' },
  { key: 'in_attesa', label: 'In attesa' },
  { key: 'approvata', label: 'Approvate' },
  { key: 'rifiutata', label: 'Rifiutate' },
];

export default function ModerazioneBachecaPage() {
  const navigate = useNavigate();
  const nome    = localStorage.getItem('nome') || '';
  const cognome = localStorage.getItem('cognome') || '';

  const [iniziative,   setIniziative]   = useState([]);
  const [query,        setQuery]        = useState('');
  const [filtro,       setFiltro]       = useState('tutte');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const [modalIniziativa, setModalIniziativa] = useState(null);
  const [modalMode,       setModalMode]       = useState('view');
  const [motivazione,     setMotivazione]     = useState('');
  const [modalLoading,    setModalLoading]    = useState(false);
  const [modalError,      setModalError]      = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/iniziative');
      setIniziative(data.iniziative ?? []);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('403')) {
        localStorage.clear();
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  const openModal = (iniziativa) => {
    setModalIniziativa(iniziativa);
    setModalMode('view');
    setMotivazione('');
    setModalError('');
  };

  const closeModal = () => {
    setModalIniziativa(null);
    setModalMode('view');
    setMotivazione('');
    setModalError('');
  };

  const modera = async (stato) => {
    if (stato === 'rifiutata' && !motivazione.trim()) {
      setModalError('La motivazione è obbligatoria per il rifiuto.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      await apiFetch(`/iniziative/${modalIniziativa._id}/modera`, {
        method: 'PATCH',
        body: JSON.stringify({ stato, motivazione: motivazione.trim() || undefined }),
      });
      setIniziative(prev =>
        prev.map(i =>
          i._id === modalIniziativa._id
            ? { ...i, stato, motivazione_moderazione: motivazione.trim() || undefined }
            : i
        )
      );
      closeModal();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const inAttesa  = iniziative.filter(i => i.stato === 'in_attesa');
  const approvate = iniziative.filter(i => i.stato === 'approvata');
  const rifiutate = iniziative.filter(i => i.stato === 'rifiutata');

  const q = query.trim().toLowerCase();
  const filtered = iniziative
    .filter(i => filtro === 'tutte' || i.stato === filtro)
    .filter(i => !q || i.titolo.toLowerCase().includes(q));

  return (
    <>
      <div className="mb-layout">
        <TopBar nome={nome} cognome={cognome} />

        <div className="mb-page">
          <header className="mb-header">
            <div>
              <h1 className="mb-header__title">Moderazione bacheca</h1>
              <p className="mb-header__subtitle">{iniziative.length} proposte totali</p>
            </div>
          </header>

          <div className="mb-counters">
            <div className="mb-counter mb-counter--attesa">
              <span className="mb-counter__num">{inAttesa.length}</span>
              <span className="mb-counter__label">In attesa</span>
            </div>
            <div className="mb-counter mb-counter--approvata">
              <span className="mb-counter__num">{approvate.length}</span>
              <span className="mb-counter__label">Approvate</span>
            </div>
            <div className="mb-counter mb-counter--rifiutata">
              <span className="mb-counter__num">{rifiutate.length}</span>
              <span className="mb-counter__label">Rifiutate</span>
            </div>
          </div>

          <div className="mb-search-block">
            <div className="dashboard-search">
              <Search size={16} color="rgba(255,255,255,0.35)" />
              <input
                className="dashboard-search__input"
                type="text"
                placeholder="Cerca per titolo…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="mb-filters">
              {FILTRI.map(({ key, label }) => (
                <button
                  key={key}
                  className={`mb-filter-btn${filtro === key ? ' mb-filter-btn--active' : ''}`}
                  onClick={() => setFiltro(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mb-error" role="alert">{error}</p>}
          {loading && <p className="mb-status">Caricamento…</p>}

          {!loading && !error && filtered.length === 0 && (
            <p className="mb-status">
              {q ? 'Nessuna proposta trovata per questa ricerca.' : 'Nessuna proposta trovata.'}
            </p>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="mb-grid">
              {filtered.map(i => (
                <IniziativaCard
                  key={i._id}
                  iniziativa={i}
                  onEsamina={() => openModal(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {modalIniziativa && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <span className="badge badge--categoria">{modalIniziativa.categoria}</span>
              <button className="modal-close" onClick={closeModal} aria-label="Chiudi">
                <X size={18} />
              </button>
            </div>

            <h2 className="modal-title">{modalIniziativa.titolo}</h2>
            <p className="modal-meta">
              Proposta da {modalIniziativa.nome_cittadino} {modalIniziativa.cognome_cittadino}
            </p>

            <p className="modal-descrizione">{modalIniziativa.descrizione}</p>

            <div className="modal-divider" />

            {modalMode === 'view' && (
              <div className="modal-actions">
                <button
                  className="modal-btn modal-btn--approve"
                  onClick={() => modera('approvata')}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Salvataggio…' : 'Pubblica'}
                </button>
                <button
                  className="modal-btn modal-btn--reject"
                  onClick={() => setModalMode('reject')}
                  disabled={modalLoading}
                >
                  Rifiuta
                </button>
              </div>
            )}

            {modalMode === 'reject' && (
              <div className="modal-reject-section">
                <label className="modal-reject-label">
                  Motivazione del rifiuto <span style={{ color: '#f87171' }}>*</span>
                </label>
                <textarea
                  className="modal-textarea"
                  placeholder="Spiega al cittadino perché la proposta non può essere pubblicata…"
                  value={motivazione}
                  onChange={e => setMotivazione(e.target.value)}
                  rows={4}
                />
                {modalError && <p className="modal-error">{modalError}</p>}
                <div className="modal-actions">
                  <button
                    className="modal-btn modal-btn--back"
                    onClick={() => { setModalMode('view'); setModalError(''); }}
                    disabled={modalLoading}
                  >
                    Indietro
                  </button>
                  <button
                    className="modal-btn modal-btn--confirm-reject"
                    onClick={() => modera('rifiutata')}
                    disabled={modalLoading || !motivazione.trim()}
                  >
                    {modalLoading ? 'Salvataggio…' : 'Conferma rifiuto'}
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'view' && modalError && (
              <p className="modal-error">{modalError}</p>
            )}

          </div>
        </div>
      )}
    </>
  );
}

function IniziativaCard({ iniziativa, onEsamina }) {
  const [expanded, setExpanded] = useState(false);
  const { stato, titolo, nome_cittadino, cognome_cittadino, categoria, createdAt, motivazione_moderazione } = iniziativa;

  const LABEL = { in_attesa: 'In attesa', approvata: 'Approvata', rifiutata: 'Rifiutata' };

  return (
    <div className="mb-card">
      <span className={`mb-badge mb-badge--${stato}`}>{LABEL[stato] ?? stato}</span>

      <p className="mb-card__titolo">{titolo}</p>
      <p className="mb-card__meta">{nome_cittadino} {cognome_cittadino} · {categoria}</p>
      <p className="mb-card__data">Inviata il {formatDate(createdAt)}</p>

      <div className="mb-card__actions">
        {stato === 'in_attesa' && (
          <button className="mb-action mb-action--esamina" onClick={onEsamina}>
            Esamina
          </button>
        )}
        {stato === 'rifiutata' && motivazione_moderazione && (
          <button
            className="mb-action mb-action--motivazione"
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? 'Nascondi' : 'Motivazione'}
          </button>
        )}
      </div>

      {expanded && motivazione_moderazione && (
        <p className="mb-card__motivazione">{motivazione_moderazione}</p>
      )}
    </div>
  );
}
```

> **Nota sull'import CSS:** la riga `import '../operatore/DashboardOperatorePage.css'` garantisce che le classi `.modal-*` siano disponibili anche se il bundle viene code-splitted. In produzione con Vite senza lazy loading è ridondante, ma rende la dipendenza esplicita.

---

### Task 4: Registra la route in App.jsx

**Files:**
- Modify: `deliverable_2/frontend/src/App.jsx`

- [ ] **Step 1: Aggiungi l'import**

In `App.jsx`, dopo la riga `import ProfiloOperatorePage`:

```jsx
import ModerazioneBachecaPage from './pages/operatore/ModerazioneBachecaPage';
```

- [ ] **Step 2: Aggiungi la route**

Nel blocco `<Routes>`, dopo la route `/operatore/profilo`:

```jsx
<Route path="/moderazione" element={<ModerazioneBachecaPage />} />
```

---

### Task 5: Commit

**Files:** tutti i file creati/modificati

- [ ] **Step 1: Verifica che il frontend compili senza errori**

```bash
cd /home/fallenangel/Ingegneria_Software/deliverable_2
npm run build 2>&1 | tail -20
```

Expected: `✓ built in` senza errori.

- [ ] **Step 2: Commit**

```bash
git add deliverable_2/frontend/src/pages/operatore/ModerazioneBachecaPage.jsx \
        deliverable_2/frontend/src/pages/operatore/ModerazioneBachecaPage.css \
        deliverable_2/frontend/src/App.jsx \
        docs/superpowers/specs/2026-05-16-moderazione-bacheca-design.md \
        docs/superpowers/plans/2026-05-16-moderazione-bacheca.md
git commit -m "feat: aggiungi pagina moderazione bacheca (/moderazione)"
```

---

## Self-Review

**Spec coverage:**
- ✅ Struttura layout identica a GestioneVotazioniPage (TopBar, header, counters, search+filtri, griglia)
- ✅ Counter cards: In attesa (amber) / Approvate (green) / Rifiutate (red)
- ✅ Filtri: Tutte / In attesa / Approvate / Rifiutate
- ✅ IniziativaCard: badge stato, titolo, autore, categoria, data invio
- ✅ `in_attesa` → pulsante "Esamina" → modal
- ✅ `approvata` → solo badge, nessuna azione
- ✅ `rifiutata` → pulsante "Motivazione" → espande testo in-card
- ✅ Modal identico al dashboard (approvazione / rifiuto con motivazione obbligatoria)
- ✅ Route `/moderazione` registrata in App.jsx
- ✅ CSS modal rimane in DashboardOperatorePage.css

**Placeholder scan:** nessun TBD o TODO.

**Type consistency:** `apiFetch`, `formatDate`, nomi classi CSS e prop coerenti in tutti i task.
