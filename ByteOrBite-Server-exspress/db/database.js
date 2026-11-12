const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const databases = ['userDB', 'catalogDB', 'cartDB', 'ordersDB'];
const files = ['utenti.sqlite', 'catalogo.sqlite', 'carrello.sqlite', 'ordini.sqlite'];

const connections = {};

databases.forEach((name, index) => {
    connections[name] = new sqlite3.Database(
        path.join(__dirname, files[index]),
        (err) => {
            if (err) console.error(`Errore connessione ${files[index]}:`, err.message);
            else console.log(`Connesso a ${files[index]}`);
        }
    );
});
module.exports = connections;