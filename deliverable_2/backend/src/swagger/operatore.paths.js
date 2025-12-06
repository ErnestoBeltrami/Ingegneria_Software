/**
 * @swagger
 * /operatore/login:
 *   post:
 *     summary: Login operatore
 *     description: Autentica un operatore con username e password. Restituisce un token JWT valido per 1 giorno.
 *     tags:
 *       - Operatore
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginOperatoreInput'
 *           examples:
 *             admin:
 *               summary: Login admin
 *               value:
 *                 username: "admin"
 *                 password_inserita: "password123"
 *     responses:
 *       200:
 *         description: Login riuscito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login operatore riuscito"
 *                 token:
 *                   type: string
 *                   description: JWT token per autenticazione (valido 1 giorno)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 operatore:
 *                   $ref: '#/components/schemas/Operatore'
 *             examples:
 *               success:
 *                 value:
 *                   message: "Login operatore riuscito"
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   operatore:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     username: "admin"
 *                     nome: "Mario"
 *                     cognome: "Rossi"
 *                     isRoot: true
 *       401:
 *         description: Credenziali non valide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Credenziali non valide"
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 *               error: "Database connection error"
 */

/**
 * @swagger
 * /operatore/register:
 *   post:
 *     summary: Crea un nuovo operatore
 *     description: Permette a un operatore root di creare un nuovo operatore. Solo gli operatori root possono eseguire questa operazione.
 *     tags:
 *       - Operatore
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOperatoreInput'
 *           examples:
 *             newOperatore:
 *               summary: Nuovo operatore
 *               value:
 *                 username: "operatore1"
 *                 password: "password123"
 *                 nome: "Luigi"
 *                 cognome: "Verdi"
 *     responses:
 *       201:
 *         description: Operatore creato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Operatore creato con successo."
 *                 operatore:
 *                   $ref: '#/components/schemas/OperatorePublic'
 *             examples:
 *               success:
 *                 value:
 *                   message: "Operatore creato con successo."
 *                   operatore:
 *                     id: "507f1f77bcf86cd799439011"
 *                     username: "operatore1"
 *                     nome: "Luigi"
 *                     cognome: "Verdi"
 *       400:
 *         description: Dati mancanti
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "username, password, nome e cognome sono obbligatori."
 *       403:
 *         description: Solo root può creare operatori
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Solo l'utente root può creare nuovi operatori."
 *       409:
 *         description: Username già in uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Username già in uso."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante la creazione dell'operatore."
 *               error: "Validation error"
 */

/**
 * @swagger
 * /operatore/profile:
 *   get:
 *     summary: Ottieni i dati del profilo dell'operatore
 *     description: Restituisce i dati pubblici dell'operatore autenticato
 *     tags:
 *       - Operatore
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Dati operatore recuperati con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Operatore trovato con successo"
 *                 data:
 *                   $ref: '#/components/schemas/OperatorePublic'
 *             examples:
 *               success:
 *                 value:
 *                   message: "Operatore trovato con successo"
 *                   data:
 *                     id: "507f1f77bcf86cd799439011"
 *                     username: "admin"
 *                     nome: "Mario"
 *                     cognome: "Rossi"
 *       404:
 *         description: Operatore non trovato o non identificato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               notIdentified:
 *                 value:
 *                   message: "Utente non identificato nel sistema."
 *               notFound:
 *                 value:
 *                   message: "Operatore non trovato nel database"
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server durante il recupero dei dati."
 *               error: "Database error"
 */

/**
 * @swagger
 * /operatore/{operatoreId}/promote:
 *   patch:
 *     summary: Promuovi un operatore a root
 *     description: Permette a un operatore root di promuovere un altro operatore a root. Solo gli operatori root possono eseguire questa operazione.
 *     tags:
 *       - Operatore
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: operatoreId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'operatore da promuovere
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Operatore promosso a root con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Operatore promosso a root con successo."
 *                 operatore:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     username:
 *                       type: string
 *                       example: "operatore1"
 *                     isRoot:
 *                       type: boolean
 *                       example: true
 *             examples:
 *               success:
 *                 value:
 *                   message: "Operatore promosso a root con successo."
 *                   operatore:
 *                     id: "507f1f77bcf86cd799439011"
 *                     username: "operatore1"
 *                     isRoot: true
 *       400:
 *         description: Operatore già root
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Questo operatore è già root."
 *       403:
 *         description: Solo root può promuovere operatori
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Solo l'utente root può promuovere operatori."
 *       404:
 *         description: Operatore non trovato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Operatore non trovato."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Errore interno del server."
 *               error: "Database error"
 */

