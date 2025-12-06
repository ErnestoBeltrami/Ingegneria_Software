/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Avvia autenticazione Google OAuth
 *     description: Reindirizza l'utente alla pagina di autenticazione Google
 *     tags:
 *       - Autenticazione
 *     responses:
 *       302:
 *         description: Redirect a Google OAuth
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback OAuth Google
 *     description: Gestisce il callback dopo l'autenticazione Google. Restituisce un token JWT se il profilo è completo, altrimenti richiede il completamento del profilo.
 *     tags:
 *       - Autenticazione
 *     responses:
 *       200:
 *         description: Login riuscito - profilo completo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login riuscito!"
 *                 token:
 *                   type: string
 *                   description: JWT token per autenticazione
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 status:
 *                   type: string
 *                   enum: ["COMPLETE"]
 *                   example: "COMPLETE"
 *       202:
 *         description: Profilo incompleto - richiede completamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profilo incompleto. Completamento necessario."
 *                 status:
 *                   type: string
 *                   enum: ["INCOMPLETE_PROFILE"]
 *                   example: "INCOMPLETE_PROFILE"
 *                 cittadinoId:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "mario.rossi@example.com"
 */

/**
 * @swagger
 * /auth/complete-profile:
 *   post:
 *     summary: Completa il profilo del cittadino
 *     description: Permette di completare il profilo di un cittadino dopo il primo login con Google OAuth
 *     tags:
 *       - Autenticazione
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteProfileInput'
 *     responses:
 *       200:
 *         description: Profilo completato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profilo completato, accesso eseguito!"
 *                 token:
 *                   type: string
 *                   description: JWT token per autenticazione
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Dati mancanti o non validi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tutti i campi del profilo sono obbligatori."
 *       404:
 *         description: Cittadino non trovato
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cittadino non trovato."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Errore di validazione o server."
 *                 details:
 *                   type: string
 *                   example: "Validation error details"
 */

/**
 * @swagger
 * /cittadino/profile:
 *   get:
 *     summary: Ottieni i dati del profilo del cittadino
 *     description: Restituisce i dati pubblici del cittadino autenticato
 *     tags:
 *       - Cittadino
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Dati cittadino recuperati con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dati cittadino recuperati con successo"
 *                 data:
 *                   $ref: '#/components/schemas/Cittadino'
 *       404:
 *         description: Utente non trovato o non identificato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               notIdentified:
 *                 value:
 *                   message: "Utente non identificato dal sistema (Internal Error)"
 *               notFound:
 *                 value:
 *                   message: "Risorsa utente non trovata nel database"
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cittadino/vote/votazione:
 *   post:
 *     summary: Rispondi a una votazione
 *     description: Permette a un cittadino autenticato di votare per una votazione
 *     tags:
 *       - Cittadino
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VoteVotazioneInput'
 *     responses:
 *       200:
 *         description: Votazione avvenuta con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Votazione avvenuta con successo."
 *       400:
 *         description: Dati mancanti o non validi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingOption:
 *                 value:
 *                   message: "Scegliere almeno un opzione."
 *       403:
 *         description: L'utente ha già votato questa votazione
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "L'utente ha gia votato questa Votazione."
 *       404:
 *         description: Cittadino non identificato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Cittadino non identificato dal sistema (Internal Error)"
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cittadino/vote/iniziativa:
 *   post:
 *     summary: Vota un'iniziativa
 *     description: Permette a un cittadino autenticato di votare per un'iniziativa
 *     tags:
 *       - Cittadino
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VoteIniziativaInput'
 *     responses:
 *       200:
 *         description: Votazione avvenuta con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Votazione avvenuta con successo."
 *       403:
 *         description: L'utente ha già votato questa iniziativa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Hai gia votato per questa iniziativa"
 *       404:
 *         description: Iniziativa non trovata o cittadino non identificato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               iniziativaNotFound:
 *                 value:
 *                   message: "Iniziativa non trovata"
 *               cittadinoNotIdentified:
 *                 value:
 *                   message: "Cittadino non identificato dal sistema (Internal Error)"
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

