/**
 * @swagger
 * /notifiche:
 *   get:
 *     summary: Recupera le notifiche del cittadino autenticato
 *     description: Restituisce tutte le notifiche del cittadino in sessione, ordinate dalla più recente
 *     tags:
 *       - Notifiche
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Lista notifiche recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifiche:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notifica'
 *             examples:
 *               success:
 *                 value:
 *                   notifiche:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       ID_destinatario: "507f1f77bcf86cd799439013"
 *                       tipo: "iniziativa_approvata"
 *                       messaggio: 'La tua iniziativa "Pulizia parchi" è stata approvata e pubblicata.'
 *                       ID_iniziativa: "507f1f77bcf86cd799439012"
 *                       letta: false
 *                       createdAt: "2025-12-05T16:00:00.000Z"
 *                       updatedAt: "2025-12-05T16:00:00.000Z"
 *       401:
 *         description: Non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /notifiche/leggi-tutte:
 *   patch:
 *     summary: Segna tutte le notifiche come lette
 *     description: Imposta letta=true su tutte le notifiche non lette del cittadino autenticato
 *     tags:
 *       - Notifiche
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Tutte le notifiche segnate come lette
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tutte le notifiche segnate come lette."
 *       401:
 *         description: Non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /notifiche/{id}/letta:
 *   patch:
 *     summary: Segna una notifica come letta
 *     description: Imposta letta=true sulla notifica specificata. Solo il destinatario può segnare la propria notifica.
 *     tags:
 *       - Notifiche
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della notifica da segnare come letta
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Notifica segnata come letta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notifica segnata come letta."
 *                 notifica:
 *                   $ref: '#/components/schemas/Notifica'
 *       401:
 *         description: Non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accesso negato (notifica non appartiene al cittadino)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               forbidden:
 *                 value:
 *                   message: "Accesso negato."
 *       404:
 *         description: Notifica non trovata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               notFound:
 *                 value:
 *                   message: "Notifica non trovata."
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
