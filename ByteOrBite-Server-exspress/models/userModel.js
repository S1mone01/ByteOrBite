const { userDB: db } = require('../db/database');

const User = {
    // Creazione nuovo utente
    create: (name, email, password, role = 'user') => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (name, email, password, points, role) VALUES (?, ?, ?, 0, ?)`;
            db.run(sql, [name, email, password, role], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, name, email, points: 0, role, location: null });
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
    },

    // Ricerca per ID
    findById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Aggiornamento utente
    update: (id, data) => {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const values = Object.values(data);
            values.push(id);
            const sql = `UPDATE users SET ${fields} WHERE id = ?`;
            db.run(sql, values, function(err) {
                if (err) reject(err);
                else {
                    User.findById(id).then(resolve).catch(reject);
                }
            });
        });
    }
};

module.exports = User;
