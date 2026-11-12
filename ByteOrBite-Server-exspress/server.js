const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('./models/userModel');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const baseUploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(baseUploadsDir)) {
    fs.mkdirSync(baseUploadsDir);
}

const categorie = ['panini', 'bibite', 'patatine', 'menu', 'ingredienti', 'altri'];
categorie.forEach(cat => {
    const dir = path.join(baseUploadsDir, cat);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

app.use('/uploads', express.static(baseUploadsDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const categoria = req.query.categoria || 'altri';
        const dest = path.join(__dirname, 'uploads', categoria);
        
        if (!fs.existsSync(dest)){
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('immagine'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Nessun file caricato." });
    }
    const categoria = req.query.categoria || 'altri';
    const filePath = `uploads/${categoria}/${req.file.filename}`;
    res.json({ url: filePath });
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email e password sono obbligatorie." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

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

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Credenziali non valide." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.json({ message: "Login effettuato", user: { id: user.id, name: user.name, email: user.email, points: user.points, role: user.role, location: user.location } });
        } else {
            res.status(401).json({ error: "Credenziali non valide." });
        }
    } catch (error) {
        console.error("Errore durante il login:", error.message);
        res.status(500).json({ error: "Errore interno del server." });
    }
});

function generateRandomPassword(length = 8) {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const all = upper + lower + numbers;

    let pwd = '';
    pwd += upper.charAt(Math.floor(Math.random() * upper.length));
    pwd += lower.charAt(Math.floor(Math.random() * lower.length));
    pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));

    for (let i = 3; i < length; i++) {
        pwd += all.charAt(Math.floor(Math.random() * all.length));
    }

    return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

app.post('/reset-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "L'indirizzo email è obbligatorio." });
    }

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "Nessun account trovato con questa email." });
        }

        const newPassword = generateRandomPassword(8);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.update(user.id, { password: hashedPassword });

        console.log(`[RECUPERO PASSWORD] Nuova password generata per ${email}: ${newPassword}`);
        res.json({
            message: "Password recuperata con successo!",
            newPassword: newPassword
        });
    } catch (error) {
        console.error("Errore durante il recupero password:", error.message);
        res.status(500).json({ error: "Errore interno durante il recupero della password." });
    }
});

app.post('/users/:id/verify', async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "Utente non trovato" });

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.json({ message: "Password verificata" });
        } else {
            res.status(401).json({ error: "Password attuale non corretta" });
        }
    } catch (err) {
        res.status(500).json({ error: "Errore durante la verifica" });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const { oldPassword, ...updateData } = req.body;
        
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const aggiornato = await User.update(req.params.id, updateData);
        
        const { password, ...userWithoutPassword } = aggiornato;
        res.json({ message: "Utente aggiornato", user: userWithoutPassword });
    } catch (err) {
        console.error("Errore aggiornamento utente:", err.message);
        res.status(500).json({ error: "Errore nell'aggiornamento dell'utente" });
    }
});

const Panino = require('./models/paniniModel');
const Bibita = require('./models/bibiteModel');
const Patatine = require('./models/patatineModel');
const Menu = require('./models/menuModel');
const Ingrediente = require('./models/ingredientiModel');
const Ordine = require('./models/ordineModel');
const Carrello = require('./models/carrelloModel');

app.get('/carrello/utente/:id', async (req, res) => {
    try {
        const elenco = await Carrello.getByUserId(req.params.id);
        res.json(elenco);
    } catch (err) {
        res.status(500).json({ error: "Errore nel recupero del carrello" });
    }
});

app.post('/carrello', async (req, res) => {
    try {
        const nuovo = await Carrello.addItem(req.body);
        res.status(201).json(nuovo);
    } catch (err) {
        res.status(500).json({ error: "Errore nell'aggiunta al carrello" });
    }
});

app.put('/carrello/:id', async (req, res) => {
    try {
        const { quantita } = req.body;
        const aggiornato = await Carrello.updateQuantity(req.params.id, quantita);
        res.json(aggiornato);
    } catch (err) {
        res.status(500).json({ error: "Errore nell'aggiornamento del carrello" });
    }
});

app.delete('/carrello/:id', async (req, res) => {
    try {
        await Carrello.removeItem(req.params.id);
        res.json({ message: "Elemento rimosso dal carrello" });
    } catch (err) {
        res.status(500).json({ error: "Errore nell'eliminazione dal carrello" });
    }
});

app.delete('/carrello/utente/:id', async (req, res) => {
    try {
        await Carrello.clearByUserId(req.params.id);
        res.json({ message: "Carrello svuotato" });
    } catch (err) {
        res.status(500).json({ error: "Errore nello svuotamento del carrello" });
    }
});

app.get('/ordini', async (req, res) => {
    try {
        const elenco = await Ordine.getAll();
        res.json(elenco);
    } catch (err) {
        res.status(500).json({ error: "Errore nel recupero degli ordini" });
    }
});

app.get('/ordini/utente/:id', async (req, res) => {
    try {
        const elenco = await Ordine.getByUserId(req.params.id);
        res.json(elenco);
    } catch (err) {
        res.status(500).json({ error: "Errore nel recupero degli ordini dell'utente" });
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
        
        const isDisponibile = disponibile === 1 || disponibile === true || disponibile === 'true' || disponibile === '1';
        if (!isDisponibile) {
            await Menu.impostaNonDisponibilePerPanino(req.params.id);
        }

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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server avviato su 0.0.0.0:${PORT} (accessibile da tutta la rete locale)`);
});
