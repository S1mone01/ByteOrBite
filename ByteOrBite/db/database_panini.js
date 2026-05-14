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
    db.run(`CREATE TABLE IF NOT EXISTS panini (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        ingredienti TEXT,
        prezzo REAL
    )`);
});

module.exports = db;