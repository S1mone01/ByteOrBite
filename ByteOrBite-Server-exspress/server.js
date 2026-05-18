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

const Panino = require('./models/paniniModel');
const Bibita = require('./models/bibiteModel');
const Patatine = require('./models/patatineModel');
const Menu = require('./models/menuModel');
const Ingrediente = require('./models/ingredientiModel');
const Ordine = require('./models/ordineModel');

// --- SEZIONE ORDINI ---
app.get('/ordini', async (req, res) => {
    try {
        const elenco = await Ordine.getAll();
        res.json(elenco);
    } catch (err) {
        res.status(500).json({ error: "Errore nel recupero degli ordini" });
    }
});

app.post('/ordini', async (req, res) => {
    try {
        const nuovo = await Ordine.create(req.body);
        res.status(201).json(nuovo);
    } catch (err) {
        console.error("Errore salvataggio ordine:", err.message);
        res.status(500).json({ error: "Errore nel salvataggio dell'ordine" });
    }
});

app.put('/ordini/:id', async (req, res) => {
    try {
        const aggiornato = await Ordine.update(req.params.id, req.body);
        res.json(aggiornato);
    } catch (err) {
        res.status(500).json({ error: "Errore nell'aggiornamento dell'ordine" });
    }
});

app.delete('/ordini/:id', async (req, res) => {
    try {
        await Ordine.delete(req.params.id);
        res.json({ message: "Ordine eliminato" });
    } catch (err) {
        res.status(500).json({ error: "Errore nell'eliminazione dell'ordine" });
    }
});

// --- SEZIONE GESTIONE PANINI  ---
app.get('/catalogo', async (req, res) => {
    try {
        const elenco = await Panino.tutti();
        res.json(elenco);
    } catch (err) {
        res.status(500).json({ error: "Errore nel recupero dei panini" });
    }
});

app.post('/catalogo', async (req, res) => {
    const { nome, prezzo, immagine_url, disponibile, ingredienti } = req.body;
    try {
        const nuovo = await Panino.aggiungi(nome, prezzo, immagine_url, disponibile, ingredienti);
        res.status(201).json(nuovo);
    } catch (err) {
        res.status(500).json({ error: "Errore nel salvataggio" });
    }
});

app.put('/catalogo/:id', async (req, res) => {
    const { nome, prezzo, immagine_url, disponibile, ingredienti } = req.body;
    try {
        const aggiornato = await Panino.modifica(req.params.id, nome, prezzo, immagine_url, disponibile, ingredienti);
        res.json(aggiornato);
    } catch (err) {
        res.status(500).json({ error: "Errore nella modifica" });
    }
});

app.delete('/catalogo/:id', async (req, res) => {
    try {
        await Panino.elimina(req.params.id);
        res.json({ message: "Eliminato" });
    } catch (err) {
        res.status(500).json({ error: "Errore nell'eliminazione" });
    }
});

// --- BIBITE ---
app.get('/bibite', async (req, res) => {
    try {
        const elenco = await Bibita.tutti();
        res.json(elenco);
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

app.post('/bibite', async (req, res) => {
    const { nome, prezzo, immagine_url, sovrapprezzo, disponibile } = req.body;
    try {
        const nuovo = await Bibita.aggiungi(nome, prezzo, immagine_url, sovrapprezzo, disponibile);
        res.status(201).json(nuovo);
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

app.put('/bibite/:id', async (req, res) => {
    const { nome, prezzo, immagine_url, sovrapprezzo, disponibile } = req.body;
    try {
        const aggiornato = await Bibita.modifica(req.params.id, nome, prezzo, immagine_url, sovrapprezzo, disponibile);
        res.json(aggiornato);
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

app.delete('/bibite/:id', async (req, res) => {
    try {
        await Bibita.elimina(req.params.id);
        res.json({ message: "Eliminato" });
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

// --- PATATINE ---
app.get('/patatine', async (req, res) => {
    try {
        const elenco = await Patatine.tutti();
        res.json(elenco);
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

app.post('/patatine', async (req, res) => {
    const { nome, prezzo, immagine_url, sovrapprezzo, disponibile } = req.body;
    try {
        const nuovo = await Patatine.aggiungi(nome, prezzo, immagine_url, sovrapprezzo, disponibile);
        res.status(201).json(nuovo);
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

app.put('/patatine/:id', async (req, res) => {
    const { nome, prezzo, immagine_url, sovrapprezzo, disponibile } = req.body;
    try {
        const aggiornato = await Patatine.modifica(req.params.id, nome, prezzo, immagine_url, sovrapprezzo, disponibile);
        res.json(aggiornato);
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

app.delete('/patatine/:id', async (req, res) => {
    try {
        await Patatine.elimina(req.params.id);
        res.json({ message: "Eliminato" });
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

// --- MENU ---
app.get('/menu', async (req, res) => {
    try {
        const elenco = await Menu.tutti();
        res.json(elenco);
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

app.post('/menu', async (req, res) => {
    const { nome, prezzo, immagine_url, panino_id, patatine_id, bibite_id, disponibile } = req.body;
    try {
        const nuovo = await Menu.aggiungi(nome, prezzo, immagine_url, panino_id, patatine_id, bibite_id, disponibile);
        res.status(201).json(nuovo);
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

app.put('/menu/:id', async (req, res) => {
    const { nome, prezzo, immagine_url, panino_id, patatine_id, bibite_id, disponibile } = req.body;
    try {
        const aggiornato = await Menu.modifica(req.params.id, nome, prezzo, immagine_url, panino_id, patatine_id, bibite_id, disponibile);
        res.json(aggiornato);
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

app.delete('/menu/:id', async (req, res) => {
    try {
        await Menu.elimina(req.params.id);
        res.json({ message: "Eliminato" });
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

// --- INGREDIENTI ---
app.get('/ingredienti', async (req, res) => {
    try {
        const elenco = await Ingrediente.tutti();
        res.json(elenco);
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

app.post('/ingredienti', async (req, res) => {
    const { nome, prezzo_extra, immagine_url, disponibile } = req.body;
    try {
        const nuovo = await Ingrediente.aggiungi(nome, prezzo_extra, immagine_url, disponibile);
        res.status(201).json(nuovo);
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

app.put('/ingredienti/:id', async (req, res) => {
    const { nome, prezzo_extra, immagine_url, disponibile } = req.body;
    try {
        const aggiornato = await Ingrediente.modifica(req.params.id, nome, prezzo_extra, immagine_url, disponibile);
        res.json(aggiornato);
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});

app.delete('/ingredienti/:id', async (req, res) => {
    try {
        await Ingrediente.elimina(req.params.id);
        res.json({ message: "Eliminato" });
    } catch (err) {
        res.status(500).json({ error: "Errore" });
    }
});



app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});
