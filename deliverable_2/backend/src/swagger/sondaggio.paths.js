/**
 * @swagger
 * /sondaggi:
 *   post:
 *     summary: Crea un nuovo sondaggio
 *     description: Permette a un operatore autenticato di creare un nuovo sondaggio con multiple domande. Crea automaticamente tutte le domande associate e il sondaggio. Se la creazione fallisce, elimina automaticamente le risorse create (cleanup).
 *     tags:
 *       - Sondaggi
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSondaggioInput'
 *           example:
 *             titolo: "Sondaggio sulla qualità dei servizi"
 *             descrizione: "Sondaggio per valutare la soddisfazione dei cittadini sui servizi pubblici"
 *             data_inizio: "2025-12-10T00:00:00.000Z"
 *             data_fine: "2025-12-20T00:00:00.000Z"
 *             data_discussione: "2025-12-05T00:00:00.000Z"
 *             domande:
 *               - titolo: "Come valuti la qualità del servizio?"
 *                 tipo: "risposta_singola"
 *                 opzioni:
 *                   - testo: "Eccellente"
 *                   - testo: "Buono"
 *                   - testo: "Sufficiente"
 *                   - testo: "Scarso"
 *               - titolo: "Quali servizi utilizzi più spesso?"
 *                 tipo: "risposta_multipla"
 *                 opzioni:
 *                   - testo: "Servizi sanitari"
 *                   - testo: "Servizi educativi"
 *                   - testo: "Servizi di trasporto"
 *                   - testo: "Servizi amministrativi"
 *     responses:
 *       201:
 *         description: Sondaggio creato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Creazione sondaggio e domande avvenuta con successo."
 *                 sondaggioId:
 *                   type: string
 *                   description: ID del sondaggio creato
 *                   example: "507f1f77bcf86cd799439011"
 *       400:
 *         description: Dati mancanti o non validi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingFields:
 *                 value:
 *                   message: "Inserire correttamente tutti i campi (titolo, descrizione, date, data_discussione e almeno una domanda)."
 *               invalidDates:
 *                 value:
 *                   message: "La data di inizio deve essere antecedente alla data di fine."
 *               invalidDiscussione:
 *                 value:
 *                   message: "La data di discussione deve essere antecedente alla data di inizio."
 *               invalidDomande:
 *                 value:
 *                   message: "Tutte le domande devono avere titolo, tipo e un array di opzioni valido."
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
 *             example:
 *               message: "Errore interno del server durante la creazione del sondaggio."
 */

/**
 * @swagger
 * /sondaggi:
 *   get:
 *     summary: Ricerca sondaggi
 *     description: Restituisce la lista di tutti i sondaggi creati dall'operatore autenticato, ordinati per data di inizio (più recenti prima)
 *     tags:
 *       - Sondaggi
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Sondaggi recuperati con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sondaggi recuperate con successo."
 *                 sondaggi:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sondaggio'
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
 *             example:
 *               message: "Errore interno del server durante il recupero dei sondaggi."
 */

/**
 * @swagger
 * /sondaggi/{id}:
 *   get:
 *     summary: Recupera dettagli di un singolo sondaggio
 *     description: Restituisce i dettagli completi di un sondaggio specifico con tutte le domande associate. L'utente può visualizzare solo i sondaggi che ha creato.
 *     tags:
 *       - Sondaggi
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del sondaggio da recuperare
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Sondaggio trovato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sondaggio trovato con successo."
 *                 sondaggio:
 *                   $ref: '#/components/schemas/Sondaggio'
 *       404:
 *         description: Sondaggio non trovato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Sondaggio non trovato."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante il recupero del sondaggio."
 */

/**
 * @swagger
 * /sondaggi/{id}:
 *   patch:
 *     summary: Aggiorna un sondaggio in bozza
 *     description: Permette a un operatore di aggiornare i campi di un sondaggio. Solo i sondaggi in stato "bozza" possono essere modificati. I campi modificabili sono titolo, descrizione, data_inizio, data_fine e data_discussione.
 *     tags:
 *       - Sondaggi
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del sondaggio da aggiornare
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titolo:
 *                 type: string
 *                 description: Nuovo titolo del sondaggio
 *               descrizione:
 *                 type: string
 *                 description: Nuova descrizione del sondaggio
 *               data_inizio:
 *                 type: string
 *                 format: date-time
 *                 description: Nuova data di inizio
 *               data_fine:
 *                 type: string
 *                 format: date-time
 *                 description: Nuova data di fine
 *               data_discussione:
 *                 type: string
 *                 format: date-time
 *                 description: Nuova data di discussione
 *           example:
 *             titolo: "Sondaggio aggiornato sulla qualità dei servizi"
 *             descrizione: "Descrizione aggiornata del sondaggio"
 *             data_inizio: "2025-12-15T00:00:00.000Z"
 *             data_fine: "2025-12-25T00:00:00.000Z"
 *     responses:
 *       200:
 *         description: Sondaggio aggiornato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sondaggio aggiornato con successo."
 *                 sondaggio:
 *                   $ref: '#/components/schemas/Sondaggio'
 *       400:
 *         description: Sondaggio non in stato bozza
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Solo i sondaggi in stato \"bozza\" possono essere modificate."
 *       401:
 *         description: Operatore non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Operatore non autenticato."
 *       404:
 *         description: Sondaggio non trovato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Sondaggio non trovato."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante l'aggiornamento del sondaggio."
 */

/**
 * @swagger
 * /sondaggi/{id}:
 *   delete:
 *     summary: Elimina un sondaggio in bozza
 *     description: Permette a un operatore di eliminare definitivamente un sondaggio. Solo i sondaggi in stato "bozza" possono essere eliminati.
 *     tags:
 *       - Sondaggi
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del sondaggio da eliminare
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Sondaggio eliminato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sondaggio eliminato con successo."
 *       400:
 *         description: Sondaggio non in stato bozza
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Solo i sondaggi in stato \"bozza\" possono essere eliminati."
 *       401:
 *         description: Operatore non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Operatore non autenticato."
 *       404:
 *         description: Sondaggio non trovato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Sondaggio non trovato."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante l'eliminazione del sondaggio."
 */

/**
 * @swagger
 * /sondaggi/{id}/publish:
 *   patch:
 *     summary: Pubblica un sondaggio
 *     description: Cambia lo stato di un sondaggio da "bozza" ad "attivo", rendendolo disponibile per la partecipazione. Solo i sondaggi in stato "bozza" possono essere pubblicati.
 *     tags:
 *       - Sondaggi
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del sondaggio da pubblicare
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Sondaggio pubblicato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sondaggio pubblicato con successo."
 *                 sondaggio:
 *                   $ref: '#/components/schemas/Sondaggio'
 *       400:
 *         description: Sondaggio non in stato bozza
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Solo i sondaggi in stato \"bozza\" possono essere pubblicate."
 *       401:
 *         description: Operatore non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Operatore non autenticato."
 *       404:
 *         description: Sondaggio non trovato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Sondaggio non trovato."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante la pubblicazione del sondaggio."
 */

/**
 * @swagger
 * /sondaggi/{id}/archive:
 *   patch:
 *     summary: Archivia un sondaggio concluso
 *     description: Cambia lo stato di un sondaggio da "concluso" ad "archiviato". Solo i sondaggi in stato "concluso" possono essere archiviati.
 *     tags:
 *       - Sondaggi
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del sondaggio da archiviare
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Sondaggio archiviato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sondaggio archiviato con successo."
 *                 sondaggio:
 *                   $ref: '#/components/schemas/Sondaggio'
 *       400:
 *         description: Sondaggio non in stato concluso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Solo i sondaggi in stato \"concluso\" possono essere archiviate."
 *       401:
 *         description: Operatore non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Operatore non autenticato."
 *       404:
 *         description: Sondaggio non trovato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Sondaggio non trovato."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante l'archiviazione del sondaggio."
 */