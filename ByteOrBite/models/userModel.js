const db = require('../db/database');

const User = {
    // Creazione nuovo utente
    create: (name, email, password) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
            db.run(sql, [name, email, password], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, name, email });
            });
        });
    },

    // Ricerca per email
    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE email = ?`;
            db.get(sql, [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
};

module.exports = User;
