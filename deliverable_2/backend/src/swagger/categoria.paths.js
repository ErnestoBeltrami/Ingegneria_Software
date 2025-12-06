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

