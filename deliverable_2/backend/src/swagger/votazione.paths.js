/**
 * @swagger
 * /votazioni:
 *   get:
 *     summary: Lista votazioni dell'operatore
 *     description: Restituisce la lista paginata delle votazioni create dall'operatore autenticato, ordinate per data di inizio (più recenti prima). Supporta filtro per stato e paginazione.
 *     tags:
 *       - Votazioni
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: stato
 *         schema:
 *           type: string
 *           enum: [bozza, attivo, concluso, archiviato]
 *         description: Filtra le votazioni per stato
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero di pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Numero di risultati per pagina (max 100)
 *     responses:
 *       200:
 *         description: Votazioni recuperate con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Votazioni recuperate con successo."
 *                 votazioni:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VotazioneWithDomanda'
 *                 paginazione:
 *                   type: object
 *                   properties:
 *                     totale:
 *                       type: integer
 *                       example: 35
 *                     pagina:
 *                       type: integer
 *                       example: 1
 *                     limite:
 *                       type: integer
 *                       example: 10
 *                     pagine:
 *                       type: integer
 *                       example: 4
 *       400:
 *         description: Stato non valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Stato non valido. Valori ammessi: bozza, attivo, concluso, archiviato."
 *       401:
 *         description: Operatore non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Operatore non autenticato."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Crea una nuova votazione
 *     description: Permette a un operatore autenticato di creare una nuova votazione. Crea automaticamente anche la domanda associata.
 *     tags:
 *       - Votazioni
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVotazioneInput'
 *           example:
 *             titoloVotazione: "Referendum sulla proposta X"
 *             descrizione: "Votazione per decidere se approvare la proposta X"
 *             data_inizio: "2025-12-10T00:00:00.000Z"
 *             data_fine: "2025-12-20T00:00:00.000Z"
 *             data_discussione: "2025-12-05T00:00:00.000Z"
 *             domanda:
 *               titolo: "Sei favorevole alla proposta?"
 *               tipo: "risposta_singola"
 *               opzioni:
 *                 - testo: "Sì"
 *                 - testo: "No"
 *     responses:
 *       201:
 *         description: Votazione creata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Votazione creata con successo."
 *                 votazione:
 *                   $ref: '#/components/schemas/Votazione'
 *       400:
 *         description: Dati mancanti o non validi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingData:
 *                 value:
 *                   message: "Dati mancanti per la creazione della votazione."
 *               invalidDomanda:
 *                 value:
 *                   message: "La domanda deve avere titolo, tipo e almeno due opzioni."
 *       401:
 *         description: Operatore non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Operatore non autenticato."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /votazioni/{id}:
 *   get:
 *     summary: Ottieni dettaglio di una votazione
 *     description: |
 *       Restituisce i dettagli completi di una votazione specifica, inclusa la domanda con le opzioni.
 *       Il comportamento varia in base al ruolo del chiamante:
 *       - **Operatore**: accede a votazioni in qualsiasi stato (bozza, attivo, concluso, archiviato).
 *       - **Cittadino**: accede solo a votazioni in stato `attivo` o `concluso`. La risposta include
 *         il campo `voted` (`true` se il cittadino ha già espresso il proprio voto, `false` altrimenti).
 *     tags:
 *       - Votazioni
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della votazione
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Votazione trovata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Votazione trovata con successo."
 *                 votazione:
 *                   $ref: '#/components/schemas/VotazioneWithDomanda'
 *                 voted:
 *                   type: boolean
 *                   description: "Presente solo per il cittadino: true se ha già votato questa votazione"
 *                   example: false
 *             examples:
 *               operatore:
 *                 summary: Risposta operatore (nessun campo voted)
 *                 value:
 *                   message: "Votazione trovata con successo."
 *                   votazione:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     tipo: "votazione"
 *                     stato: "attivo"
 *                     titolo: "Referendum sulla proposta X"
 *                     descrizione: "Votazione per decidere..."
 *                     data_inizio: "2026-05-01T00:00:00.000Z"
 *                     data_fine: "2026-05-30T23:59:59.000Z"
 *                     data_discussione: "2026-04-15T00:00:00.000Z"
 *                     ID_domanda:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       titolo: "Sei favorevole alla proposta?"
 *                       tipo: "risposta_singola"
 *                       opzioni:
 *                         - _id: "507f1f77bcf86cd799439013"
 *                           testo: "Sì"
 *                         - _id: "507f1f77bcf86cd799439014"
 *                           testo: "No"
 *               cittadino:
 *                 summary: Risposta cittadino (include campo voted)
 *                 value:
 *                   message: "Votazione trovata con successo."
 *                   votazione:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     tipo: "votazione"
 *                     stato: "attivo"
 *                     titolo: "Referendum sulla proposta X"
 *                     descrizione: "Votazione per decidere..."
 *                     data_inizio: "2026-05-01T00:00:00.000Z"
 *                     data_fine: "2026-05-30T23:59:59.000Z"
 *                     data_discussione: "2026-04-15T00:00:00.000Z"
 *                     ID_domanda:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       titolo: "Sei favorevole alla proposta?"
 *                       tipo: "risposta_singola"
 *                       opzioni:
 *                         - _id: "507f1f77bcf86cd799439013"
 *                           testo: "Sì"
 *                         - _id: "507f1f77bcf86cd799439014"
 *                           testo: "No"
 *                   voted: false
 *       400:
 *         description: ID non valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "ID non valido."
 *       401:
 *         description: Utente non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Votazione non trovata (o non visibile al cittadino perché in stato bozza/archiviato)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Votazione non trovata."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   patch:
 *     summary: Modifica una votazione
 *     description: Modifica una votazione in stato bozza. Campi modificabili sono titolo, descrizione, data_inizio, data_fine, data_discussione
 *     tags:
 *       - Votazioni
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della votazione
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVotazioneInput'
 *           example:
 *             data_inizio: "2025-12-15T00:00:00.000Z"
 *             data_fine: "2025-12-25T00:00:00.000Z"
 *             data_discussione: "2025-12-10T00:00:00.000Z"
 *     responses:
 *       200:
 *         description: Votazione aggiornata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Votazione aggiornata con successo."
 *                 votazione:
 *                   $ref: '#/components/schemas/Votazione'
 *       400:
 *         description: ID non valido o votazione non in stato bozza
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidId:
 *                 value:
 *                   message: "ID non valido."
 *               notBozza:
 *                 value:
 *                   message: "Solo le votazioni in stato bozza possono essere modificate."
 *       404:
 *         description: Votazione non trovata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Votazione non trovata."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Elimina una votazione
 *     description: Permette di eliminare una votazione solo se è in stato bozza. Solo le votazioni create dall'operatore autenticato possono essere eliminate.
 *     tags:
 *       - Votazioni
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della votazione
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Votazione eliminata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Votazione eliminata con successo."
 *       400:
 *         description: ID non valido o votazione non in stato bozza
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidId:
 *                 value:
 *                   message: "ID non valido."
 *               notBozza:
 *                 value:
 *                   message: "Solo le votazioni in stato bozza possono essere eliminate."
 *       404:
 *         description: Votazione non trovata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Votazione non trovata."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /votazioni/{id}/publish:
 *   patch:
 *     summary: Pubblica una votazione
 *     description: Cambia lo stato di una votazione da bozza a attivo, rendendola disponibile per il voto. Solo le votazioni in stato bozza possono essere pubblicate.
 *     tags:
 *       - Votazioni
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della votazione
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Votazione pubblicata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Votazione pubblicata con successo."
 *                 votazione:
 *                   $ref: '#/components/schemas/Votazione'
 *       400:
 *         description: ID non valido o votazione non in stato bozza
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidId:
 *                 value:
 *                   message: "ID non valido."
 *               notBozza:
 *                 value:
 *                   message: "Solo le votazioni in stato bozza possono essere pubblicate."
 *       404:
 *         description: Votazione non trovata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Votazione non trovata."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /votazioni/{id}/archive:
 *   patch:
 *     summary: Archivia una votazione
 *     description: Cambia lo stato di una votazione da concluso a archiviato. Solo le votazioni in stato concluso possono essere archiviate.
 *     tags:
 *       - Votazioni
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della votazione
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Votazione archiviata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Votazione archiviata con successo."
 *                 votazione:
 *                   $ref: '#/components/schemas/Votazione'
 *       400:
 *         description: ID non valido o votazione non in stato concluso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidId:
 *                 value:
 *                   message: "ID non valido."
 *               notConcluso:
 *                 value:
 *                   message: "Solo le votazioni in stato concluso possono essere archiviate."
 *       404:
 *         description: Votazione non trovata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Votazione non trovata."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /votazioni/{id}/riepilogo:
 *   get:
 *     summary: Ottieni riepilogo sintetico di una votazione
 *     description: Restituisce un riepilogo con il conteggio dei voti per ogni opzione, le percentuali e il totale dei voti. Accessibile da qualsiasi utente autenticato.
 *     tags:
 *       - Votazioni
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della votazione
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Riepilogo sintetico recuperato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Riepilogo sintetico recuperato."
 *                 votazione:
 *                   type: string
 *                   description: Titolo della votazione
 *                   example: "Referendum sulla proposta X"
 *                 domanda:
 *                   type: string
 *                   description: Titolo della domanda
 *                   example: "Sei favorevole alla proposta?"
 *                 totaleVoti:
 *                   type: number
 *                   description: Numero totale di voti ricevuti
 *                   example: 150
 *                 risultati:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RiepilogoRisultato'
 *             examples:
 *               success:
 *                 value:
 *                   message: "Riepilogo sintetico recuperato."
 *                   votazione: "Referendum sulla proposta X"
 *                   domanda: "Sei favorevole alla proposta?"
 *                   totaleVoti: 150
 *                   risultati:
 *                     - opzioneId: "507f1f77bcf86cd799439011"
 *                       testoOpzione: "Sì"
 *                       voti: 98
 *                       percentuale: 65.33
 *                     - opzioneId: "507f1f77bcf86cd799439012"
 *                       testoOpzione: "No"
 *                       voti: 52
 *                       percentuale: 34.67
 *       400:
 *         description: ID non valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "ID non valido."
 *       404:
 *         description: Votazione non trovata o domanda mancante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Votazione non trovata o domanda collegata mancante."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /votazioni/cittadino:
 *   get:
 *     summary: Recupera votazioni disponibili per i cittadini
 *     description: Restituisce la lista di tutte le votazioni in stato "attivo" o "concluso", visibili ai cittadini autenticati. Le votazioni sono ordinate per data di inizio (più recenti prima).
 *     tags:
 *       - Votazioni
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Votazioni recuperate con successo o nessuna votazione disponibile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Messaggio di conferma
 *                 votazioni:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Votazione'
 *                   description: Array di votazioni disponibili (presente solo se ci sono votazioni)
 *             examples:
 *               withVotazioni:
 *                 value:
 *                   message: "Votazioni recuperate con successo."
 *                   votazioni:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       tipo: "votazione"
 *                       stato: "attivo"
 *                       titolo: "Votazione sul nuovo piano urbanistico"
 *                       descrizione: "Votazione per approvare il piano urbanistico 2025"
 *                       data_inizio: "2025-12-10T00:00:00.000Z"
 *                       data_fine: "2025-12-20T00:00:00.000Z"
 *                       data_discussione: "2025-12-05T00:00:00.000Z"
 *                       creatoDa: "507f1f77bcf86cd799439012"
 *                       ID_domande: []
 *                     - _id: "507f1f77bcf86cd799439013"
 *                       tipo: "votazione"
 *                       stato: "concluso"
 *                       titolo: "Votazione sulla mobilità sostenibile"
 *                       descrizione: "Votazione per le nuove piste ciclabili"
 *                       data_inizio: "2025-11-01T00:00:00.000Z"
 *                       data_fine: "2025-11-15T00:00:00.000Z"
 *                       data_discussione: "2025-10-25T00:00:00.000Z"
 *                       creatoDa: "507f1f77bcf86cd799439012"
 *                       ID_domande: []
 *               noVotazioni:
 *                 value:
 *                   message: "Nessuna votazione disponibile al momento"
 *       401:
 *         description: Cittadino non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Cittadino non autenticato."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante il recupero delle votazioni."
 *               error: "Database connection error"
 */