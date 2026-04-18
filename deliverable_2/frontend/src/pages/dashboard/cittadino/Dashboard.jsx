import { ActivityCard } from "./ActivityCard";
import { useState } from "react";
import './dashboard.css';

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

const FILTER_MAP = {
    All: () => true,
    Votazione: (a) => a.type === "Votazione",
    Sondaggio: (a) => a.type == "Sondaggio",
};

export default function Dashboard() {
    const [activities, setActivities] = useState(initialData);
    const [activeFilter, setActiveFilter] = useState("All");
    //debug
    //console.log("setactivties", activities);

    const handleAction = (id) => {
        setActivities(prev => prev.map(a => a.id === id ? { ...a, voted: !a.voted } : a));
    };
    // is the vote or survey still valid today? ci serve saperlo
    const isNotExpired = (activity) => {
        const today = new Date();
        const [day, month, year] = activity.deadline.split('/');
        const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
        const deadlineDate = new Date(fullYear, month - 1, day);

        return deadlineDate >= today;
    }

    //filter by type and deadline - bisogna far vedere ciò che si può ancora votare
    const visible = activities.filter(FILTER_MAP[activeFilter] || (() => true)).filter(isNotExpired);

    return (
        <div >
            <p>Tutte le attività</p>
            {/* qui ci va il filtro */}
            <div className="filters">
                {Object.keys(FILTER_MAP).map(key => (
                    <button
                        key={key}
                        className={`filter-btn ${activeFilter === key ? "active" : ""}`}
                        onClick={() => setActiveFilter(key)}
                    >
                        {{ All: 'Tutte le attività', Votazione: 'Votazioni attivi', Sondaggio: 'Sondaggi attivi' }[key]}
                    </button>
                ))}
            </div>

            <div className="activities">
                {visible.map(a => (
                    <ActivityCard key={a.id} activity={a} onAction={handleAction} />
                ))}
            </div>

        </div>
    );
}