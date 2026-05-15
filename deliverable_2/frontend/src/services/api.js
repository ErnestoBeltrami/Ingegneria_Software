const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
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
    const [votazioniRes, sondaggiRes] = await Promise.all([
        fetchVotazioni(),
        fetchSondaggi(),
    ]);
    return [
        ...(votazioniRes.votazioni || []).map(v => ({ ...v, voted: false })),
        ...(sondaggiRes.sondaggi || []).map(v => ({ ...v, voted: false })),
    ];
};
export const fetchProfile = () => apiFetch('/cittadino/profile');

// Riepilogo sintetico di una votazione (accessibile anche ai cittadini)
export const fetchRiepilogoVotazione = (id) => apiFetch(`/votazioni/${id}/riepilogo`);

// Riepilogo sintetico di un sondaggio (accessibile anche ai cittadini)
export const fetchRiepilogoSondaggio = (id) => apiFetch(`/sondaggio/${id}/riepilogo`);

// Dettaglio sondaggio con tutte le opzioni (accessibile anche ai cittadini)
export const fetchSondaggioById = (id) => apiFetch(`/sondaggio/${id}`);

export const fetchNotifiche = () => apiFetch('/notifiche');
export const marcaNotificaLetta = (id) => apiFetch(`/notifiche/${id}/letta`, { method: 'PATCH' });
export const marcaTutteNotificheLette = () => apiFetch('/notifiche/leggi-tutte', { method: 'PATCH' });
