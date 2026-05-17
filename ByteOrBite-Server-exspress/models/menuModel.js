const { catalogDB: db } = require('../db/database');

const Menu = {
    tutti: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM menu", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    aggiungi: (nome, prezzo, immagine_url, panino_id, patatine_id, bibite_id, disponibile = 1) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO menu (nome, prezzo, immagine_url, panino_id, patatine_id, bibite_id, disponibile) VALUES (?, ?, ?, ?, ?, ?, ?)";
            db.run(sql, [nome, prezzo, immagine_url, panino_id, patatine_id, bibite_id, disponibile], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, nome, prezzo, disponibile });
            });
        });
    },

    modifica: (id, nome, prezzo, immagine_url, panino_id, patatine_id, bibite_id, disponibile) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE menu SET nome = ?, prezzo = ?, immagine_url = ?, panino_id = ?, patatine_id = ?, bibite_id = ?, disponibile = ? WHERE id = ?";
            db.run(sql, [nome, prezzo, immagine_url, panino_id, patatine_id, bibite_id, disponibile, id], (err) => {
                if (err) reject(err);
                else resolve({ id, nome, prezzo, disponibile });
            });
        });
    },

    elimina: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM menu WHERE id = ?", [id], (err) => {
                if (err) reject(err);
                else resolve({ messaggio: "Menu eliminato" });
            });
        });
    }
};

module.exports = Menu;
