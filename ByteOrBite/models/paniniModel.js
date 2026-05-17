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

   aggiungi: (nome, prezzo, immagine_url, disponibilita, arrayIngredientiIds) => {
    return new Promise((resolve, reject) => {
        // 1. Inseriamo prima il panino nella sua tabella (SENZA la colonna ingredienti)
        const queryPanino = "INSERT INTO panini (nome, prezzo, immagine_url, disponibile) VALUES (?, ?, ?, ?)";
        
        db.run(queryPanino, [nome, prezzo, immagine_url, disponibilita], function(err) {
            if (err) {
                return reject(err);
            }
            
            const nuovoPaninoId = this.lastID; // Recuperiamo l'ID generato automaticamente

            // Se l'admin non ha selezionato ingredienti, ci fermiamo qui
            if (!arrayIngredientiIds || arrayIngredientiIds.length === 0) {
                return resolve({ id: nuovoPaninoId, nome, prezzo });
            }

            // 2. Colleghiamo gli ingredienti nella tabella ponte
            const queryPonte = "INSERT INTO panino_ingredienti (panino_id, ingrediente_id) VALUES (?, ?)";
            
            // Usiamo un ciclo per inserire ogni singolo ingrediente associato a questo panino
            let inserimentiCompletati = 0;
            let haAvutoErrore = false;

            arrayIngredientiIds.forEach((ingredienteId) => {
                db.run(queryPonte, [nuovoPaninoId, ingredienteId], (errPonte) => {
                    if (errPonte && !haAvutoErrore) {
                        haAvutoErrore = true;
                        return reject(errPonte);
                    }
                    
                    inserimentiCompletati++;
                    // Quando tutti gli ingredienti sono stati scritti nel DB, risolviamo la promessa
                    if (inserimentiCompletati === arrayIngredientiIds.length && !haAvutoErrore) {
                        resolve({ id: nuovoPaninoId, nome, prezzo, ingredienti: arrayIngredientiIds });
                    }
                });
            });
        });
    });
},

rimuovi: (id) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE panini SET disponibile = 0 WHERE id = ?`;
        db.run(sql, [id], (err) => {
            if (err) reject(err);
            else resolve({ messaggio: "Panino rimosso con successo" });
        });
    });
},

cercaPerIngrediente: (ingredienteId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT panini.* FROM panini
            JOIN panino_ingredienti ON panini.id = panino_ingredienti.panino_id
            WHERE panino_ingredienti.ingrediente_id = ? AND panini.disponibile = 1
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
                JOIN ingredienti ON panino_ingredienti.ingrediente_id = ingredienti.id
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