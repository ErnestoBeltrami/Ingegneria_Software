/**
 * @swagger
 * /votazioni:
 *   get:
 *     summary: Ottieni tutte le votazioni dell'operatore
 *     description: Restituisce la lista di tutte le votazioni create dall'operatore autenticato, ordinate per data di inizio (più recenti prima)
 *     tags:
 *       - Votazioni
 *     security:
 *       - sessionAuth: []
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
 *     description: Restituisce i dettagli completi di una votazione specifica, inclusa la domanda associata. Solo per votazioni create dall'operatore autenticato.
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
 *       401:
 *         description: Operatore non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         description: Votazione non in stato bozza
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Solo le votazioni in stato bozza possono essere modificate."
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
 *         description: Votazione non in stato bozza
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Solo le votazioni in stato bozza possono essere eliminate."
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
 *         description: Votazione non in stato bozza
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Solo le votazioni in stato bozza possono essere pubblicate."
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
 *         description: Votazione non in stato concluso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Solo le votazioni in stato concluso possono essere archiviate."
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
 *         description: ID votazione non valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "ID Votazione non valido."
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

