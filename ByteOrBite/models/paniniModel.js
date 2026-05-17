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
    },


    // Funzione per prendere un panino specifico CON i suoi ingredienti
    getDettaglio: (paninoId) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT ingredienti.nome, ingredienti.prezzo_extra 
                FROM panino_ingredienti
                JOIN ingredienti ON panino_ingredienti.ingrediente_id = ingredienti.id
                WHERE panino_ingredienti.panino_id = ?
            `;
            
            db.all(sql, [paninoId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows); // restituisce la lista degli ingredienti di quel panino
            });
        });
    }

};

module.exports = Panino;