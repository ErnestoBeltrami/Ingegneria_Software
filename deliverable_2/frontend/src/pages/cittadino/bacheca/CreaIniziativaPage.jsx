import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import './CreaIniziativaPage.css';

export default function CreaIniziativaPage() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [categoriaSelezionata, setCategoriaSelezionata] = useState(null);
  const [categorie, setCategorie] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const MAX_DESCRIZIONE = 500;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch('/cittadino/profile', { headers })
      .then((r) => r.json())
      .then((data) => {
        if (data?.data) {
          setNome(data.data.nome || '');
          setCognome(data.data.cognome || '');
        }
      })
      .catch(() => {});

    fetch('/categorie', { headers })
      .then((r) => r.json())
      .then((data) => setCategorie(data.categorie || []))
      .catch(() => {});
  }, []);

  const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
  const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Cittadino';
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!titolo.trim()) return setError('Il titolo è obbligatorio');
    if (!descrizione.trim()) return setError('La descrizione è obbligatoria');
    if (!categoriaSelezionata) return setError('Seleziona una categoria');

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/iniziative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titolo: titolo.trim(),
          descrizione: descrizione.trim(),
          ID_categoria: categoriaSelezionata,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Errore ${res.status}`);
      navigate('/cittadino/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ci-page">
      <header className="ci-topbar">
        <span className="ci-topbar__logo">IoSonoTrento</span>
        <div className="ci-topbar__right">
        <button
          className="ci-topbar__theme"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura'}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <Link to="/cittadino/profilo" className="ci-topbar__user">
          <div className="ci-topbar__avatar">{initials}</div>
          <span className="ci-topbar__name">{fullName}</span>
        </Link>
        </div>
      </header>

      <div className="ci-shell">
        <button type="button" className="ci-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Indietro
        </button>

        <header className="ci-header">
          <h1 className="ci-header__title">Crea iniziativa</h1>
          <p className="ci-header__subtitle">Condividi la tua idea con la città</p>
        </header>

        <div className="ci-banner">
          <Lightbulb size={18} className="ci-banner__icon" />
          <p className="ci-banner__text">
            Le iniziative vengono esaminate dai moderatori prima di essere pubblicate.
            Assicurati che la tua proposta rispetti le linee guida della comunità.
          </p>
        </div>

        <form className="ci-card" onSubmit={handleSubmit} noValidate>
          <div className="ci-field">
            <label className="ci-field__label" htmlFor="titolo">
              Titolo <span className="ci-field__required">*</span>
            </label>
            <input
              id="titolo"
              className="ci-field__input"
              type="text"
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              placeholder="Dai un titolo alla tua iniziativa"
              maxLength={120}
              autoComplete="off"
            />
          </div>

          <div className="ci-field">
            <label className="ci-field__label" htmlFor="descrizione">
              Descrizione <span className="ci-field__required">*</span>
            </label>
            <textarea
              id="descrizione"
              className="ci-field__textarea"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value.slice(0, MAX_DESCRIZIONE))}
              placeholder="Descrivi la tua iniziativa nel dettaglio"
              rows={5}
            />
            <span className={`ci-field__counter${descrizione.length >= MAX_DESCRIZIONE ? ' ci-field__counter--full' : ''}`}>
              {descrizione.length}/{MAX_DESCRIZIONE}
            </span>
          </div>

          <div className="ci-field">
            <span className="ci-field__label">
              Categoria <span className="ci-field__required">*</span>
            </span>
            <div className="ci-pills">
              {categorie.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  className={`ci-pill${categoriaSelezionata === cat._id ? ' ci-pill--active' : ''}`}
                  onClick={() => setCategoriaSelezionata(cat._id)}
                >
                  {cat.nome}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="ci-msg ci-msg--error">{error}</p>}

          <button type="submit" className="ci-submit" disabled={saving}>
            {saving ? 'Invio in corso…' : 'Conferma iniziativa'}
          </button>
        </form>
      </div>
    </div>
  );
}
