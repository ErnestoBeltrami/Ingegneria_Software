/**
 * @swagger
 * /iniziative:
 *   post:
 *     summary: Crea una nuova iniziativa
 *     description: Permette a un cittadino autenticato di creare una nuova iniziativa
 *     tags:
 *       - Iniziative
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIniziativaInput'
 *           examples:
 *             puliziaParchi:
 *               summary: Iniziativa per pulizia parchi
 *               value:
 *                 ID_categoria: "507f1f77bcf86cd799439012"
 *                 titolo: "Pulizia parchi pubblici"
 *                 ID_cittadino: "507f1f77bcf86cd799439013"
 *                 descrizione: "Proposta per organizzare giornate di pulizia nei parchi pubblici della città"
 *     responses:
 *       201:
 *         description: Iniziativa creata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Iniziativa creata con successo."
 *                 iniziativa:
 *                   $ref: '#/components/schemas/Iniziativa'
 *             examples:
 *               success:
 *                 value:
 *                   message: "Iniziativa creata con successo."
 *                   iniziativa:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     ID_categoria: "507f1f77bcf86cd799439012"
 *                     titolo: "Pulizia parchi pubblici"
 *                     ID_cittadino: "507f1f77bcf86cd799439013"
 *                     descrizione: "Proposta per organizzare giornate di pulizia nei parchi pubblici della città"
 *                     createdAt: "2025-12-05T16:00:00.000Z"
 *                     updatedAt: "2025-12-05T16:00:00.000Z"
 *       400:
 *         description: Dati mancanti o non validi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingData:
 *                 value:
 *                   message: "Dati mancanti per la creazione dell'iniziativa."
 *               invalidCategoryId:
 *                 value:
 *                   message: "ID categoria non valido."
 *       401:
 *         description: Non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Cittadino non autenticato"
 *       404:
 *         description: Categoria non trovata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Categoria iniziativa non trovata."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante la creazione dell'iniziativa."
 *               error: "Duplicate key error"
 *   get:
 *     summary: Ottieni tutte le iniziative
 *     description: Restituisce la lista paginata delle iniziative ordinate per data di creazione e numero di voti. Supporta paginazione tramite ?page= e ?limit=. Include dettagli della categoria e del cittadino creatore. Per i cittadini include il campo `ha_votato` che indica se l'utente ha già sostenuto l'iniziativa.
 *     tags:
 *       - Iniziative
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
 *         description: Lista delle iniziative recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Iniziative trovate:"
 *                 iniziative:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IniziativaWithDetails'
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
 *               withIniziative:
 *                 value:
 *                   message: "Iniziative trovate:"
 *                   iniziative:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       ID_categoria: "507f1f77bcf86cd799439012"
 *                       categoria: "Ambiente"
 *                       titolo: "Pulizia parchi pubblici"
 *                       nome_cittadino: "Mario"
 *                       cognome_cittadino: "Rossi"
 *                       numero_voti: 42
 *                       ha_votato: false
 *                       createdAt: "2025-12-05T16:00:00.000Z"
 *               empty:
 *                 value:
 *                   message: "Nessuna iniziativa disponibile."
 *                   iniziative: []
 *       401:
 *         description: Non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore nell'autenticazione"
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante il recupero delle iniziative."
 *               error: "Database connection error"
 */

/**
 * @swagger
 * /iniziative/ricerca:
 *   post:
 *     summary: Ricerca iniziative
 *     description: Ricerca iniziative tramite filtri e parole chiave. Per i cittadini include il campo `ha_votato` che indica se l'utente ha già sostenuto ciascuna iniziativa.
 *     tags:
 *       - Iniziative
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RicercaIniziativaInput'
 *           examples:
 *             ricercaIniziativa:
 *               summary: Ricerca iniziative
 *               value:
 *                 parola_chiave: "giardino"
 *                 filtri:
 *                   categorie_id: ["507f1f77bcf86cd799439012"]
 *                   ordina_per: "data"
 *                   ordine: -1
 *     responses:
 *       200:
 *         description: Lista delle iniziative recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Iniziative trovate:"
 *                 iniziative:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IniziativaWithDetails'
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
 *               withIniziative:
 *                 value:
 *                   message: "Iniziative trovate:"
 *                   iniziative:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       ID_categoria: "507f1f77bcf86cd799439012"
 *                       categoria: "Ambiente"
 *                       titolo: "Pulizia parchi pubblici"
 *                       nome_cittadino: "Mario"
 *                       cognome_cittadino: "Rossi"
 *                       numero_voti: 42
 *                       ha_votato: true
 *                       createdAt: "2025-12-05T16:00:00.000Z"
 *               empty:
 *                 value:
 *                   message: "Nessuna iniziativa disponibile con i criteri specificati."
 *                   iniziative: []
 *       401:
 *         description: Non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore nell'autenticazione"
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante il recupero delle iniziative."
 *               error: "Database connection error"
 */

/**
 * @swagger
 * /iniziative/{id}:
 *   get:
 *     summary: Ottieni dettagli iniziativa
 *     description: Restituisce i dettagli di una iniziativa specifica. Per i cittadini include il campo `ha_votato` che indica se l'utente ha già sostenuto l'iniziativa.
 *     tags:
 *       - Iniziative
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID della iniziativa
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Iniziativa recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Iniziativa recuperata con successo."
 *                 iniziativa:
 *                   $ref: '#/components/schemas/Iniziativa'
 *             examples:
 *               success:
 *                 value:
 *                   message: "Iniziativa recuperata con successo."
 *                   iniziativa:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     ID_categoria: "507f1f77bcf86cd799439012"
 *                     titolo: "Pulizia parchi pubblici"
 *                     ID_cittadino: "507f1f77bcf86cd799439013"
 *                     descrizione: "Proposta per organizzare giornate di pulizia nei parchi pubblici della città"
 *                     createdAt: "2025-12-05T16:00:00.000Z"
 *                     updatedAt: "2025-12-05T16:00:00.000Z"
 *       400:
 *         description: ID non valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "ID non valido."
 *       401:
 *         description: Non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore nell'autenticazione"
 *       404:
 *         description: Iniziativa non trovata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Iniziativa non trovata."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante il recupero dell'iniziativa con l'ID specificato."
 *               error: "Database connection error"
 */

/**
 * @swagger
 * /iniziative/{id}/modera:
 *   patch:
 *     summary: Modera un'iniziativa
 *     description: Permette a un operatore autenticato di approvare o rifiutare un'iniziativa in stato "in_attesa". Le iniziative approvate diventano visibili ai cittadini; quelle rifiutate rimangono visibili solo agli operatori. È possibile fornire una motivazione opzionale.
 *     tags:
 *       - Iniziative
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID dell'iniziativa da moderare
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stato
 *             properties:
 *               stato:
 *                 type: string
 *                 enum: [approvata, rifiutata]
 *                 description: Nuovo stato dell'iniziativa
 *               motivazione:
 *                 type: string
 *                 description: Motivazione opzionale della decisione
 *                 example: "L'iniziativa rispetta tutte le linee guida comunali."
 *           examples:
 *             approva:
 *               summary: Approva iniziativa
 *               value:
 *                 stato: "approvata"
 *                 motivazione: "L'iniziativa rispetta tutte le linee guida comunali."
 *             rifiuta:
 *               summary: Rifiuta iniziativa
 *               value:
 *                 stato: "rifiutata"
 *                 motivazione: "Il contenuto non è pertinente all'ambito comunale."
 *     responses:
 *       200:
 *         description: Iniziativa moderata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Iniziativa approvata con successo."
 *                 iniziativa:
 *                   $ref: '#/components/schemas/Iniziativa'
 *       400:
 *         description: ID non valido, stato non valido o iniziativa già moderata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidId:
 *                 value:
 *                   message: "ID non valido."
 *               invalidStato:
 *                 value:
 *                   message: "Stato non valido. Valori ammessi: approvata, rifiutata."
 *               alreadyModerated:
 *                 value:
 *                   message: "Solo le iniziative in stato \"in_attesa\" possono essere moderate."
 *       401:
 *         description: Non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore nell'autenticazione"
 *       403:
 *         description: Accesso negato — solo operatori possono moderare
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Accesso negato. Ruolo non sufficiente"
 *       404:
 *         description: Iniziativa non trovata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Iniziativa non trovata."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante la moderazione dell'iniziativa."
 *               error: "Database error"
 */

/**
 * @swagger
 * /iniziative/{id}:
 *   patch:
 *     summary: Aggiorna iniziativa
 *     description: Aggiorna i dettagli di una iniziativa specifica
 *     tags:
 *       - Iniziative
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID della iniziativa
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateIniziativaInput'
 *           examples:
 *             updateIniziativa:
 *               summary: Aggiorna iniziativa
 *               value:
 *                 titolo: "Pulizia parchi pubblici"
 *                 descrizione: "Proposta per organizzare giornate di pulizia nei parchi pubblici della città"
 *                 ID_categoria: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Iniziativa aggiornata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Iniziativa aggiornata con successo."
 *                 iniziativa:
 *                   $ref: '#/components/schemas/Iniziativa'
 *             examples:
 *               success:
 *                 value:
 *                   message: "Iniziativa aggiornata con successo."
 *                   iniziativa:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     ID_categoria: "507f1f77bcf86cd799439012"
 *                     titolo: "Pulizia parchi pubblici"
 *                     ID_cittadino: "507f1f77bcf86cd799439013"
 *                     descrizione: "Proposta per organizzare giornate di pulizia nei parchi pubblici della città"
 *                     createdAt: "2025-12-05T16:00:00.000Z"
 *                     updatedAt: "2025-12-05T16:00:00.000Z"
 *       400:
 *         description: ID non valido o dati mancanti
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidId:
 *                 value:
 *                   message: "ID non valido."
 *               missingFields:
 *                 value:
 *                   message: "Almeno un campo deve essere aggiornato."
 *       401:
 *         description: Non autenticato
 *         content:
 *           application/json: 
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore nell'autenticazione"
 *       403:
 *         description: Accesso negato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Accesso negato: non sei il creatore dell'iniziativa."
 *       404:
 *         description: Iniziativa non trovata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Iniziativa non trovata."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante l'aggiornamento dell'iniziativa con l'ID specificato."
 *               error: "Database connection error"
 */

/**
 * @swagger
 * /iniziative/{id}:
 *   delete:
 *     summary: Elimina iniziativa
 *     description: Elimina una iniziativa specifica
 *     tags:
 *       - Iniziative
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID della iniziativa
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:  
 *         description: Iniziativa eliminata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Iniziativa eliminata con successo."
 *       400:
 *         description: ID non valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "ID non valido."
 *       401:
 *         description: Non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore nell'autenticazione"
 *       403:
 *         description: Accesso negato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Accesso negato: non sei il creatore dell'iniziativa."
 *       404:
 *         description: Iniziativa non trovata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Iniziativa non trovata."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante l'eliminazione dell'iniziativa con l'ID specificato."
 *               error: "Database connection error"
 */