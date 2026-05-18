const { catalogDB: db } = require('../db/database');

const Ingrediente = {
    tutti: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM ingredienti", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    aggiungi: (nome, prezzo_extra, immagine_url, disponibile = 1) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO ingredienti (nome, prezzo_extra, immagine_url, disponibile) VALUES (?, ?, ?, ?)";
            db.run(sql, [nome, prezzo_extra, immagine_url, disponibile], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, nome, prezzo_extra, immagine_url, disponibile });
            });
        });
    },

    modifica: (id, nome, prezzo_extra, immagine_url, disponibile) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE ingredienti SET nome = ?, prezzo_extra = ?, immagine_url = ?, disponibile = ? WHERE id = ?";
            db.run(sql, [nome, prezzo_extra, immagine_url, disponibile, id], (err) => {
                if (err) reject(err);
                else resolve({ id, nome, prezzo_extra, immagine_url, disponibile });
            });
        });
    },

    elimina: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM ingredienti WHERE id = ?", [id], (err) => {
                if (err) reject(err);
                else resolve({ messaggio: "Ingrediente eliminato" });
            });
        });
    }
};

module.exports = Ingrediente;
