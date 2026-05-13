const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crea o apre il file database.sqlite
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Errore di connessione al DB:", err.message);
    } else {
        console.log("Connesso al database SQLite.");
    }
});

// Inizializzazione tabelle
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);
});

module.exports = db;
