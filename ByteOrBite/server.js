const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const User = require('./models/userModel');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint di registrazione
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email e password sono obbligatorie." });
    }

    try {
        // 1. Cripta la password (10 round di hashing)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Salva nel database tramite il modello
        // Nota: Qui potresti voler gestire un ruolo specifico se inviato dal client, 
        // ma di default è 'user'.
        const role = req.body.role || 'user';
        const nuovoUtente = await User.create(name, email, hashedPassword, role);

        console.log("Utente registrato con successo:", nuovoUtente);
        res.status(201).json({ message: "Registrazione completata", user: nuovoUtente });
    } catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            return res.status(400).json({ error: "Email già registrata." });
        }
        console.error("Errore durante la registrazione:", error.message);
        res.status(500).json({ error: "Errore interno del server." });
    }
});

// Endpoint di login (aggiunto per completezza)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Credenziali non valide." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.json({ message: "Login effettuato", user: { id: user.id, name: user.name, email: user.email, points: user.points, role: user.role } });
        } else {
            res.status(401).json({ error: "Credenziali non valide." });
        }
    } catch (error) {
        console.error("Errore durante il login:", error.message);
        res.status(500).json({ error: "Errore interno del server." });
    }
});

// --- SEZIONE GESTIONE PANINI  ---
const Panino = require('./models/paniniModel');

// Rotta per ottenere il catalogo
app.get('/catalogo', async (req, res) => {
    try {
        const elenco = await Panino.tutti();
        res.json(elenco);
    } catch (err) {
        res.status(500).json({ error: "Errore nel recupero dei panini" });
    }
});

// Rotta per aggiungere un panino al catalogo
app.post('/catalogo/aggiungi', async (req, res) => {
    const { nome, ingredienti, prezzo } = req.body;
    try {
        const nuovoPanino = await Panino.aggiungi(nome, ingredienti, prezzo);
        res.status(201).json(nuovoPanino);
    } catch (err) {
        res.status(500).json({ error: "Errore nel salvataggio del panino" });
    }
});
// --- FINE SEZIONE PANINI ---


app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});
