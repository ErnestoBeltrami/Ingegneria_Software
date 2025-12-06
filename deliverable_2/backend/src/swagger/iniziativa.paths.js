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
 *     description: Restituisce l'elenco completo delle iniziative ordinate per data di creazione e numero di voti. Include dettagli della categoria e del cittadino creatore.
 *     tags:
 *       - Iniziative
 *     security:
 *       - sessionAuth: []
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

