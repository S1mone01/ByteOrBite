const { cartDB: db } = require('../db/database');

const Carrello = {
    // Recupera tutti gli elementi nel carrello di un utente
    getByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM carrello WHERE utente_id = ?`;
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Aggiunge un prodotto al carrello
    addItem: (itemData) => {
        const { utente_id, prodotto_nome, quantita, prezzo_unitario, modifiche, tipo_prodotto, immagine_url } = itemData;
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO carrello (utente_id, prodotto_nome, quantita, prezzo_unitario, modifiche, tipo_prodotto, immagine_url) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            db.run(sql, [utente_id, prodotto_nome, quantita, prezzo_unitario, modifiche || '', tipo_prodotto, immagine_url], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...itemData });
            });
        });
    },

    // Aggiorna la quantità di un elemento nel carrello
    updateQuantity: (id, quantita) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE carrello SET quantita = ? WHERE id = ?`;
            db.run(sql, [quantita, id], function(err) {
                if (err) reject(err);
                else resolve({ success: true, id, quantita });
            });
        });
    },

    // Rimuove un elemento dal carrello
    removeItem: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM carrello WHERE id = ?`;
            db.run(sql, [id], (err) => {
                if (err) reject(err);
                else resolve({ success: true });
            });
        });
    },

    // Svuota il carrello di un utente
    clearByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM carrello WHERE utente_id = ?`;
            db.run(sql, [userId], (err) => {
                if (err) reject(err);
                else resolve({ success: true });
            });
        });
    }
};

module.exports = Carrello;
