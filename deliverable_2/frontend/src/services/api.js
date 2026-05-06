//
//
//
// DA RIMUOVERE !!!!!!
//
//
//
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzQxYjY4ZmEwMWMwMjMzZjY0ZjU2ZCIsInJ1b2xvIjoiY2l0dGFkaW5vIiwiaWF0IjoxNzc3OTAyMDY0LCJleHAiOjE3Nzg1MDY4NjR9.9tYQbdyrqSEi3vktq2g8vsCvGPIXWSRd8SpnYlz6JGA';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || DEV_TOKEN;
    if (!token) {
        throw new Error('Nessun token di autenticazione trovato. Effettua il login.');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

const apiFetch = async (url, options = {}) => {
    const headers = getAuthHeaders();
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
        // Token expired or invalid — clear and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
        throw new Error('Sessione scaduta. Effettua nuovamente il login.');
    }

    let data;
    const text = await res.text();
    try {
        data = text ? JSON.parse(text) : {};
    } catch (err) {
        console.error("Non-JSON response from server:", text);
        throw new Error(`Errore di connessione al server (${res.status}). Il server potrebbe essere spento.`);
    }

    if (!res.ok) {
        throw new Error(data.message || `Errore API: ${res.status}`);
    }

    return data;
};


export const fetchVotazioni = () => apiFetch('/votazioni/cittadino');
export const fetchSondaggi = () => apiFetch('/sondaggio/cittadino');

// fetch votazioni + sondaggi in parallelo 
export const fetchAllActivities = async () => {
    try {
        const [votazioniRes, sondaggiRes] = await Promise.all([
            fetchVotazioni(),
            fetchSondaggi(),
        ]);

        const votazioni = (votazioniRes.votazioni || []).map(normalise);
        const sondaggi = (sondaggiRes.votazioni || []).map(normalise);

        return [...votazioni, ...sondaggi];
    } catch (error) {
        console.warn("Backend non raggiungibile, mostro dati fittizi per testare la UI:", error.message);
        return [
            {
                id: 'vot_123',
                type: 'Votazione',
                title: 'Inserimento di cibo vegetariano nelle mense',
                description: 'Si propone l\'inserimento di opzioni vegetariane in tutte le mense scolastiche e comunali...',
                deadline: '30/05/26',
                voted: false,
                stato: 'attivo',
                _rawDataFine: '2026-05-30T23:59:59.000Z'
            },
            {
                id: 'sond_456',
                type: 'Sondaggio',
                title: 'Riqualificazione di Piazza Fiera',
                description: 'Il comune intende raccogliere le opinioni sulle priorità per le aree verdi e la mobilità.',
                deadline: '15/06/26',
                voted: false,
                stato: 'attivo',
                _rawDataFine: '2026-06-15T23:59:59.000Z'
            }
        ];
    }
};
export const fetchProfile = () => apiFetch('/cittadino/profile');

// formato giusto per l'activitycard
const normalise = (item) => ({
    id: item._id,
    type: item.tipo === 'votazione' ? 'Votazione' : 'Sondaggio',
    title: item.titolo,
    description: item.descrizione || '',
    deadline: formatDate(item.data_fine),
    stato: item.stato,
    // raw ISO date kept for expiry comparison
    _rawDataFine: item.data_fine,
});

// format giusto
const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
};
