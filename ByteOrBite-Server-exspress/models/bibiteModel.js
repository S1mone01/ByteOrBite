const { catalogDB: db } = require('../db/database');

const Bibita = {
    tutti: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM bibite", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    aggiungi: (nome, prezzo, immagine_url, sovrapprezzo = 0, disponibile = 1) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO bibite (nome, prezzo, immagine_url, sovrapprezzo, disponibile) VALUES (?, ?, ?, ?, ?)";
            db.run(sql, [nome, prezzo, immagine_url, sovrapprezzo, disponibile], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, nome, prezzo, immagine_url, sovrapprezzo, disponibile });
            });
        });
    },

    modifica: (id, nome, prezzo, immagine_url, sovrapprezzo, disponibile) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE bibite SET nome = ?, prezzo = ?, immagine_url = ?, sovrapprezzo = ?, disponibile = ? WHERE id = ?";
            db.run(sql, [nome, prezzo, immagine_url, sovrapprezzo, disponibile, id], (err) => {
                if (err) reject(err);
                else resolve({ id, nome, prezzo, immagine_url, sovrapprezzo, disponibile });
            });
        });
    },

    elimina: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM bibite WHERE id = ?", [id], (err) => {
                if (err) reject(err);
                else resolve({ messaggio: "Bibita eliminata" });
            });
        });
    }
};

module.exports = Bibita;
