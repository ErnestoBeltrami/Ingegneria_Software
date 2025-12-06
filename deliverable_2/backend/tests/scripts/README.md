# Script di Test API

Questo script esegue le chiamate API dai file `.rest` e mostra le risposte HTTP in modo leggibile, simile a Rest Client.

## Funzionalità

- ✅ Esecuzione automatica di richieste HTTP da file `.rest`
- ✅ **Autenticazione JWT automatica** con login e cache dei token
- ✅ Supporto per variabili dinamiche `{{TOKEN_OPERATORE}}` e `{{TOKEN_CITTADINO}}`
- ✅ Retrocompatibilità con token hardcoded

## Utilizzo

### Eseguire tutti i test da un file .rest
```bash
npm run test:api backend/tests/rest/votazione.rest
```

### Eseguire test predefiniti
```bash
# Test votazioni
npm run test:api:votazione

# Test operatore
npm run test:api:operatore

# Test cittadino
npm run test:api:cittadino
```

### Eseguire direttamente
```bash
node backend/tests/scripts/test-api.js backend/tests/rest/votazione.rest
```

## Autenticazione JWT Automatica

Lo script supporta l'autenticazione automatica per evitare di dover aggiornare manualmente i token JWT nei file `.rest`.

### Configurazione

Crea un file `.test-config.json` nella directory `backend/tests/scripts/` (puoi copiare da `.test-config.json.example`):

```json
{
  "operatore": {
    "username": "root",
    "password": "rootPassword123"
  },
  "cittadino": {
    "cittadinoId": "692f4df30c4b5d2083a1c3f1",
    "nome": "Mario",
    "cognome": "Rossi",
    "eta": 30,
    "genere": "Uomo",
    "categoria": "Lavoratore"
  },
  "baseUrl": "http://localhost:3000"
}
```

**Alternativa:** Puoi usare variabili d'ambiente:
- `TEST_OPERATORE_USERNAME` / `TEST_OPERATORE_PASSWORD`
- `TEST_CITTADINO_ID` / `TEST_CITTADINO_NOME` / `TEST_CITTADINO_COGNOME` / `TEST_CITTADINO_ETA` / `TEST_CITTADINO_GENERE` / `TEST_CITTADINO_CATEGORIA`
- `TEST_BASE_URL`

**Nota importante per cittadini:** L'ID cittadino (`cittadinoId`) deve esistere nel database. I cittadini vengono creati automaticamente tramite Google OAuth quando fanno il primo login. Per ottenere un ID valido:
1. Esegui il login Google OAuth tramite `/auth/google` (richiede browser)
2. Oppure usa un ID esistente dal database
3. L'ID viene restituito nella risposta di `/auth/google/callback` o `/auth/complete-profile`

### Uso nei file .rest

#### Variabili di autenticazione

Invece di hardcodare i token, usa le variabili:

```http
### Creazione votazione (operatore autenticato)
POST http://localhost:3000/votazioni
Authorization: Bearer {{TOKEN_OPERATORE}}
Content-Type: application/json

{
  "titoloVotazione": "Test",
  ...
}
```

```http
### Vota iniziativa (cittadino autenticato)
POST http://localhost:3000/auth/cittadino/vote/iniziativa
Authorization: Bearer {{TOKEN_CITTADINO}}
Content-Type: application/json

{
  "iniziativaID": "..."
}
```

#### Variabili dinamiche estratte dalle risposte

Lo script estrae automaticamente gli ID dalle risposte delle chiamate API e li rende disponibili come variabili per le richieste successive:

- `{{VOTAZIONE_ID}}` - Estratto da `votazione._id` o `votazione.id`
- `{{INIZIATIVA_ID}}` - Estratto da `iniziativa._id` o `iniziativa.id`
- `{{SONDAGGIO_ID}}` - Estratto da `sondaggio._id` o `sondaggio.id`
- `{{CATEGORIA_ID}}` - Estratto da `categoria._id` o `categoria.id`
- `{{OPERATORE_ID}}` - Estratto da `operatore._id` o `operatore.id`
- `{{CITTADINO_ID}}` - Estratto da `cittadino._id`, `cittadino.id` o `cittadinoId`

**Esempio:**

```http
### Creazione votazione (operatore autenticato)
POST http://localhost:3000/votazioni
Authorization: Bearer {{TOKEN_OPERATORE}}
Content-Type: application/json

{
  "titoloVotazione": "Test",
  ...
}

### Dettaglio votazione (usa l'ID estratto dalla risposta precedente)
GET http://localhost:3000/votazioni/{{VOTAZIONE_ID}}
Authorization: Bearer {{TOKEN_OPERATORE}}

### Modifica votazione
PATCH http://localhost:3000/votazioni/{{VOTAZIONE_ID}}
Authorization: Bearer {{TOKEN_OPERATORE}}
Content-Type: application/json

{
  "titolo": "Votazione modificata"
}
```

Le variabili vengono estratte automaticamente dalle risposte di successo (status 2xx) e sono disponibili per tutte le richieste successive nello stesso file `.rest`.

### Come funziona

1. Lo script rileva le variabili `{{TOKEN_OPERATORE}}` o `{{TOKEN_CITTADINO}}` nei file `.rest`
2. Controlla se esiste un token valido in cache (file `.test-tokens.json`)
3. Se il token è scaduto o mancante, esegue automaticamente il login:
   - **Operatore**: chiama `/operatore/login` con username/password
   - **Cittadino**: chiama `/auth/complete-profile` per completare il profilo e ottenere il token
4. Salva il token in cache per riutilizzarlo nelle esecuzioni successive
5. Sostituisce le variabili con i token validi prima di eseguire le richieste

**Nota:** I token vengono cachati e riutilizzati finché validi (con margine di 5 minuti). I token hardcoded continuano a funzionare normalmente.

## Output

Lo script mostra:
- Nome della richiesta
- Metodo HTTP e path
- Status code (colorato: verde per successo, rosso per errori)
- Headers importanti
- Response body formattato (JSON se possibile)
- Messaggi di login automatico quando necessario

## Esempio

```
Testing API from: /path/to/votazione.rest

Found 3 request(s)

Logging in as operatore: root...
✓ operatore token obtained and cached

================================================================================
[1/3] Creazione votazione (operatore autenticato)
POST /votazioni
================================================================================

Status: 201
Content-Type: application/json

Response Body:
{
  "message": "Votazione creata con successo.",
  "votazione": {
    "_id": "...",
    "titolo": "Test Votazione",
    ...
  }
}
```

## Note

- Lo script supporta tutti i metodi HTTP (GET, POST, PUT, PATCH, DELETE)
- Supporta headers personalizzati (incluso Authorization)
- Supporta body JSON
- Pausa di 500ms tra le richieste per evitare rate limiting
- Default URL: `http://localhost:3000` (modificabile nel file .rest o in `.test-config.json`)
- Il file `.test-tokens.json` viene creato automaticamente e contiene i token cachati (non committarlo nel repository)

