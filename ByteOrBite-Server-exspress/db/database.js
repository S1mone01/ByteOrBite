const sqlite3 = require('sqlite3').verbose();
const path = require('path');


// CONFIGURAZIONE DATABASE UTENTI
const userDbPath = path.resolve(__dirname, 'database.sqlite');
const userDB = new sqlite3.Database(userDbPath, (err) => {
    if (err) console.error("Errore connessione DB Utenti:", err.message);
    else console.log("Connesso al database fisico: database.sqlite (Utenti)");
});

// Inizializzazione tabelle per gli utenti
userDB.serialize(() => {
    userDB.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            points INTEGER DEFAULT 0,
            role TEXT DEFAULT 'user',
            location TEXT
        )
    `);
});


// CONFIGURAZIONE DATABASE CATALOGO (ByteOrBite)
const catalogDbPath = path.resolve(__dirname, 'catalogo_panini.sqlite');
const catalogDB = new sqlite3.Database(catalogDbPath, (err) => {
    if (err) console.error("Errore connessione DB Catalogo:", err.message);
    else console.log("Connesso al database fisico: catalogo_panini.sqlite (Prodotti)");
});

// Inizializzazione tabelle per il catalogo prodotti
catalogDB.serialize(() => {
    
    // Tabella per i Panini
    catalogDB.run(`CREATE TABLE IF NOT EXISTS panini (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        immagine_url TEXT,
        disponibile INTEGER DEFAULT 1, -- 1 = disponibile, 0 = esaurito
        ingredienti TEXT,              -- Descrizione testuale opzionale
        prezzo REAL
    )`);

    // Tabella per gli Ingredienti
    catalogDB.run(`CREATE TABLE IF NOT EXISTS ingredienti(
        id  INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        prezzo_extra REAL,            -- Costo aggiuntivo se aggiunto a un panino
        immagine_url TEXT,
        disponibile INTEGER DEFAULT 1
    )`);

    // Tabella collegamento (Molti-a-Molti) tra Panini e Ingredienti
    // Collega ogni panino ai suoi ingredienti predefiniti
    catalogDB.run(`CREATE TABLE IF NOT EXISTS panino_ingredienti(
        panino_id INTEGER,
        ingredienti_id INTEGER,
        FOREIGN KEY (panino_id) REFERENCES panini(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredienti_id) REFERENCES ingredienti(id) ON DELETE CASCADE,
        PRIMARY KEY (panino_id, ingredienti_id)
    )`);

    // Tabella per le Bibite
    catalogDB.run(`CREATE TABLE IF NOT EXISTS bibite(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        immagine_url TEXT,
        prezzo REAL,                  -- Prezzo se comprata singolarmente
        sovrapprezzo REAL DEFAULT 0,  -- Costo extra se scelta all'interno di un menu
        disponibile INTEGER DEFAULT 1
    )`);

    // Tabella per i contorni (Patatine)
    catalogDB.run(`CREATE TABLE IF NOT EXISTS patatine(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        immagine_url TEXT,
        prezzo REAL,                  -- Prezzo se comprata singolarmente
        sovrapprezzo REAL DEFAULT 0,  -- Costo extra se scelta all'interno di un menu
        disponibile INTEGER DEFAULT 1
    )`);
    
    // Tabella per i Menu completi (Combo: Panino + Patatine + Bibita)
    catalogDB.run(`CREATE TABLE IF NOT EXISTS menu(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        panino_id INTEGER,
        patatine_id INTEGER,
        bibite_id INTEGER,
        immagine_url TEXT,
        prezzo REAL,
        disponibile INTEGER DEFAULT 1,
        FOREIGN KEY (panino_id) REFERENCES panini(id),
        FOREIGN KEY (patatine_id) REFERENCES patatine(id),
        FOREIGN KEY (bibite_id) REFERENCES bibite(id)
    )`);
});

// CONFIGURAZIONE DATABASE ORDINI
const ordersDbPath = path.resolve(__dirname, 'ordini.sqlite');
const ordersDB = new sqlite3.Database(ordersDbPath, (err) => {
    if (err) console.error("Errore connessione DB Ordini:", err.message);
    else console.log("Connesso al database fisico: ordini.sqlite");
});

ordersDB.serialize(() => {
    ordersDB.run(`CREATE TABLE IF NOT EXISTS ordini (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        utente_id INTEGER,
        utente_nome TEXT,
        destinazione TEXT,
        stato TEXT DEFAULT 'ordinato', -- ordinato, in preparazione, spedito, completato
        totale REAL,
        data_ora DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    ordersDB.run(`CREATE TABLE IF NOT EXISTS ordine_prodotti (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ordine_id INTEGER,
        prodotto_nome TEXT,
        quantita INTEGER,
        prezzo_unitario REAL,
        modifiche TEXT, -- JSON o stringa per ingredienti extra/rimossi
        FOREIGN KEY (ordine_id) REFERENCES ordini(id) ON DELETE CASCADE
    )`);
});

// Esportiamo le connessioni separate per poterle usare nei modelli specifici
module.exports = { userDB, catalogDB, ordersDB };
