const { catalogDB: db } = require('../db/database');

const Panino = {
    tutti: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT panini.*, GROUP_CONCAT(panino_ingredienti.ingredienti_id) as ingredienti_ids
                FROM panini
                LEFT JOIN panino_ingredienti ON panini.id = panino_ingredienti.panino_id
                GROUP BY panini.id
            `;
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                
                // Converti la stringa GROUP_CONCAT in un array di numeri
                const formatRows = rows.map(row => ({
                    ...row,
                    ingredienti: row.ingredienti_ids ? row.ingredienti_ids.split(',').map(Number) : []
                }));
                resolve(formatRows);
            });
        });
    },

   aggiungi: (nome, prezzo, immagine_url, disponibile = 1, arrayIngredientiIds = []) => {
    return new Promise((resolve, reject) => {
        const queryPanino = "INSERT INTO panini (nome, prezzo, immagine_url, disponibile) VALUES (?, ?, ?, ?)";
        
        db.run(queryPanino, [nome, prezzo, immagine_url, disponibile], function(err) {
            if (err) return reject(err);
            
            const nuovoPaninoId = this.lastID;

            if (!arrayIngredientiIds || arrayIngredientiIds.length === 0) {
                return resolve({ id: nuovoPaninoId, nome, prezzo, disponibile });
            }

            const queryPonte = "INSERT INTO panino_ingredienti (panino_id, ingredienti_id) VALUES (?, ?)";
            let inserimentiCompletati = 0;
            let haAvutoErrore = false;

            arrayIngredientiIds.forEach((ingredienteId) => {
                db.run(queryPonte, [nuovoPaninoId, ingredienteId], (errPonte) => {
                    if (errPonte && !haAvutoErrore) {
                        haAvutoErrore = true;
                        return reject(errPonte);
                    }
                    
                    inserimentiCompletati++;
                    if (inserimentiCompletati === arrayIngredientiIds.length && !haAvutoErrore) {
                        resolve({ id: nuovoPaninoId, nome, prezzo, disponibile, ingredienti: arrayIngredientiIds });
                    }
                });
            });
        });
    });
},

modifica: (id, nome, prezzo, immagine_url, disponibile, arrayIngredientiIds) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE panini SET nome = ?, prezzo = ?, immagine_url = ?, disponibile = ? WHERE id = ?`;
        db.run(sql, [nome, prezzo, immagine_url, disponibile, id], function(err) {
            if (err) return reject(err);

            // Elimina vecchi legami e inserisci nuovi
            db.run("DELETE FROM panino_ingredienti WHERE panino_id = ?", [id], (errDel) => {
                if (errDel) return reject(errDel);

                if (!arrayIngredientiIds || arrayIngredientiIds.length === 0) {
                    return resolve({ id, nome, prezzo, disponibile });
                }

                const queryPonte = "INSERT INTO panino_ingredienti (panino_id, ingredienti_id) VALUES (?, ?)";
                let inserimentiCompletati = 0;
                let haAvutoErrore = false;

                arrayIngredientiIds.forEach((ingredienteId) => {
                    db.run(queryPonte, [id, ingredienteId], (errPonte) => {
                        if (errPonte && !haAvutoErrore) {
                            haAvutoErrore = true;
                            return reject(errPonte);
                        }
                        inserimentiCompletati++;
                        if (inserimentiCompletati === arrayIngredientiIds.length && !haAvutoErrore) {
                            resolve({ id, nome, prezzo, disponibile, ingredienti: arrayIngredientiIds });
                        }
                    });
                });
            });
        });
    });
},

elimina: (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM panini WHERE id = ?", [id], (err) => {
            if (err) reject(err);
            else resolve({ messaggio: "Panino eliminato definitivamente" });
        });
    });
},

toggleDisponibilita: (id, stato) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE panini SET disponibile = ? WHERE id = ?`;
        db.run(sql, [stato, id], (err) => {
            if (err) reject(err);
            else resolve({ id, disponibile: stato });
        });
    });
},

rimuovi: (id) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE panini SET disponibile = 0 WHERE id = ?`;
        db.run(sql, [id], (err) => {
            if (err) reject(err);
            else resolve({ messaggio: "Panino rimosso (non disponibile)" });
        });
    });
},

cercaPerIngrediente: (ingredienteId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT panini.* FROM panini
            JOIN panino_ingredienti ON panini.id = panino_ingredienti.panino_id
            WHERE panino_ingredienti.ingredienti_id = ? AND panini.disponibile = 1
        `;
        db.all(sql, [ingredienteId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows); // Ti restituisce solo i panini che contengono quell'ingrediente
        });
    });
},


    // Funzione per prendere un panino specifico CON i suoi ingredienti
    getDettaglio: (panino_id) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT ingredienti.nome, ingredienti.prezzo_extra 
                FROM panino_ingredienti
                JOIN ingredienti ON panino_ingredienti.ingredienti_id = ingredienti.id
                WHERE panino_ingredienti.panino_id = ?
            `;
            
            db.all(sql, [panino_id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows); // restituisce la lista degli ingredienti di quel panino
            });
        });
    }

};

module.exports = Panino;