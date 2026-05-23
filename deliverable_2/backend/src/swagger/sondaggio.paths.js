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
 *     summary: Lista sondaggi dell'operatore
 *     description: Restituisce la lista paginata dei sondaggi creati dall'operatore autenticato, ordinati per data di inizio (più recenti prima). Supporta filtro per stato e paginazione.
 *     tags:
 *       - Sondaggi
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: stato
 *         schema:
 *           type: string
 *           enum: [bozza, attivo, concluso, archiviato]
 *         description: Filtra i sondaggi per stato
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
 *         description: Sondaggi recuperati con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sondaggi recuperati con successo."
 *                 sondaggi:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sondaggio'
 *                 paginazione:
 *                   type: object
 *                   properties:
 *                     totale:
 *                       type: integer
 *                       example: 42
 *                     pagina:
 *                       type: integer
 *                       example: 1
 *                     limite:
 *                       type: integer
 *                       example: 10
 *                     pagine:
 *                       type: integer
 *                       example: 5
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
 *       400:
 *         description: ID non valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "ID non valido."
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
 *         description: ID non valido o sondaggio non in stato bozza
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
 *                   message: "Solo i sondaggi in stato \"bozza\" possono essere modificate."
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
 *         description: ID non valido o sondaggio non in stato bozza
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
 *                   message: "Solo i sondaggi in stato \"bozza\" possono essere eliminati."
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
 *         description: ID non valido o sondaggio non in stato bozza
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
 *                   message: "Solo i sondaggi in stato \"bozza\" possono essere pubblicate."
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
 *         description: ID non valido o sondaggio non in stato concluso
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
 *                   message: "Solo i sondaggi in stato \"concluso\" possono essere archiviate."
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

/**
 * @swagger
 * /sondaggi/{id}/riepilogo:
 *   get:
 *     summary: Recupera il riepilogo sintetico dei risultati di un sondaggio
 *     description: Restituisce un riepilogo completo dei risultati di un sondaggio con il conteggio dei voti per ogni opzione di ogni domanda, incluse le percentuali calcolate sul totale dei partecipanti unici. Utilizza aggregazione per calcolare i risultati in modo efficiente.
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
 *         description: ID del sondaggio di cui recuperare il riepilogo
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
 *                   example: "Riepilogo sintetico recuperato con successo."
 *                 sondaggio:
 *                   type: string
 *                   description: Titolo del sondaggio
 *                   example: "Sondaggio sulla qualità dei servizi"
 *                 totaleVotiUnici:
 *                   type: integer
 *                   description: Numero totale di cittadini che hanno partecipato al sondaggio
 *                   example: 150
 *                 riepilogoPerDomanda:
 *                   type: array
 *                   description: Array contenente i risultati per ogni domanda del sondaggio
 *                   items:
 *                     type: object
 *                     properties:
 *                       domandaId:
 *                         type: string
 *                         description: ID della domanda
 *                         example: "507f1f77bcf86cd799439012"
 *                       titoloDomanda:
 *                         type: string
 *                         description: Testo della domanda
 *                         example: "Come valuti la qualità del servizio?"
 *                       risultati:
 *                         type: array
 *                         description: Array contenente i risultati per ogni opzione della domanda
 *                         items:
 *                           type: object
 *                           properties:
 *                             opzioneId:
 *                               type: string
 *                               description: ID dell'opzione
 *                               example: "507f1f77bcf86cd799439013"
 *                             testoOpzione:
 *                               type: string
 *                               description: Testo dell'opzione
 *                               example: "Eccellente"
 *                             voti:
 *                               type: integer
 *                               description: Numero di voti ricevuti dall'opzione
 *                               example: 45
 *                             percentuale:
 *                               type: number
 *                               format: float
 *                               description: Percentuale di voti rispetto al totale dei partecipanti
 *                               example: 30.00
 *             example:
 *               message: "Riepilogo sintetico recuperato con successo."
 *               sondaggio: "Sondaggio sulla qualità dei servizi"
 *               totaleVotiUnici: 150
 *               riepilogoPerDomanda:
 *                 - domandaId: "507f1f77bcf86cd799439012"
 *                   titoloDomanda: "Come valuti la qualità del servizio?"
 *                   risultati:
 *                     - opzioneId: "507f1f77bcf86cd799439013"
 *                       testoOpzione: "Eccellente"
 *                       voti: 45
 *                       percentuale: 30.00
 *                     - opzioneId: "507f1f77bcf86cd799439014"
 *                       testoOpzione: "Buono"
 *                       voti: 60
 *                       percentuale: 40.00
 *                     - opzioneId: "507f1f77bcf86cd799439015"
 *                       testoOpzione: "Sufficiente"
 *                       voti: 30
 *                       percentuale: 20.00
 *                     - opzioneId: "507f1f77bcf86cd799439016"
 *                       testoOpzione: "Scarso"
 *                       voti: 15
 *                       percentuale: 10.00
 *                 - domandaId: "507f1f77bcf86cd799439017"
 *                   titoloDomanda: "Quali servizi utilizzi più spesso?"
 *                   risultati:
 *                     - opzioneId: "507f1f77bcf86cd799439018"
 *                       testoOpzione: "Servizi sanitari"
 *                       voti: 80
 *                       percentuale: 53.33
 *                     - opzioneId: "507f1f77bcf86cd799439019"
 *                       testoOpzione: "Servizi educativi"
 *                       voti: 95
 *                       percentuale: 63.33
 *       400:
 *         description: ID non valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "ID non valido."
 *       404:
 *         description: Sondaggio non trovato o domande mancanti
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Sondaggio non trovato o domande mancanti."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server."
 *               error: "Database aggregation error"
 */

/**
 * @swagger
 * /sondaggi/cittadino:
 *   get:
 *     summary: Recupera sondaggi disponibili per i cittadini
 *     description: Restituisce la lista di tutti i sondaggi in stato "attivo" o "concluso", visibili ai cittadini autenticati. I sondaggi sono ordinati per data di inizio (più recenti prima). A differenza delle votazioni, i sondaggi contengono multiple domande (ID_domande array) invece di una singola domanda. Ogni elemento include il campo `voted` (`true` se il cittadino ha già risposto, `false` altrimenti).
 *     tags:
 *       - Sondaggi
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero di pagina (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Risultati per pagina (max 100, default 10)
 *     responses:
 *       200:
 *         description: Sondaggi recuperati con successo o nessun sondaggio disponibile
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Consultazione'
 *                       - type: object
 *                         properties:
 *                           tipo:
 *                             type: string
 *                             enum: [sondaggio]
 *                             example: "sondaggio"
 *                           ID_domande:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: Array di ID delle domande associate al sondaggio (minimo 1)
 *                             example: ["507f1f77bcf86cd799439015", "507f1f77bcf86cd799439016"]
 *                           voted:
 *                             type: boolean
 *                             description: "true se il cittadino autenticato ha già risposto a questo sondaggio"
 *                             example: false
 *                   description: Array di sondaggi disponibili (presente solo se ci sono sondaggi). Nota - la proprietà è chiamata "votazioni" per compatibilità con il controller.
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
 *             examples:
 *               withSondaggi:
 *                 value:
 *                   message: "Sondaggi recuperati con successo."
 *                   votazioni:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       tipo: "sondaggio"
 *                       stato: "attivo"
 *                       titolo: "Sondaggio sulla qualità dei servizi"
 *                       descrizione: "Sondaggio per valutare la soddisfazione dei cittadini sui servizi pubblici"
 *                       data_inizio: "2025-12-10T00:00:00.000Z"
 *                       data_fine: "2025-12-20T00:00:00.000Z"
 *                       data_discussione: "2025-12-05T00:00:00.000Z"
 *                       creatoDa: "507f1f77bcf86cd799439012"
 *                       ID_domande: ["507f1f77bcf86cd799439015", "507f1f77bcf86cd799439016", "507f1f77bcf86cd799439017"]
 *                       createdAt: "2025-12-01T10:30:00.000Z"
 *                       updatedAt: "2025-12-01T10:30:00.000Z"
 *                       voted: false
 *                     - _id: "507f1f77bcf86cd799439013"
 *                       tipo: "sondaggio"
 *                       stato: "concluso"
 *                       titolo: "Sondaggio sulla mobilità urbana"
 *                       descrizione: "Raccolta opinioni sulla mobilità e trasporti pubblici"
 *                       data_inizio: "2025-11-01T00:00:00.000Z"
 *                       data_fine: "2025-11-15T00:00:00.000Z"
 *                       data_discussione: "2025-10-25T00:00:00.000Z"
 *                       creatoDa: "507f1f77bcf86cd799439012"
 *                       ID_domande: ["507f1f77bcf86cd799439018", "507f1f77bcf86cd799439019"]
 *                       createdAt: "2025-10-20T14:20:00.000Z"
 *                       updatedAt: "2025-11-15T23:59:00.000Z"
 *                       voted: true
 *               noSondaggi:
 *                 value:
 *                   message: "Nessun sondaggio disponibile al momento"
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
 *               message: "Errore interno del server durante il recupero dei sondaggi."
 *               error: "Database connection error"
 */