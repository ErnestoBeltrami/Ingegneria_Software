import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import TopBarCittadino from '../../../components/TopBarCittadino';
import IniziativaCard from './IniziativaCard';
import './BachecaPage.css';

export default function BachecaPage() {
    const navigate = useNavigate();
    const [profilo, setProfilo] = useState(null);
    const [iniziative, setIniziative] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [pannelloAperto, setPannelloAperto] = useState(false);
    const [sostenute, setSostenute] = useState(new Set());

    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        fetch('/cittadino/profile', { headers })
            .then(r => r.json())
            .then(data => { if (data?.data) setProfilo(data.data); })
            .catch(() => {});

        fetch('/iniziative', { headers })
            .then(r => r.json())
            .then(data => {
                const items = (data.iniziative || []).map(i => ({
                    id: i._id,
                    titolo: i.titolo,
                    descrizione: i.descrizione,
                    categoria: i.categoria,
                    sostenitori: i.numero_voti ?? 0,
                    propostoDa: `${i.nome_cittadino} ${i.cognome_cittadino}`.trim(),
                    data: i.createdAt ?? null,
                }));
                setIniziative(items);
                const giaSostenute = new Set(
                    (data.iniziative || []).filter(i => i.haSostenuto).map(i => i._id)
                );
                setSostenute(giaSostenute);
            })
            .catch(() => setError('Errore nel caricamento delle iniziative.'))
            .finally(() => setLoading(false));
    }, []);

    const onSostieni = (id) => {
        const token = localStorage.getItem('token');
        fetch(`/iniziative/${id}/sostieni`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        }).then(r => {
            if (r.ok) {
                setSostenute(prev => new Set(prev).add(id));
                setIniziative(prev => prev.map(i =>
                    i.id === id ? { ...i, sostenitori: i.sostenitori + 1 } : i
                ));
            } else if (r.status === 409) {
                setSostenute(prev => new Set(prev).add(id));
            }
        }).catch(() => {});
    };

    const categorie = useMemo(
        () => [...new Set(iniziative.map(i => i.categoria).filter(Boolean))],
        [iniziative]
    );

    const iniziativeFiltrate = useMemo(() => {
        const keywords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

        let risultati = categoriaFiltro
            ? iniziative.filter(i => i.categoria === categoriaFiltro)
            : iniziative;

        if (!keywords.length) return risultati;

        return risultati
            .map(i => {
                const titolo = i.titolo.toLowerCase();
                const desc = i.descrizione.toLowerCase();
                const titoloMatch = keywords.filter(k => titolo.includes(k)).length;
                const descMatch = keywords.filter(k => desc.includes(k)).length;
                return { ...i, _titoloMatch: titoloMatch, _descMatch: descMatch };
            })
            .filter(i => i._titoloMatch > 0 || i._descMatch > 0)
            .sort((a, b) => b._titoloMatch - a._titoloMatch || b._descMatch - a._descMatch);
    }, [iniziative, query, categoriaFiltro]);

    return (
        <div className="cd-layout">
            <TopBarCittadino nome={profilo?.nome || ''} cognome={profilo?.cognome || ''} />

            <div className="bac-page">
                <header className="bac-header">
                    <div className="bac-header__left">
                        <h1 className="bac-header__title">Bacheca iniziative 📋</h1>
                        <p className="bac-header__subtitle">Proponi le tue idee e sostieni quelle degli altri</p>
                    </div>
                    <button className="bac-proponi-btn" onClick={() => navigate('/cittadino/iniziativa/crea')}>
                        + Proponi iniziativa
                    </button>
                </header>

                <div className="bac-search">
                    <Search size={16} className="bac-search__icon" />
                    <input
                        type="text"
                        className="bac-search__input"
                        placeholder="Cerca una proposta o iniziativa..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button
                        className={`bac-search__filter-btn${categoriaFiltro ? ' bac-search__filter-btn--active' : ''}`}
                        onClick={() => setPannelloAperto(p => !p)}
                        aria-label="Filtra per categoria"
                    >
                        <SlidersHorizontal size={16} />
                    </button>
                </div>

                {pannelloAperto && (
                    <div className="bac-filtri">
                        <button
                            className={`bac-filtri__pill${!categoriaFiltro ? ' bac-filtri__pill--active' : ''}`}
                            onClick={() => setCategoriaFiltro('')}
                        >
                            Tutte
                        </button>
                        {categorie.map(cat => (
                            <button
                                key={cat}
                                className={`bac-filtri__pill${categoriaFiltro === cat ? ' bac-filtri__pill--active' : ''}`}
                                onClick={() => setCategoriaFiltro(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {loading && <p className="bac-status">Caricamento...</p>}
                {error && <p className="bac-status bac-status--error">{error}</p>}

                {!loading && !error && (
                    <>
                        <p className="bac-count">{iniziativeFiltrate.length} iniziative trovate</p>
                        {iniziativeFiltrate.length === 0 ? (
                            <div className="bac-empty">
                                <p>Nessuna iniziativa trovata.</p>
                            </div>
                        ) : (
                            <div className="bac-grid">
                                {iniziativeFiltrate.map(item => (
                                    <IniziativaCard
                                        key={item.id}
                                        iniziativa={item}
                                        giaSostenuta={sostenute.has(item.id)}
                                        onSostieni={onSostieni}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
