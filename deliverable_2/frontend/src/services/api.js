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

        const votedActivities = JSON.parse(localStorage.getItem('votedActivities') || '[]');

        const normalise = (a) => ({
            _id: a._id,
            tipo: a.tipo,
            titolo: a.titolo,
            descrizione: a.descrizione,
            data_fine: a.data_fine,
            stato: a.stato,
            voted: votedActivities.includes(a._id)
        });

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

export const submitSondaggio = (sondaggioId, dettagliRisposte) => 
    apiFetch('/cittadino/vote/sondaggio', { 
        method: 'POST', 
        body: JSON.stringify({ sondaggioId, dettagliRisposte }) 
    });

// MOCK: fetch sondaggio by ID for cittadino
export const fetchSondaggioCittadino = async (id) => {
    try {
        return await apiFetch(`/sondaggio/${id}`);
    } catch (err) {
        console.warn("API del sondaggio non disponibile per il cittadino, uso mock data.");
        return {
            sondaggio: {
                _id: id,
                titolo: 'Riqualificazione di Piazza Fiera (Mock)',
                descrizione: 'Il comune di Trento intende raccogliere le opinioni della cittadinanza sulle priorità per la riqualificazione di Piazza Fiera. Il sondaggio ha l\'obiettivo di individuare le esigenze più sentite dai residenti in merito ad aree verdi, mobilità e arredo urbano. La tua opinione è fondamentale per il progetto finale.',
                data_fine: '2026-06-15T23:59:59.000Z',
                data_discussione: '2026-05-02T00:00:00.000Z',
                ID_domande: [
                    {
                        _id: 'dom_1',
                        titolo: 'Quale dovrebbe essere la priorità principale?',
                        tipo: 'risposta_singola',
                        opzioni: [
                            { _id: 'op_1_1', testo: 'Aumento delle aree verdi' },
                            { _id: 'op_1_2', testo: 'Più parcheggi per residenti' },
                            { _id: 'op_1_3', testo: 'Aree pedonali più ampie' }
                        ]
                    },
                    {
                        _id: 'dom_2',
                        titolo: 'Quali nuovi arredi urbani riterresti utili? (Puoi scegliere più opzioni)',
                        tipo: 'risposta_multipla',
                        opzioni: [
                            { _id: 'op_2_1', testo: 'Nuove panchine' },
                            { _id: 'op_2_2', testo: 'Fontanelle pubbliche' },
                            { _id: 'op_2_3', testo: 'Cestini per la raccolta differenziata' },
                            { _id: 'op_2_4', testo: 'Rastrelliere per biciclette' }
                        ]
                    }
                ]
            }
        };
    }
};
