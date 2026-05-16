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

export const fetchAllActivities = async () => {
    const [votazioniRes, sondaggiRes] = await Promise.all([
        fetchVotazioni(),
        fetchSondaggi(),
    ]);

    const normalise = (a) => ({
        _id: a._id,
        tipo: a.tipo,
        titolo: a.titolo,
        descrizione: a.descrizione,
        data_fine: a.data_fine,
        data_discussione: a.data_discussione,
        stato: a.stato,
        ID_domande: a.ID_domande,
        voted: a.voted ?? false,
    });

    return [
        ...(votazioniRes.votazioni || []).map(normalise),
        ...(sondaggiRes.sondaggi || sondaggiRes.votazioni || []).map(normalise),
    ];
};
export const fetchProfile = () => apiFetch('/cittadino/profile');

export const fetchNotifiche = () => apiFetch('/notifiche');
export const marcaNotificaLetta = (id) => apiFetch(`/notifiche/${id}/letta`, { method: 'PATCH' });
export const marcaTutteNotificheLette = () => apiFetch('/notifiche/leggi-tutte', { method: 'PATCH' });

export const submitSondaggio = (sondaggioId, dettagliRisposte) => 
    apiFetch('/cittadino/vote/sondaggio', { 
        method: 'POST', 
        body: JSON.stringify({ sondaggioId, dettagliRisposte }) 
    });

export const fetchSondaggioCittadino = async (id) => {
    return apiFetch(`/sondaggio/${id}`);
};

export const fetchVotazioneCittadino = (id) => apiFetch(`/votazioni/${id}`);

export const submitVotazione = (votazioneId, opzioneId) =>
    apiFetch('/cittadino/vote/votazione', {
        method: 'POST',
        body: JSON.stringify({ votazioneId, opzioneId })
    });
