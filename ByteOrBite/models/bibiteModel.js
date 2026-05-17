const db = require('../db/database_panini');

const Bibita = {
    // Funzione per leggere tutte le bibite
    tutti: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM bibite", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
}