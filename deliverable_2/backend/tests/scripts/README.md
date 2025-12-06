# Script di Test API

Questo script esegue le chiamate API dai file `.rest` e mostra le risposte HTTP in modo leggibile, simile a Rest Client.

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

## Output

Lo script mostra:
- Nome della richiesta
- Metodo HTTP e path
- Status code (colorato: verde per successo, rosso per errori)
- Headers importanti
- Response body formattato (JSON se possibile)

## Esempio

```
================================================================================
[1/3] Creazione votazione (operatore autenticato)
GET /votazioni
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
- Default URL: `http://localhost:3000` (modificabile nel file .rest)

