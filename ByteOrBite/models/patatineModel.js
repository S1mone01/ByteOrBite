const db = require('../db/database_panini');

const Patatine = {
    // Funzione per leggere tutte le patatine
    tutti: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM patatineSS", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
};

module.exports = Patatine;
