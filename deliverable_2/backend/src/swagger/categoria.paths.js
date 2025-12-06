/**
 * @swagger
 * /categorie:
 *   post:
 *     summary: Crea una nuova categoria per iniziativa
 *     description: Permette a un operatore autenticato di creare una nuova categoria per le iniziative
 *     tags:
 *       - Categorie
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome della categoria
 *                 example: "Ambiente"
 *     responses:
 *       201:
 *         description: Categoria creata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria creata con successo"
 *                 categoria:
 *                   $ref: '#/components/schemas/Categoria'
 *             examples:
 *               success:
 *                 value:
 *                   message: "Categoria creata con successo"
 *                   categoria:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     nome: "Ambiente"
 *                     createdAt: "2025-12-05T16:00:00.000Z"
 *                     updatedAt: "2025-12-05T16:00:00.000Z"
 *       400:
 *         description: Dati mancanti o non validi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingNome:
 *                 value:
 *                   message: "Nome categoria obbligatorio"
 *       401:
 *         description: Non autenticato - sessione non valida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Non autenticato"
 *       403:
 *         description: Accesso negato - ruolo non autorizzato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Accesso negato"
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante la creazione della categoria"
 *               error: "Duplicate key error"
 */

/**
 * @swagger
 * /categorie:
 *   get:
 *     summary: Ottieni tutte le categorie
 *     description: Restituisce la lista di tutte le categorie
 *     tags:
 *       - Categorie
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Categorie recuperate con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categorie recuperate con successo."
 *                 categorie:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Categoria'
 *             examples:
 *               success:
 *                 value:
 *                   message: "Categorie recuperate con successo."
 *                   categorie:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       nome: "Ambiente"
 *                       createdAt: "2025-12-05T16:00:00.000Z"
 *                       updatedAt: "2025-12-05T16:00:00.000Z"
 *               empty:
 *                 value:
 *                   message: "Nessuna categoria trovata."
 *                   categorie: []
 *       401:
 *         description: Non autenticato - sessione non valida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Non autenticato"
 *       403:
 *         description: Accesso negato - ruolo non autorizzato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Accesso negato"
 *       500:
 *         description: Errore interno del server durante la ricerca delle categorie.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante la ricerca delle categorie."
 *               error: "Database connection error"
 */

/**
 * @swagger
 * /categorie/{id}:
 *   get:
 *     summary: Ottieni dettagli categoria
 *     description: Restituisce i dettagli di una categoria specifica
 *     tags:
 *       - Categorie
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID della categoria
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Categoria recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria recuperata con successo."
 *                 categoria:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     nome:
 *                       type: string
 *                       example: "Ambiente"
 *                   $ref: '#/components/schemas/Categoria'
 *             examples:
 *               success:
 *                 value:
 *                   message: "Categoria recuperata con successo."
 *                   categoria:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     nome: "Ambiente"
 *                     createdAt: "2025-12-05T16:00:00.000Z"
 *                     updatedAt: "2025-12-05T16:00:00.000Z"
 *       401:
 *         description: Non autenticato - sessione non valida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Non autenticato"
 *       403:
 *         description: Accesso negato - ruolo non autorizzato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Accesso negato"
 *       404:
 *         description: Categoria non trovata con l'ID specificato.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Categoria non trovata con l'ID specificato."
 *       500:
 *         description: Errore interno del server durante la ricerca della categoria con l'ID specificato.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante la ricerca della categoria."
 *               error: "Database connection error"
 */

/**
 * @swagger
 * /categorie/{id}:
 *   patch:
 *     summary: Aggiorna una categoria
 *     description: Aggiorna una categoria specifica
 *     tags:
 *       - Categorie
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID della categoria
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newNome
 *             properties:
 *               newNome:
 *                 type: string
 *                 description: Nuovo nome della categoria
 *                 example: "Ambiente"
 *     responses:
 *       200:
 *         description: Categoria aggiornata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria aggiornata con successo."
 *                 categoria:
 *                   $ref: '#/components/schemas/Categoria'
 *             examples:
 *               success:
 *                 value:
 *                   message: "Categoria aggiornata con successo."
 *                   categoria:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     nome: "Ambiente"
 *                     createdAt: "2025-12-05T16:00:00.000Z"
 *                     updatedAt: "2025-12-05T16:00:00.000Z"
 *       400:
 *         description: ID e nuovo nome categoria obbligatori.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "ID e nuovo nome categoria obbligatori."
 *       401:
 *         description: Non autenticato - sessione non valida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Non autenticato"
 *       403:
 *         description: Accesso negato - ruolo non autorizzato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Accesso negato"
 *       404:
 *         description: Categoria non trovata con l'ID specificato.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Categoria non trovata con l'ID specificato."
 *       500:
 *         description: Errore interno del server durante l'aggiornamento della categoria.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante l'aggiornamento della categoria."
 *               error: "Database connection error"
 */

/**
 * @swagger
 * /categorie/{id}:
 *   delete:
 *     summary: Elimina una categoria
 *     description: Elimina una categoria specifica
 *     tags:
 *       - Categorie
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID della categoria
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Categoria eliminata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria eliminata con successo."
 *       400:
 *         description: ID categoria non valido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "ID categoria non valido."
 *       401:
 *         description: Non autenticato - sessione non valida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Non autenticato"
 *       403:
 *         description: Accesso negato - ruolo non autorizzato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Accesso negato"
 *       404:
 *         description: Categoria non trovata con l'ID specificato.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Categoria non trovata con l'ID specificato."
 *       500:
 *         description: Errore interno del server durante l'eliminazione della categoria con l'ID specificato.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante l'eliminazione della categoria."
 *               error: "Database connection error"
 */