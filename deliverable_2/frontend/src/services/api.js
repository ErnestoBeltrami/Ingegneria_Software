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
    try {
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
            voted: a.voted || false // Il backend potrebbe non restituirlo ancora direttamente nella lista, ma lo gestiremo al submit
        });

        const votazioni = (votazioniRes.votazioni || []).map(normalise);
        const sondaggi = (sondaggiRes.sondaggi || []).map(normalise);

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
