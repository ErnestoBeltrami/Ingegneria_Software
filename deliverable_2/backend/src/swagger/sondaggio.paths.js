/**
 * @swagger
 * /sondaggio:
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
 *             examples:
 *               success:
 *                 value:
 *                   message: "Creazione sondaggio e domande avvenuta con successo."
 *                   sondaggioId: "507f1f77bcf86cd799439011"
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
 *               validationError:
 *                 value:
 *                   message: "Errore di validazione in Mongoose: [dettagli errore]"
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
 *               error: "Database connection error"
 */

