import { ActivityCard } from "./ActivityCard";
import { QuickActionCards } from "./QuickActionCard";
import { useState, useEffect } from "react";
import { fetchAllActivities, fetchVotazioni, fetchSondaggi } from "../../../services/api";
import './Dashboard.css';

/*
    const initialData = [
     {
         id: 1,
         category: 'Ambiente',
         type: 'Votazione',
         title: 'Inserimento di cibo vegetariano nelle mense',
         deadline: '30/04/26',
         voted: false,
     },
     {
         id: 2,
         category: 'Mobilità',
         type: 'Votazione',
         title: 'Scivolo da Povo a centro città',
         deadline: '31/12/25',
         voted: false,
     },
     {
         id: 3,
         category: 'Salute',
         type: 'Sondaggio',
         title: 'Hai notato delle cimici in casa?',
         deadline: '15/05/26',
         voted: false,
     },
 ];
*/

const FILTER_MAP = {
    All: () => true,
    Votazione: (a) => a.type === "Votazione",
    Sondaggio: (a) => a.type === "Sondaggio",
};

const FILTER_LABELS = {
    All: 'Tutte le attività',
    Votazione: 'Votazioni attive',
    Sondaggio: 'Sondaggi attivi',
};

export default function Dashboard() {
    const [activities, setActivities] = useState([]);
    const [activeFilter, setActiveFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // fetch dei dati che arrivano dall'api 
    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllActivities();
            setActivities(data);
        } catch (err) {
            console.error("Errore nel caricamento attività:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleFilterChange = (key) => {
        setActiveFilter(key);
    };

    const handleAction = (id) => {
        setActivities(prev => prev.map(a => a.id === id ? { ...a, voted: !a.voted } : a));
    };

    // Is the vote/survey still open today?
    const isNotExpired = (activity) => {
        if (!activity._rawDataFine) return true;
        const deadlineDate = new Date(activity._rawDataFine);
        return deadlineDate >= new Date();
    };

    // Apply type filter + expiry filter
    const visible = activities
        .filter(FILTER_MAP[activeFilter] || (() => true))
        .filter(isNotExpired);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    return (
        <div className="cd-dashboard-page">
            <div className="cd-dashboard-header">
                <h1 className="cd-dashboard-title">Tutte le attività</h1>
                <button className="cd-logout-btn" onClick={handleLogout}>
                    Esci
                </button>
            </div>

            <QuickActionCards />

            <div className="cd-filters">
                {Object.keys(FILTER_MAP).map(key => (
                    <button
                        key={key}
                        className={`cd-filter-btn ${activeFilter === key ? "active" : ""}`}
                        onClick={() => handleFilterChange(key)}
                    >
                        {FILTER_LABELS[key]}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="cd-dashboard-status">
                    <div className="cd-spinner" />
                    <p>Caricamento attività…</p>
                </div>
            )}

            {error && !loading && (
                <div className="cd-dashboard-status cd-dashboard-error">
                    <p>⚠️ {error}</p>
                    <button className="cd-retry-btn" onClick={loadActivities}>
                        Riprova
                    </button>
                </div>
            )}

            {!loading && !error && visible.length === 0 && (
                <div className="cd-dashboard-status">
                    <p>Nessuna attività disponibile al momento.</p>
                </div>
            )}

            {!loading && !error && visible.length > 0 && (
                <div className="cd-activities">
                    {visible.map(a => (
                        <ActivityCard key={a.id} activity={a} onAction={handleAction} />
                    ))}
                </div>
            )}
        </div>
    );
}
