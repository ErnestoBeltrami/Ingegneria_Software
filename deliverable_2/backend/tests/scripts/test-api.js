import http from 'http';
import https from 'https';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, isAbsolute } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colori per output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

// Parse file .rest
function parseRestFile(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    const requests = [];
    const lines = content.split('\n');
    
    let currentRequest = null;
    let inBody = false;
    let bodyLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Nuova richiesta (con ### o direttamente con metodo HTTP)
        if (line.startsWith('###')) {
            if (currentRequest) {
                if (bodyLines.length > 0) {
                    currentRequest.body = bodyLines.join('\n');
                }
                requests.push(currentRequest);
            }
            currentRequest = {
                name: line.replace(/^###\s*/, '') || 'Unnamed Request',
                method: 'GET',
                path: '',
                headers: {},
                body: null
            };
            inBody = false;
            bodyLines = [];
            continue;
        }
        
        // Se non c'è una richiesta corrente e troviamo un metodo HTTP, crea una nuova richiesta
        if (!currentRequest && line.match(/^(GET|POST|PUT|PATCH|DELETE|OPTIONS)\s+/)) {
            currentRequest = {
                name: 'Unnamed Request',
                method: 'GET',
                path: '',
                headers: {},
                body: null
            };
            inBody = false;
            bodyLines = [];
        }
        
        if (!currentRequest) continue;
        
        // Method e URL
        if (line.match(/^(GET|POST|PUT|PATCH|DELETE|OPTIONS)\s+/)) {
            const match = line.match(/^(GET|POST|PUT|PATCH|DELETE|OPTIONS)\s+(.+)$/);
            if (match) {
                currentRequest.method = match[1];
                const url = match[2].trim();
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    const urlObj = new URL(url);
                    currentRequest.host = urlObj.hostname;
                    currentRequest.port = urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80);
                    currentRequest.path = urlObj.pathname + urlObj.search;
                    currentRequest.protocol = urlObj.protocol.slice(0, -1);
                } else {
                    currentRequest.path = url;
                }
            }
            continue;
        }
        
        // Body (dopo una riga vuota e se la prossima riga inizia con { o [)
        if (!inBody && line === '' && i < lines.length - 1) {
            const nextLine = lines[i + 1].trim();
            if (nextLine.startsWith('{') || nextLine.startsWith('[')) {
                inBody = true;
                continue;
            }
        }
        
        // Se siamo nel body, aggiungi alla body
        if (inBody) {
            if (line || bodyLines.length > 0) {
                bodyLines.push(line);
            }
            continue;
        }
        
        // Headers (solo se non siamo nel body e la riga contiene : e non inizia con { o [)
        if (line.includes(':') && !line.startsWith('{') && !line.startsWith('[')) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();
            // Verifica che la chiave sia un header valido (non JSON)
            if (key.trim() && !key.trim().startsWith('"') && !key.trim().startsWith("'")) {
                if (key.toLowerCase() === 'content-type') {
                    currentRequest.contentType = value;
                }
                currentRequest.headers[key.trim()] = value;
            }
            continue;
        }
    }
    
    // Aggiungi l'ultima richiesta
    if (currentRequest) {
        if (bodyLines.length > 0) {
            currentRequest.body = bodyLines.join('\n');
        }
        requests.push(currentRequest);
    }
    
    return requests;
}

// Esegui una richiesta HTTP
function makeRequest(request, baseUrl = 'http://localhost:3000') {
    return new Promise((resolve, reject) => {
        // Se il path è già un path relativo (inizia con /), costruisci l'URL manualmente
        // per evitare problemi con l'encoding automatico di new URL()
        let pathname = request.path;
        let search = '';
        
        // Se il path contiene un query string, separalo
        if (pathname.includes('?')) {
            const parts = pathname.split('?');
            pathname = parts[0];
            search = '?' + parts.slice(1).join('?');
        }
        
        // Se il path inizia con http:// o https://, usa new URL()
        let hostname, port, protocol;
        if (request.path.startsWith('http://') || request.path.startsWith('https://')) {
            const url = new URL(request.path);
            hostname = url.hostname;
            port = url.port || (url.protocol === 'https:' ? 443 : 80);
            protocol = url.protocol.slice(0, -1);
            pathname = url.pathname;
            search = url.search;
        } else {
            // Altrimenti, usa il baseUrl e il path relativo
            const baseUrlObj = new URL(baseUrl);
            hostname = baseUrlObj.hostname;
            port = baseUrlObj.port || (baseUrlObj.protocol === 'https:' ? 443 : 80);
            protocol = baseUrlObj.protocol.slice(0, -1);
            // Il pathname è già corretto (relativo o assoluto)
        }
        
        const options = {
            hostname: hostname || 'localhost',
            port: port || 3000,
            path: pathname + search,
            method: request.method,
            headers: {
                'Content-Type': request.contentType || 'application/json',
                ...request.headers
            }
        };
        
        // Rimuovi Content-Type se non c'è body
        if (!request.body) {
            delete options.headers['Content-Type'];
        }
        
        const client = protocol === 'https' ? https : http;
        
        const req = client.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (request.body) {
            req.write(request.body);
        }
        
        req.end();
    });
}

// Formatta e mostra la risposta
function displayResponse(request, response, index, total) {
    console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}[${index}/${total}] ${request.name}${colors.reset}`);
    console.log(`${colors.gray}${request.method} ${request.path}${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
    
    // Status Code
    const statusColor = response.statusCode >= 200 && response.statusCode < 300 ? colors.green : 
                       response.statusCode >= 400 ? colors.red : colors.yellow;
    console.log(`${colors.bright}Status:${colors.reset} ${statusColor}${response.statusCode}${colors.reset}`);
    
    // Headers importanti
    if (response.headers['content-type']) {
        console.log(`${colors.bright}Content-Type:${colors.reset} ${response.headers['content-type']}`);
    }
    if (response.headers['content-length']) {
        console.log(`${colors.bright}Content-Length:${colors.reset} ${response.headers['content-length']}`);
    }
    
    // Body
    console.log(`\n${colors.bright}Response Body:${colors.reset}`);
    try {
        const json = JSON.parse(response.body);
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.log(response.body || '(empty)');
    }
    
    console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

// Risolvi il percorso del file
function resolveRestFile(filePath) {
    if (!filePath) {
        return join(__dirname, '../rest/votazione.rest');
    }
    
    // Se è un percorso assoluto, usalo direttamente
    if (isAbsolute(filePath)) {
        return filePath;
    }
    
    // Prova diversi percorsi relativi
    const possiblePaths = [
        filePath, // Percorso relativo dalla directory corrente
        join(process.cwd(), filePath), // Dalla root del progetto
        join(__dirname, '../rest', filePath), // Dalla directory rest
        join(__dirname, '..', filePath), // Dalla directory tests
    ];
    
    for (const path of possiblePaths) {
        const resolved = resolve(path);
        if (existsSync(resolved)) {
            return resolved;
        }
    }
    
    // Se nessun percorso funziona, restituisci quello originale per mostrare l'errore
    return resolve(join(process.cwd(), filePath));
}

// Percorsi per file di configurazione e cache
const TOKENS_CACHE_FILE = join(__dirname, '.test-tokens.json');
const CONFIG_FILE = join(__dirname, '.test-config.json');

// Carica configurazione da file o variabili d'ambiente
function loadConfig() {
    const config = {
        operatore: {
            username: process.env.TEST_OPERATORE_USERNAME,
            password: process.env.TEST_OPERATORE_PASSWORD
        },
        cittadino: {
            cittadinoId: process.env.TEST_CITTADINO_ID,
            nome: process.env.TEST_CITTADINO_NOME,
            cognome: process.env.TEST_CITTADINO_COGNOME,
            eta: process.env.TEST_CITTADINO_ETA,
            genere: process.env.TEST_CITTADINO_GENERE,
            categoria: process.env.TEST_CITTADINO_CATEGORIA
        },
        baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000'
    };

    // Carica da file se esiste
    if (existsSync(CONFIG_FILE)) {
        try {
            const fileConfig = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
            if (fileConfig.operatore) {
                config.operatore = { ...config.operatore, ...fileConfig.operatore };
            }
            if (fileConfig.cittadino) {
                config.cittadino = { ...config.cittadino, ...fileConfig.cittadino };
            }
            if (fileConfig.baseUrl) {
                config.baseUrl = fileConfig.baseUrl;
            }
        } catch (error) {
            console.warn(`${colors.yellow}Warning: Could not parse config file: ${error.message}${colors.reset}`);
        }
    }

    return config;
}

// Carica cache dei token
function loadTokenCache() {
    if (!existsSync(TOKENS_CACHE_FILE)) {
        return { operatore: null, cittadino: null };
    }
    
    try {
        return JSON.parse(readFileSync(TOKENS_CACHE_FILE, 'utf-8'));
    } catch (error) {
        console.warn(`${colors.yellow}Warning: Could not parse token cache: ${error.message}${colors.reset}`);
        return { operatore: null, cittadino: null };
    }
}

// Salva cache dei token
function saveTokenCache(cache) {
    try {
        writeFileSync(TOKENS_CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
    } catch (error) {
        console.warn(`${colors.yellow}Warning: Could not save token cache: ${error.message}${colors.reset}`);
    }
}

// Verifica se un token è valido (con margine di 5 minuti)
function isTokenValid(tokenData) {
    if (!tokenData || !tokenData.token || !tokenData.expiresAt) {
        return false;
    }
    
    // Considera il token valido se scade tra più di 5 minuti
    const margin = 5 * 60 * 1000; // 5 minuti in millisecondi
    return Date.now() < (tokenData.expiresAt - margin);
}

// Login operatore
async function loginOperatore(config, baseUrl) {
    if (!config.operatore.username || !config.operatore.password) {
        throw new Error('Operatore credentials not configured. Set TEST_OPERATORE_USERNAME and TEST_OPERATORE_PASSWORD or create .test-config.json');
    }

    console.log(`${colors.cyan}Logging in as operatore: ${config.operatore.username}...${colors.reset}`);
    
    const request = {
        method: 'POST',
        path: '/operatore/login',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: config.operatore.username,
            password_inserita: config.operatore.password
        })
    };

    const response = await makeRequest(request, baseUrl);
    
    if (response.statusCode !== 200) {
        const errorBody = JSON.parse(response.body || '{}');
        throw new Error(`Operatore login failed: ${errorBody.message || 'Unknown error'}`);
    }

    const data = JSON.parse(response.body);
    const token = data.token;
    
    if (!token) {
        throw new Error('No token received from operatore login');
    }

    // Calcola scadenza (1 giorno = 24 ore)
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
    
    return { token, expiresAt };
}

// Login cittadino (completa profilo e ottiene token)
async function loginCittadino(config, baseUrl) {
    const cittadino = config.cittadino;
    
    if (!cittadino.cittadinoId || !cittadino.nome || !cittadino.cognome || 
        !cittadino.eta || !cittadino.genere || !cittadino.categoria) {
        throw new Error('Cittadino credentials not fully configured. Set all TEST_CITTADINO_* env vars or create .test-config.json');
    }

    console.log(`${colors.cyan}Completing profile and logging in as cittadino: ${cittadino.nome} ${cittadino.cognome}...${colors.reset}`);
    
    const request = {
        method: 'POST',
        path: '/auth/complete-profile',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cittadinoId: cittadino.cittadinoId,
            nome: cittadino.nome,
            cognome: cittadino.cognome,
            eta: parseInt(cittadino.eta),
            genere: cittadino.genere,
            categoria: cittadino.categoria
        })
    };

    const response = await makeRequest(request, baseUrl);
    
    if (response.statusCode !== 200) {
        const errorBody = JSON.parse(response.body || '{}');
        const errorMsg = errorBody.error || errorBody.message || 'Unknown error';
        
        // Messaggio più dettagliato se il cittadino non viene trovato
        if (errorMsg.includes('Cittadino non trovato') || response.statusCode === 404) {
            throw new Error(`Cittadino login failed: ${errorMsg}\nTip: L'ID cittadino "${cittadino.cittadinoId}" non esiste nel database. Crea un cittadino tramite Google OAuth o usa un ID valido.`);
        }
        
        throw new Error(`Cittadino login failed: ${errorMsg}`);
    }

    const data = JSON.parse(response.body);
    const token = data.token;
    
    if (!token) {
        throw new Error('No token received from cittadino login');
    }

    // Calcola scadenza (7 giorni)
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
    
    return { token, expiresAt };
}

// Ottieni token valido (da cache o login)
async function getValidToken(role, config, baseUrl) {
    const cache = loadTokenCache();
    const cacheKey = role === 'operatore' ? 'operatore' : 'cittadino';
    
    // Controlla se abbiamo un token valido in cache
    if (isTokenValid(cache[cacheKey])) {
        console.log(`${colors.green}Using cached ${role} token${colors.reset}`);
        return cache[cacheKey].token;
    }
    
    // Token non valido o mancante, esegui login
    let tokenData;
    if (role === 'operatore') {
        tokenData = await loginOperatore(config, baseUrl);
    } else {
        tokenData = await loginCittadino(config, baseUrl);
    }
    
    // Salva in cache
    cache[cacheKey] = tokenData;
    saveTokenCache(cache);
    
    console.log(`${colors.green}✓ ${role} token obtained and cached${colors.reset}`);
    return tokenData.token;
}

// Estrai ID da una risposta JSON
function extractIdsFromResponse(responseBody, responseVariables) {
    try {
        const data = JSON.parse(responseBody);
        
        // Estrai VOTAZIONE_ID da votazione._id o votazione.id (singolare)
        if (data.votazione) {
            const votazioneId = data.votazione._id || data.votazione.id;
            if (votazioneId) {
                responseVariables.VOTAZIONE_ID = String(votazioneId);
            }
        }
        
        // Estrai VOTAZIONE_ID da votazioni array (prendi il primo elemento)
        if (data.votazioni && Array.isArray(data.votazioni) && data.votazioni.length > 0) {
            const votazioneId = data.votazioni[0]._id || data.votazioni[0].id;
            if (votazioneId) {
                responseVariables.VOTAZIONE_ID = String(votazioneId);
            }
        }
        
        // Estrai INIZIATIVA_ID da iniziativa._id o iniziativa.id (singolare)
        if (data.iniziativa) {
            const iniziativaId = data.iniziativa._id || data.iniziativa.id;
            if (iniziativaId) {
                responseVariables.INIZIATIVA_ID = String(iniziativaId);
            }
        }
        
        // Estrai INIZIATIVA_ID da iniziative array (prendi il primo elemento)
        if (data.iniziative && Array.isArray(data.iniziative) && data.iniziative.length > 0) {
            const iniziativaId = data.iniziative[0]._id || data.iniziative[0].id;
            if (iniziativaId) {
                responseVariables.INIZIATIVA_ID = String(iniziativaId);
            }
        }
        
        // Estrai SONDAGGIO_ID da sondaggio._id o sondaggio.id (singolare)
        if (data.sondaggio) {
            const sondaggioId = data.sondaggio._id || data.sondaggio.id;
            if (sondaggioId) {
                responseVariables.SONDAGGIO_ID = String(sondaggioId);
            }
        }
        
        // Estrai SONDAGGIO_ID da sondaggi array (prendi il primo elemento)
        if (data.sondaggi && Array.isArray(data.sondaggi) && data.sondaggi.length > 0) {
            const sondaggioId = data.sondaggi[0]._id || data.sondaggi[0].id;
            if (sondaggioId) {
                responseVariables.SONDAGGIO_ID = String(sondaggioId);
            }
        }
        
        // Estrai CATEGORIA_ID da categoria._id o categoria.id (singolare)
        if (data.categoria) {
            const categoriaId = data.categoria._id || data.categoria.id;
            if (categoriaId) {
                responseVariables.CATEGORIA_ID = String(categoriaId);
            }
        }
        
        // Estrai CATEGORIA_ID da categorie array (prendi il primo elemento)
        if (data.categorie && Array.isArray(data.categorie) && data.categorie.length > 0) {
            const categoriaId = data.categorie[0]._id || data.categorie[0].id;
            if (categoriaId) {
                responseVariables.CATEGORIA_ID = String(categoriaId);
            }
        }
        
        // Estrai OPERATORE_ID da operatore._id, operatore.id o operatore.id
        if (data.operatore) {
            const operatoreId = data.operatore._id || data.operatore.id;
            if (operatoreId) {
                responseVariables.OPERATORE_ID = String(operatoreId);
            }
        }
        
        // Estrai CITTADINO_ID da cittadino._id, cittadino.id o data.cittadinoId
        if (data.cittadino) {
            const cittadinoId = data.cittadino._id || data.cittadino.id;
            if (cittadinoId) {
                responseVariables.CITTADINO_ID = String(cittadinoId);
            }
        }
        if (data.cittadinoId) {
            responseVariables.CITTADINO_ID = String(data.cittadinoId);
        }
        
    } catch (e) {
        // Non è JSON o errore di parsing, ignora
    }
}

// Sostituisci variabili nei valori delle richieste
async function replaceVariables(text, config, baseUrl, responseVariables = {}) {
    if (!text) return text;
    
    // Decodifica il testo se è URL-encoded (per gestire casi in cui new URL() ha già fatto l'encoding)
    let decodedText = text;
    try {
        decodedText = decodeURIComponent(text);
    } catch (e) {
        // Se il decode fallisce, usa il testo originale
        decodedText = text;
    }
    
    const variables = {
        '{{TOKEN_OPERATORE}}': async () => await getValidToken('operatore', config, baseUrl),
        '{{TOKEN_CITTADINO}}': async () => await getValidToken('cittadino', config, baseUrl)
    };
    
    // Aggiungi variabili estratte dalle risposte
    for (const [key, value] of Object.entries(responseVariables)) {
        variables[`{{${key}}}`] = async () => value;
    }
    
    let result = decodedText;
    for (const [variable, getValue] of Object.entries(variables)) {
        if (result.includes(variable)) {
            const value = await getValue();
            result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
        }
    }
    
    return result;
}

// Sostituisci variabili in una richiesta
async function replaceRequestVariables(request, config, baseUrl, responseVariables = {}) {
    // Sostituisci nel path
    request.path = await replaceVariables(request.path, config, baseUrl, responseVariables);
    
    // Sostituisci negli headers
    for (const [key, value] of Object.entries(request.headers)) {
        request.headers[key] = await replaceVariables(value, config, baseUrl, responseVariables);
    }
    
    // Sostituisci nel body
    if (request.body) {
        request.body = await replaceVariables(request.body, config, baseUrl, responseVariables);
    }
    
    return request;
}

// Main
async function main() {
    const args = process.argv.slice(2);
    const restFile = resolveRestFile(args[0]);
    
    console.log(`${colors.bright}${colors.blue}Testing API from: ${restFile}${colors.reset}\n`);
    
    // Verifica che il file esista
    if (!existsSync(restFile)) {
        console.error(`${colors.red}Error: File not found: ${restFile}${colors.reset}`);
        console.error(`${colors.yellow}Tip: Use a path relative to the project root or absolute path${colors.reset}`);
        process.exit(1);
    }
    
    // Carica configurazione
    const config = loadConfig();
    
    try {
        const requests = parseRestFile(restFile);
        console.log(`Found ${requests.length} request(s)\n`);
        
        // Determina base URL (usa quello dalla config o default)
        let defaultBaseUrl = config.baseUrl;
        
        // Variabili estratte dalle risposte (persistono tra le richieste)
        const responseVariables = {};
        
        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            
            // Estrai base URL se presente nella richiesta
            let baseUrl = defaultBaseUrl;
            if (request.host) {
                baseUrl = `${request.protocol || 'http'}://${request.host}${request.port ? ':' + request.port : ''}`;
            }
            
            // Sostituisci variabili nella richiesta
            try {
                await replaceRequestVariables(request, config, baseUrl, responseVariables);
            } catch (tokenError) {
                console.log(`\n${colors.red}${'='.repeat(80)}${colors.reset}`);
                console.log(`${colors.bright}${colors.red}[${i + 1}/${requests.length}] Token Error${colors.reset}`);
                console.log(`${colors.gray}${request.method} ${request.path}${colors.reset}`);
                console.log(`${colors.red}${'='.repeat(80)}${colors.reset}\n`);
                console.error(`${colors.red}Error:${colors.reset} ${tokenError.message}`);
                console.log(`${colors.yellow}Tip: Configure credentials in .test-config.json or environment variables${colors.reset}`);
                console.log(`\n${colors.red}${'='.repeat(80)}${colors.reset}\n`);
                continue;
            }
            
            try {
                const response = await makeRequest(request, baseUrl);
                displayResponse(request, response, i + 1, requests.length);
                
                // Estrai ID dalla risposta se è un successo (2xx)
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    extractIdsFromResponse(response.body, responseVariables);
                    
                    // Mostra variabili estratte se ce ne sono di nuove
                    const newVars = Object.keys(responseVariables);
                    if (newVars.length > 0) {
                        console.log(`${colors.gray}Extracted variables: ${newVars.map(v => `{{${v}}}`).join(', ')}${colors.reset}\n`);
                    }
                }
                
                // Pausa tra le richieste
                if (i < requests.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } catch (error) {
                console.log(`\n${colors.red}${'='.repeat(80)}${colors.reset}`);
                console.log(`${colors.bright}${colors.red}[${i + 1}/${requests.length}] Error${colors.reset}`);
                console.log(`${colors.gray}${request.method} ${request.path}${colors.reset}`);
                console.log(`${colors.red}${'='.repeat(80)}${colors.reset}\n`);
                console.error(`${colors.red}Error:${colors.reset} ${error.message}`);
                if (error.code === 'ECONNREFUSED') {
                    console.error(`${colors.yellow}Tip: Make sure the server is running on ${baseUrl}${colors.reset}`);
                }
                console.log(`\n${colors.red}${'='.repeat(80)}${colors.reset}\n`);
            }
        }
        
        console.log(`${colors.green}${colors.bright}✓ All requests completed${colors.reset}\n`);
    } catch (error) {
        console.error(`${colors.red}Error parsing file:${colors.reset} ${error.message}`);
        process.exit(1);
    }
}

main();