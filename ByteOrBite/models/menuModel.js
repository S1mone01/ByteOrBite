const db = require('../db/database_panini');

const Menu = {
    // Funzione per leggere tutti i menu
    tutti: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM menu", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
};

module.exports = Menu;
