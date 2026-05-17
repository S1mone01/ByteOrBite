const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crea il file fisico catalogo_panini.sqlite nella cartella db
const dbPath = path.resolve(__dirname, 'catalogo_panini.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Errore connessione DB Panini:", err.message);
    } else {
        console.log("Database Panini pronto e connesso.");
    }
});

// Creiamo la tabella se non esiste
db.serialize(() => {
    //tabella panini
    db.run(`CREATE TABLE IF NOT EXISTS panini (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        ingredienti TEXT,
        prezzo REAL
    )`);

    //tabella ingredienti
    db.run(`CREATE TABLE IF NOT EXISTS ingredienti(
        id  INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        prezzo_extra REAL,
        immagine_url TEXT,
        disponibilita INTEGER DEFAULT 1
        )`);

    //tabella panino_ingredienti
    db.run(`CREATE TABLE IF NOT EXISTS panino_ingredienti(
        panino_id INTEGER,
        ingredienti_id INTEGER,
        FOREIGN KEY (panino_id) REFERENCES panini(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredienti_id) REFERENCES ingredienti(id) ON DELETE CASCADE,
        PRIMARY KEY (panino_id, ingredienti_id)
        )`);

    //tabella bibite
    db.run(`CREATE TABLE IF NOT EXISTS bibite(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        immagine_url TEXT,
        prezzo REAL
        )`);

    //tabella patatine
    db.run(`CREATE TABLE IF NOT EXISTS patatine(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        immagine_url TEXT,
        prezzo REAL
        )`);
    
    //tabella menu
    db.run(`CREATE TABLE IF NOT EXISTS menu(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        panino_id INTEGER,
        patatine_id INTEGER,
        bibite_id INTEGER,
        immagine_url TEXT,
        prezzo REAL,
        disponibilità INTEGER DEFAULT 1
        FOREIGN KEY (panino_id) REFERENCES panini(id),
        FOREIGN KEY (patatine_id) REFERENCES patatine(id),
        FOREIGN KEY (bibite_id) REFERENCES bibite(id),
        )`);
});

module.exports = db;