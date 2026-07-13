/**
 * seedDemo.js — Popola il database con dati di esempio per testare TUTTE le funzionalità:
 * votazioni (risposta singola, multipla, conclusa, bozza), sondaggi (attivo/concluso),
 * iniziative (in_attesa/approvata/rifiutata), voti, sostegni e risposte.
 *
 * Uso:   npm run seed:demo
 *
 * ATTENZIONE: è uno strumento di sviluppo. Cancella e ricrea consultazioni, domande,
 * iniziative, voti e risposte, oltre ai soli cittadini demo (ID_univoco_esterno "seed-...").
 * Operatori reali e cittadini OAuth reali non vengono toccati. Rifiuta NODE_ENV=production.
 */
import "../config/env.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import connectDB from "../config/database.js";
import { Operatore } from "../models/operatore.js";
import { Cittadino } from "../models/cittadino.js";
import { CategoriaIniziativa } from "../models/categoria_iniziativa.js";
import { Consultazione } from "../models/consultazione.js";
import { Domanda } from "../models/domanda.js";
import { Iniziativa } from "../models/iniziativa.js";
import { VotoIniziativa } from "../models/voto_iniziativa.js";
import { RispostaConsultazione } from "../models/risposta_consultazione.js";
import { seedCategorie } from "./seedCategorie.js";

const SEED_TAG = "seed-"; // prefisso ID_univoco_esterno per i cittadini demo

// Helper date relative a "adesso"
const giorni = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
const nascita = (anno) => new Date(`${anno}-06-15T00:00:00.000Z`);

// Fasce temporali coerenti con lo scheduler (bozza→attivo→concluso)
const PERIODI = {
    attivo:   { data_discussione: giorni(-10), data_inizio: giorni(-5),  data_fine: giorni(10) },
    concluso: { data_discussione: giorni(-30), data_inizio: giorni(-25), data_fine: giorni(-5) },
    bozza:    { data_discussione: giorni(2),   data_inizio: giorni(5),   data_fine: giorni(20) },
};

async function creaVotazione({ titolo, descrizione, stato, creatoDa, domanda }) {
    const domandaDoc = await Domanda.create(domanda);
    const votazione = await Consultazione.create({
        tipo: "votazione",
        stato,
        titolo,
        descrizione,
        creatoDa,
        ID_domanda: domandaDoc._id,
        ...PERIODI[stato],
    });
    return { votazione, domanda: domandaDoc };
}

async function creaSondaggio({ titolo, descrizione, stato, creatoDa, domande }) {
    const domandeDoc = await Domanda.insertMany(domande);
    const sondaggio = await Consultazione.create({
        tipo: "sondaggio",
        stato,
        titolo,
        descrizione,
        creatoDa,
        ID_domande: domandeDoc.map((d) => d._id),
        ...PERIODI[stato],
    });
    return { sondaggio, domande: domandeDoc };
}

// Voto a una votazione (array di indici di opzione)
const votoVotazione = (cittadino, votazione, domanda, indiciOpzioni) => ({
    tipo_consultazione: "votazione",
    ID_consultazione: votazione._id,
    ID_cittadino: cittadino._id,
    ID_opzioni: indiciOpzioni.map((i) => domanda.opzioni[i]._id),
});

// Risposta a un sondaggio (mappa domanda -> array di indici di opzione)
const rispostaSondaggio = (cittadino, sondaggio, domande, sceltePerDomanda) => ({
    tipo_consultazione: "sondaggio",
    ID_consultazione: sondaggio._id,
    ID_cittadino: cittadino._id,
    dettagliRisposte: domande.map((d, idx) => ({
        ID_domanda: d._id,
        opzioniScelte: sceltePerDomanda[idx].map((i) => d.opzioni[i]._id),
    })),
});

async function run() {
    if (process.env.NODE_ENV === "production") {
        logger.fatal("seedDemo non eseguibile con NODE_ENV=production. Interrotto.");
        process.exit(1);
    }

    await connectDB();
    logger.info("== Seed demo: avvio ==");

    // 1. Categorie (idempotente)
    await seedCategorie();
    const categorie = await CategoriaIniziativa.find();
    const cat = Object.fromEntries(categorie.map((c) => [c.nome, c._id]));

    // 2. Operatore creatore (root, creato se assente)
    let operatore = await Operatore.findOne({ isRoot: true });
    if (!operatore) {
        operatore = await Operatore.create({
            username: "root",
            password: process.env.ROOT_PASSWORD || "rootPassword123",
            nome: "Root",
            cognome: "Admin",
            isRoot: true,
        });
        logger.info("Operatore root creato");
    }

    // 3. Pulizia dati demo
    const demoVecchi = await Cittadino.find({ ID_univoco_esterno: { $regex: `^${SEED_TAG}` } }).select("_id");
    await Promise.all([
        Consultazione.deleteMany({}),
        Domanda.deleteMany({}),
        Iniziativa.deleteMany({}),
        VotoIniziativa.deleteMany({}),
        RispostaConsultazione.deleteMany({}),
        Cittadino.deleteMany({ _id: { $in: demoVecchi.map((c) => c._id) } }),
    ]);
    logger.info("Dati demo precedenti rimossi");

    // 4. Cittadini demo (genere/categoria/età variati per i riepiloghi demografici)
    const cittadini = await Cittadino.insertMany([
        { nome: "Mario",    cognome: "Rossi",   genere: "Uomo",  categoria: "Studente",    dataNascita: nascita(2001), comuneResidenza: "Trento", circoscrizione: "Centro storico - Piedicastello", email: "mario.rossi@demo.it",    ID_univoco_esterno: `${SEED_TAG}mario`,   profiloCompleto: true },
        { nome: "Laura",    cognome: "Bianchi", genere: "Donna", categoria: "Lavoratore",  dataNascita: nascita(1990), comuneResidenza: "Trento", circoscrizione: "Oltrefersina",                   email: "laura.bianchi@demo.it",  ID_univoco_esterno: `${SEED_TAG}laura`,   profiloCompleto: true },
        { nome: "Giuseppe", cognome: "Verdi",   genere: "Uomo",  categoria: "Pensionato",  dataNascita: nascita(1955), comuneResidenza: "Trento", circoscrizione: "Gardolo",                        email: "giuseppe.verdi@demo.it", ID_univoco_esterno: `${SEED_TAG}giuseppe`, profiloCompleto: true },
        { nome: "Anna",     cognome: "Neri",    genere: "Donna", categoria: "Studente",    dataNascita: nascita(1999), comuneResidenza: "Trento", circoscrizione: "Povo",                           email: "anna.neri@demo.it",      ID_univoco_esterno: `${SEED_TAG}anna`,    profiloCompleto: true },
        { nome: "Marco",    cognome: "Gialli",  genere: "Uomo",  categoria: "Disoccupato", dataNascita: nascita(1978), comuneResidenza: "Trento", circoscrizione: "Mattarello",                     email: "marco.gialli@demo.it",   ID_univoco_esterno: `${SEED_TAG}marco`,   profiloCompleto: true },
    ]);
    const [mario, laura, giuseppe, anna, marco] = cittadini;
    logger.info(`${cittadini.length} cittadini demo creati`);

    // 5. Votazioni
    const opt = (...testi) => testi.map((t) => ({ testo: t }));

    const votSingolaAttiva = await creaVotazione({
        titolo: "Referendum: pedonalizzazione di Piazza Duomo",
        descrizione: "Sei favorevole alla pedonalizzazione permanente di Piazza Duomo nei fine settimana?",
        stato: "attivo",
        creatoDa: operatore._id,
        domanda: { titolo: "Sei favorevole alla pedonalizzazione?", tipo: "risposta_singola", opzioni: opt("Sì", "No", "Astenuto") },
    });

    const votMultiplaAttiva = await creaVotazione({
        titolo: "Interventi prioritari per la mobilità urbana",
        descrizione: "Quali interventi ritieni prioritari per migliorare la mobilità? Puoi scegliere più opzioni.",
        stato: "attivo",
        creatoDa: operatore._id,
        domanda: { titolo: "Quali interventi prioritari?", tipo: "risposta_multipla", opzioni: opt("Piste ciclabili", "Più verde urbano", "Illuminazione", "Nuovi parcheggi", "Trasporto pubblico") },
    });

    const votConclusa = await creaVotazione({
        titolo: "Nome del nuovo parco di quartiere",
        descrizione: "Votazione conclusa per scegliere il nome del nuovo parco.",
        stato: "concluso",
        creatoDa: operatore._id,
        domanda: { titolo: "Quale nome preferisci?", tipo: "risposta_singola", opzioni: opt("Parco delle Querce", "Parco Verde", "Parco della Pace") },
    });

    const votBozza = await creaVotazione({
        titolo: "Orari delle ZTL (in preparazione)",
        descrizione: "Bozza non ancora pubblicata.",
        stato: "bozza",
        creatoDa: operatore._id,
        domanda: { titolo: "Quale fascia oraria preferisci?", tipo: "risposta_singola", opzioni: opt("Mattina", "Pomeriggio", "Tutto il giorno") },
    });

    // 6. Sondaggi
    const sonAttivo = await creaSondaggio({
        titolo: "Qualità dei servizi cittadini",
        descrizione: "Aiutaci a capire come migliorare i servizi della città.",
        stato: "attivo",
        creatoDa: operatore._id,
        domande: [
            { titolo: "Quanto sei soddisfatto del trasporto pubblico?", tipo: "risposta_singola", opzioni: opt("Molto", "Abbastanza", "Poco", "Per niente") },
            { titolo: "Quali servizi useresti di più?", tipo: "risposta_multipla", opzioni: opt("Biblioteche", "Impianti sportivi", "Spazi giovani", "Mercati") },
        ],
    });

    const sonConcluso = await creaSondaggio({
        titolo: "Eventi estivi 2025 (concluso)",
        descrizione: "Sondaggio concluso sugli eventi estivi.",
        stato: "concluso",
        creatoDa: operatore._id,
        domande: [
            { titolo: "Quale tipo di evento preferisci?", tipo: "risposta_singola", opzioni: opt("Concerti", "Cinema all'aperto", "Sagre") },
        ],
    });

    // 7. Iniziative (tutti gli stati)
    const iniziative = await Iniziativa.insertMany([
        { titolo: "Più rastrelliere per le bici in centro", descrizione: "Installare nuove rastrelliere sicure vicino alle scuole e alle fermate del bus.", ID_categoria: cat["Mobilità"], ID_cittadino: laura._id,    stato: "approvata" },
        { titolo: "Orto urbano condiviso a Gardolo",        descrizione: "Creare un orto comunitario su un terreno comunale inutilizzato.",                ID_categoria: cat["Verde"],    ID_cittadino: giuseppe._id, stato: "approvata" },
        { titolo: "Torneo sportivo di quartiere",            descrizione: "Organizzare un torneo multisport aperto a tutte le età.",                        ID_categoria: cat["Sport"],    ID_cittadino: anna._id,     stato: "in_attesa" },
        { titolo: "Illuminazione del parco fluviale",        descrizione: "Migliorare l'illuminazione lungo il percorso fluviale per la sicurezza serale.", ID_categoria: cat["Sicurezza"], ID_cittadino: marco._id,    stato: "in_attesa" },
        { titolo: "Festival del libro in piazza",            descrizione: "Proposta respinta per mancanza di spazi idonei nel periodo richiesto.",          ID_categoria: cat["Cultura"],  ID_cittadino: mario._id,    stato: "rifiutata", motivazione_moderazione: "Spazi non disponibili nel periodo indicato." },
    ]);
    const [iniBici, iniOrto] = iniziative;

    // 8. Sostegni alle iniziative approvate (Mario sostiene SOLO iniBici → ne resta una da sostenere nei test)
    await VotoIniziativa.insertMany([
        { ID_iniziativa: iniBici._id, ID_cittadino: mario._id },
        { ID_iniziativa: iniBici._id, ID_cittadino: anna._id },
        { ID_iniziativa: iniBici._id, ID_cittadino: marco._id },
        { ID_iniziativa: iniOrto._id, ID_cittadino: laura._id },
        { ID_iniziativa: iniOrto._id, ID_cittadino: giuseppe._id },
    ]);

    // 9. Risposte alle consultazioni
    //    Le ATTIVE ricevono voti dagli altri cittadini ma NON da Mario, così l'utente di test
    //    può ancora votare/rispondere dal frontend.
    await RispostaConsultazione.insertMany([
        // Votazione singola attiva (riepilogo già popolato)
        votoVotazione(laura,    votSingolaAttiva.votazione, votSingolaAttiva.domanda, [0]),
        votoVotazione(giuseppe, votSingolaAttiva.votazione, votSingolaAttiva.domanda, [0]),
        votoVotazione(anna,     votSingolaAttiva.votazione, votSingolaAttiva.domanda, [1]),

        // Votazione MULTIPLA attiva (più opzioni per voto)
        votoVotazione(laura,    votMultiplaAttiva.votazione, votMultiplaAttiva.domanda, [0, 1, 4]),
        votoVotazione(giuseppe, votMultiplaAttiva.votazione, votMultiplaAttiva.domanda, [3]),
        votoVotazione(anna,     votMultiplaAttiva.votazione, votMultiplaAttiva.domanda, [0, 2]),
        votoVotazione(marco,    votMultiplaAttiva.votazione, votMultiplaAttiva.domanda, [0, 1]),

        // Votazione conclusa (tutti, incluso Mario → mostra "Partecipato" in archivio)
        votoVotazione(mario,    votConclusa.votazione, votConclusa.domanda, [0]),
        votoVotazione(laura,    votConclusa.votazione, votConclusa.domanda, [0]),
        votoVotazione(giuseppe, votConclusa.votazione, votConclusa.domanda, [2]),
        votoVotazione(anna,     votConclusa.votazione, votConclusa.domanda, [1]),
        votoVotazione(marco,    votConclusa.votazione, votConclusa.domanda, [0]),

        // Sondaggio attivo (senza Mario)
        rispostaSondaggio(laura,    sonAttivo.sondaggio, sonAttivo.domande, [[0], [0, 1]]),
        rispostaSondaggio(giuseppe, sonAttivo.sondaggio, sonAttivo.domande, [[1], [3]]),

        // Sondaggio concluso (con Mario)
        rispostaSondaggio(mario,    sonConcluso.sondaggio, sonConcluso.domande, [[0]]),
        rispostaSondaggio(anna,     sonConcluso.sondaggio, sonConcluso.domande, [[1]]),
        rispostaSondaggio(marco,    sonConcluso.sondaggio, sonConcluso.domande, [[2]]),
    ]);

    // 10. Token pronti all'uso
    const secret = process.env.JWT_SECRET;
    let tokenOperatore = "<JWT_SECRET non impostato>";
    let tokenCittadino = "<JWT_SECRET non impostato>";
    if (secret) {
        tokenOperatore = jwt.sign({ id: operatore._id, ruolo: "operatore" }, secret, { expiresIn: "7d" });
        tokenCittadino = jwt.sign({ id: mario._id, ruolo: "cittadino" }, secret, { expiresIn: "7d" });
    }

    // Riepilogo
    /* eslint-disable no-console */
    console.log(`
========================================================================
 SEED DEMO COMPLETATO
========================================================================
 Cittadini demo:        ${cittadini.length}   (utente di test: Mario Rossi)
 Votazioni:             singola attiva, multipla attiva, conclusa, bozza
 Sondaggi:              attivo (2 domande), concluso
 Iniziative:            2 approvate, 2 in attesa, 1 rifiutata

 ID UTILI
 ------------------------------------------------------------------------
 Operatore (root)            ${operatore._id}
 Cittadino test (Mario)      ${mario._id}
 Votazione singola attiva    ${votSingolaAttiva.votazione._id}
 Votazione multipla attiva   ${votMultiplaAttiva.votazione._id}
 Votazione conclusa          ${votConclusa.votazione._id}
 Votazione bozza             ${votBozza.votazione._id}
 Sondaggio attivo            ${sonAttivo.sondaggio._id}
 Sondaggio concluso          ${sonConcluso.sondaggio._id}
 Iniziativa approvata        ${iniBici._id}
 Iniziativa in attesa        ${iniziative[2]._id}

 TOKEN (validi 7 giorni) — usa come "Authorization: Bearer <token>"
 ------------------------------------------------------------------------
 OPERATORE:
 ${tokenOperatore}

 CITTADINO (Mario):
 ${tokenCittadino}
========================================================================
`);
    /* eslint-enable no-console */

    await mongoose.connection.close();
    logger.info("== Seed demo: completato ==");
    process.exit(0);
}

run().catch(async (err) => {
    logger.error("Errore nel seed demo:", err);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
});
