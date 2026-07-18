// Base URL del backend per le chiamate API.
// Vuoto in sviluppo: le chiamate restano relative e passano dal proxy di Vite.
// In produzione impostata via VITE_BACKEND_URL (es. https://ingegneria-software.onrender.com).
export const API_BASE = import.meta.env.VITE_BACKEND_URL || '';
console.log('API_BASE:', API_BASE);
