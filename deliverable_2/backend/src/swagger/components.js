/**
 * @swagger
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         _id:
 *           type: string
 *           description: ID univoco della categoria
 *           example: "507f1f77bcf86cd799439011"
 *         nome:
 *           type: string
 *           description: Nome della categoria
 *           example: "Ambiente"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data di creazione
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data di ultimo aggiornamento
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Messaggio di errore
 *         error:
 *           type: string
 *           description: Dettagli dell'errore (solo in caso di errore interno)
 *     Cittadino:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID univoco del cittadino
 *           example: "507f1f77bcf86cd799439011"
 *         ruolo:
 *           type: string
 *           enum: ["cittadino"]
 *           example: "cittadino"
 *         nome:
 *           type: string
 *           description: Nome del cittadino
 *           example: "Mario"
 *         cognome:
 *           type: string
 *           description: Cognome del cittadino
 *           example: "Rossi"
 *         email:
 *           type: string
 *           format: email
 *           description: Email del cittadino
 *           example: "mario.rossi@example.com"
 *         eta:
 *           type: number
 *           minimum: 18
 *           description: Età del cittadino
 *           example: 30
 *         genere:
 *           type: string
 *           enum: ["Uomo", "Donna"]
 *           example: "Uomo"
 *         categoria:
 *           type: string
 *           enum: ["Lavoratore", "Disoccupato", "Pensionato", "Studente", "Altro"]
 *           example: "Lavoratore"
 *         profiloCompleto:
 *           type: boolean
 *           description: Indica se il profilo è completo
 *           example: true
 *     CompleteProfileInput:
 *       type: object
 *       required:
 *         - cittadinoId
 *         - nome
 *         - cognome
 *         - eta
 *         - genere
 *         - categoria
 *       properties:
 *         cittadinoId:
 *           type: string
 *           description: ID del cittadino
 *           example: "507f1f77bcf86cd799439011"
 *         nome:
 *           type: string
 *           example: "Mario"
 *         cognome:
 *           type: string
 *           example: "Rossi"
 *         eta:
 *           type: number
 *           minimum: 18
 *           example: 30
 *         genere:
 *           type: string
 *           enum: ["Uomo", "Donna"]
 *           example: "Uomo"
 *         categoria:
 *           type: string
 *           enum: ["Lavoratore", "Disoccupato", "Pensionato", "Studente", "Altro"]
 *           example: "Lavoratore"
 *     VoteVotazioneInput:
 *       type: object
 *       required:
 *         - opzioneId
 *         - votazioneId
 *       properties:
 *         opzioneId:
 *           type: string
 *           description: ID dell'opzione scelta
 *           example: "507f1f77bcf86cd799439011"
 *         votazioneId:
 *           type: string
 *           description: ID della votazione
 *           example: "507f1f77bcf86cd799439012"
 *     VoteIniziativaInput:
 *       type: object
 *       required:
 *         - iniziativaID
 *       properties:
 *         iniziativaID:
 *           type: string
 *           description: ID dell'iniziativa
 *           example: "507f1f77bcf86cd799439011"
 *     Iniziativa:
 *       type: object
 *       required:
 *         - ID_categoria
 *         - titolo
 *         - ID_cittadino
 *         - descrizione
 *       properties:
 *         _id:
 *           type: string
 *           description: ID univoco dell'iniziativa
 *           example: "507f1f77bcf86cd799439011"
 *         ID_categoria:
 *           type: string
 *           description: ID della categoria
 *           example: "507f1f77bcf86cd799439012"
 *         titolo:
 *           type: string
 *           description: Titolo dell'iniziativa
 *           example: "Pulizia parchi pubblici"
 *         ID_cittadino:
 *           type: string
 *           description: ID del cittadino creatore
 *           example: "507f1f77bcf86cd799439013"
 *         descrizione:
 *           type: string
 *           description: Descrizione dettagliata dell'iniziativa
 *           example: "Proposta per organizzare giornate di pulizia nei parchi pubblici della città"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data di creazione
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data di ultimo aggiornamento
 *     IniziativaWithDetails:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID univoco dell'iniziativa
 *           example: "507f1f77bcf86cd799439011"
 *         ID_categoria:
 *           type: string
 *           description: ID della categoria
 *           example: "507f1f77bcf86cd799439012"
 *         categoria:
 *           type: string
 *           description: Nome della categoria
 *           example: "Ambiente"
 *         titolo:
 *           type: string
 *           description: Titolo dell'iniziativa
 *           example: "Pulizia parchi pubblici"
 *         nome_cittadino:
 *           type: string
 *           description: Nome del cittadino creatore
 *           example: "Mario"
 *         cognome_cittadino:
 *           type: string
 *           description: Cognome del cittadino creatore
 *           example: "Rossi"
 *         numero_voti:
 *           type: number
 *           description: Numero di voti ricevuti
 *           example: 42
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data di creazione
 *     CreateIniziativaInput:
 *       type: object
 *       required:
 *         - ID_categoria
 *         - titolo
 *         - ID_cittadino
 *         - descrizione
 *       properties:
 *         ID_categoria:
 *           type: string
 *           description: ID della categoria
 *           example: "507f1f77bcf86cd799439012"
 *         titolo:
 *           type: string
 *           description: Titolo dell'iniziativa
 *           example: "Pulizia parchi pubblici"
 *         ID_cittadino:
 *           type: string
 *           description: ID del cittadino creatore
 *           example: "507f1f77bcf86cd799439013"
 *         descrizione:
 *           type: string
 *           description: Descrizione dettagliata dell'iniziativa
 *           example: "Proposta per organizzare giornate di pulizia nei parchi pubblici della città"
 *     Operatore:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - nome
 *         - cognome
 *       properties:
 *         _id:
 *           type: string
 *           description: ID univoco dell'operatore
 *           example: "507f1f77bcf86cd799439011"
 *         username:
 *           type: string
 *           description: Username dell'operatore
 *           example: "admin"
 *         nome:
 *           type: string
 *           description: Nome dell'operatore
 *           example: "Mario"
 *         cognome:
 *           type: string
 *           description: Cognome dell'operatore
 *           example: "Rossi"
 *         isRoot:
 *           type: boolean
 *           description: Indica se l'operatore ha privilegi root
 *           example: false
 *     OperatorePublic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID univoco dell'operatore
 *           example: "507f1f77bcf86cd799439011"
 *         username:
 *           type: string
 *           description: Username dell'operatore
 *           example: "admin"
 *         nome:
 *           type: string
 *           description: Nome dell'operatore
 *           example: "Mario"
 *         cognome:
 *           type: string
 *           description: Cognome dell'operatore
 *           example: "Rossi"
 *     LoginOperatoreInput:
 *       type: object
 *       required:
 *         - username
 *         - password_inserita
 *       properties:
 *         username:
 *           type: string
 *           description: Username dell'operatore
 *           example: "admin"
 *         password_inserita:
 *           type: string
 *           format: password
 *           description: Password dell'operatore
 *           example: "password123"
 *     CreateOperatoreInput:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - nome
 *         - cognome
 *       properties:
 *         username:
 *           type: string
 *           description: Username dell'operatore
 *           example: "operatore1"
 *         password:
 *           type: string
 *           format: password
 *           description: Password dell'operatore
 *           example: "password123"
 *         nome:
 *           type: string
 *           description: Nome dell'operatore
 *           example: "Mario"
 *         cognome:
 *           type: string
 *           description: Cognome dell'operatore
 *           example: "Rossi"
 *     Opzione:
 *       type: object
 *       required:
 *         - testo
 *       properties:
 *         _id:
 *           type: string
 *           description: ID univoco dell'opzione
 *           example: "507f1f77bcf86cd799439011"
 *         testo:
 *           type: string
 *           description: Testo dell'opzione
 *           example: "Sì"
 *     Domanda:
 *       type: object
 *       required:
 *         - titolo
 *         - tipo
 *         - opzioni
 *       properties:
 *         _id:
 *           type: string
 *           description: ID univoco della domanda
 *           example: "507f1f77bcf86cd799439011"
 *         titolo:
 *           type: string
 *           description: Testo della domanda
 *           example: "Sei favorevole alla proposta?"
 *         tipo:
 *           type: string
 *           enum: ["risposta_multipla", "risposta_singola"]
 *           description: Tipo di risposta consentita
 *           example: "risposta_singola"
 *         opzioni:
 *           type: array
 *           minItems: 2
 *           items:
 *             $ref: '#/components/schemas/Opzione'
 *           description: Array di opzioni di risposta
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Votazione:
 *       type: object
 *       required:
 *         - titolo
 *         - descrizione
 *         - data_inizio
 *         - data_fine
 *         - data_discussione
 *         - ID_domanda
 *         - creatoDa
 *       properties:
 *         _id:
 *           type: string
 *           description: ID univoco della votazione
 *           example: "507f1f77bcf86cd799439011"
 *         titolo:
 *           type: string
 *           description: Titolo della votazione
 *           example: "Referendum sulla proposta X"
 *         descrizione:
 *           type: string
 *           description: Descrizione dettagliata della votazione
 *           example: "Votazione per decidere se approvare la proposta X"
 *         stato:
 *           type: string
 *           enum: ["attivo", "bozza", "concluso", "archiviato"]
 *           default: "bozza"
 *           description: Stato della votazione
 *           example: "bozza"
 *         ID_domanda:
 *           type: string
 *           description: ID della domanda associata
 *           example: "507f1f77bcf86cd799439012"
 *         creatoDa:
 *           type: string
 *           description: ID dell'operatore creatore
 *           example: "507f1f77bcf86cd799439013"
 *         data_inizio:
 *           type: string
 *           format: date-time
 *           description: Data di inizio della votazione
 *           example: "2025-12-10T00:00:00.000Z"
 *         data_fine:
 *           type: string
 *           format: date-time
 *           description: Data di fine della votazione
 *           example: "2025-12-20T00:00:00.000Z"
 *         data_discussione:
 *           type: string
 *           format: date-time
 *           description: Data di discussione (deve essere prima di data_inizio)
 *           example: "2025-12-05T00:00:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     VotazioneWithDomanda:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/Votazione'
 *         - type: object
 *           properties:
 *             ID_domanda:
 *               $ref: '#/components/schemas/Domanda'
 *     CreateVotazioneInput:
 *       type: object
 *       required:
 *         - titoloVotazione
 *         - descrizione
 *         - data_inizio
 *         - data_fine
 *         - data_discussione
 *         - domanda
 *       properties:
 *         titoloVotazione:
 *           type: string
 *           description: Titolo della votazione
 *           example: "Referendum sulla proposta X"
 *         descrizione:
 *           type: string
 *           description: Descrizione dettagliata della votazione
 *           example: "Votazione per decidere se approvare la proposta X"
 *         data_inizio:
 *           type: string
 *           format: date-time
 *           description: Data di inizio della votazione
 *           example: "2025-12-10T00:00:00.000Z"
 *         data_fine:
 *           type: string
 *           format: date-time
 *           description: Data di fine della votazione
 *           example: "2025-12-20T00:00:00.000Z"
 *         data_discussione:
 *           type: string
 *           format: date-time
 *           description: Data di discussione (deve essere prima di data_inizio)
 *           example: "2025-12-05T00:00:00.000Z"
 *         domanda:
 *           type: object
 *           required:
 *             - titolo
 *             - tipo
 *             - opzioni
 *           properties:
 *             titolo:
 *               type: string
 *               example: "Sei favorevole alla proposta?"
 *             tipo:
 *               type: string
 *               enum: ["risposta_multipla", "risposta_singola"]
 *               example: "risposta_singola"
 *             opzioni:
 *               type: array
 *               minItems: 2
 *               items:
 *                 type: object
 *                 required:
 *                   - testo
 *                 properties:
 *                   testo:
 *                     type: string
 *                     example: "Sì"
 *     UpdateVotazioneInput:
 *       type: object
 *       properties:
 *         titolo:
 *           type: string
 *           example: "Referendum sulla proposta X (aggiornato)"
 *         descrizione:
 *           type: string
 *           example: "Descrizione aggiornata"
 *         data_inizio:
 *           type: string
 *           format: date-time
 *           example: "2025-12-10T00:00:00.000Z"
 *         data_fine:
 *           type: string
 *           format: date-time
 *           example: "2025-12-20T00:00:00.000Z"
 *         data_discussione:
 *           type: string
 *           format: date-time
 *           example: "2025-12-05T00:00:00.000Z"
 *     RiepilogoRisultato:
 *       type: object
 *       properties:
 *         opzioneId:
 *           type: string
 *           description: ID dell'opzione
 *           example: "507f1f77bcf86cd799439011"
 *         testoOpzione:
 *           type: string
 *           description: Testo dell'opzione
 *           example: "Sì"
 *         voti:
 *           type: number
 *           description: Numero di voti ricevuti
 *           example: 42
 *         percentuale:
 *           type: number
 *           format: float
 *           description: Percentuale di voti (con 2 decimali)
 *           example: 65.5
 *   securitySchemes:
 *     sessionAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 *       description: Session cookie per autenticazione
 */

