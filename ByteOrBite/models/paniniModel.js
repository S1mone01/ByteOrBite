const db = require('../db/database_panini');

const Panino = {
    // Funzione per leggere tutti i panini
    tutti: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM panini", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    // Funzione per aggiungere un nuovo panino
    aggiungi: (nome, ingredienti, prezzo) => {
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO panini (nome, ingredienti, prezzo) VALUES (?, ?, ?)";
            db.run(query, [nome, ingredienti, prezzo], function(err) {
                if (err) reject(err);
                resolve({ id: this.lastID, nome, ingredienti, prezzo });
            });
        });
    }
};

module.exports = Panino;