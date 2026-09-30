const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const userDB = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) console.error('Errore connessione database.sqlite:', err.message);
    else console.log('Connesso a database.sqlite (Utenti)');
});

const catalogDB = new sqlite3.Database(path.join(__dirname, 'catalogo_panini.sqlite'), (err) => {
    if (err) console.error('Errore connessione catalogo_panini.sqlite:', err.message);
    else console.log('Connesso a catalogo_panini.sqlite (Catalogo)');
});

const cartDB = new sqlite3.Database(path.join(__dirname, 'carrello.sqlite'), (err) => {
    if (err) console.error('Errore connessione carrello.sqlite:', err.message);
    else console.log('Connesso a carrello.sqlite (Carrello)');
});

const ordersDB = new sqlite3.Database(path.join(__dirname, 'ordini.sqlite'), (err) => {
    if (err) console.error('Errore connessione ordini.sqlite:', err.message);
    else console.log('Connesso a ordini.sqlite (Ordini)');
});

module.exports = {
    userDB,
    catalogDB,
    cartDB,
    ordersDB
};
