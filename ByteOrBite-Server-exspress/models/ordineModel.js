const { ordersDB: db } = require('../db/database');

const Ordine = {
    // Recupera tutti gli ordini (con i prodotti associati)
    getAll: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ordini ORDER BY data_ora DESC`;
            db.all(sql, [], async (err, rows) => {
                if (err) reject(err);
                else {
                    const ordiniCompleti = [];
                    for (const row of rows) {
                        const prodotti = await Ordine.getProdottiByOrdineId(row.id);
                        ordiniCompleti.push({ ...row, prodotti });
                    }
                    resolve(ordiniCompleti);
                }
            });
        });
    },

    // Recupera i prodotti di un singolo ordine
    getProdottiByOrdineId: (ordineId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ordine_prodotti WHERE ordine_id = ?`;
            db.all(sql, [ordineId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Crea un nuovo ordine
    create: (ordineData) => {
        const { utente_id, utente_nome, destinazione, totale, prodotti } = ordineData;
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                const sqlOrdine = `INSERT INTO ordini (utente_id, utente_nome, destinazione, totale) VALUES (?, ?, ?, ?)`;
                db.run(sqlOrdine, [utente_id, utente_nome, destinazione, totale], function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const ordineId = this.lastID;
                    const stmt = db.prepare(`INSERT INTO ordine_prodotti (ordine_id, prodotto_nome, quantita, prezzo_unitario, modifiche) VALUES (?, ?, ?, ?, ?)`);
                    
                    prodotti.forEach(p => {
                        stmt.run(ordineId, p.prodotto_nome, p.quantita, p.prezzo_unitario, p.modifiche || '');
                    });

                    stmt.finalize((err) => {
                        if (err) reject(err);
                        else resolve({ id: ordineId, ...ordineData });
                    });
                });
            });
        });
    },

    // Aggiorna un ordine (stato e/o destinazione)
    update: (id, data) => {
        const { stato, destinazione } = data;
        return new Promise((resolve, reject) => {
            const sql = `UPDATE ordini SET stato = ?, destinazione = ? WHERE id = ?`;
            db.run(sql, [stato, destinazione, id], function(err) {
                if (err) reject(err);
                else resolve({ success: true, id, stato, destinazione });
            });
        });
    },

    // Elimina un ordine
    delete: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM ordini WHERE id = ?`;
            db.run(sql, [id], (err) => {
                if (err) reject(err);
                else resolve({ success: true });
            });
        });
    }
};

module.exports = Ordine;
