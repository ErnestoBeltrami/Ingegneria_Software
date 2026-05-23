import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import TopBarCittadino from '../../../components/TopBarCittadino';
import IniziativaCard from './IniziativaCard';
import './BachecaPage.css';

export default function BachecaPage() {
    const navigate = useNavigate();
    const [iniziative, setIniziative] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

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
                }));
                setIniziative(items);
            })
            .catch(() => setError('Errore nel caricamento delle iniziative.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="cd-layout">
            <TopBarCittadino />

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
                        readOnly
                    />
                    <SlidersHorizontal size={16} className="bac-search__filter" />
                </div>

                {loading && <p className="bac-status">Caricamento...</p>}
                {error && <p className="bac-status bac-status--error">{error}</p>}

                {!loading && !error && (
                    <>
                        <p className="bac-count">{iniziative.length} iniziative trovate</p>
                        <div className="bac-grid">
                            {iniziative.map(item => (
                                <IniziativaCard key={item.id} iniziativa={item} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
