import http from 'http';
import https from 'https';
import { readFileSync, existsSync } from 'fs';
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
        const url = new URL(request.path, baseUrl);
        const options = {
            hostname: url.hostname || 'localhost',
            port: url.port || 3000,
            path: url.pathname + url.search,
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
        
        const client = url.protocol === 'https:' ? https : http;
        
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
    
    try {
        const requests = parseRestFile(restFile);
        console.log(`Found ${requests.length} request(s)\n`);
        
        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            
            // Estrai base URL se presente
            let baseUrl = 'http://localhost:3000';
            if (request.host) {
                baseUrl = `${request.protocol || 'http'}://${request.host}${request.port ? ':' + request.port : ''}`;
            }
            
            try {
                const response = await makeRequest(request, baseUrl);
                displayResponse(request, response, i + 1, requests.length);
                
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

