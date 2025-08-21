/*
    ts is ai generated
    let's raid the ai code
*/

const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;

// Setup uploads folder
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowed = /\.(png|jpe?g|gif|webp)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true); // accept file
    } else {
      cb(new Error('unsupported image format'));
    }
  }
});

fs.ensureDirSync('uploads');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));


// Load and save DB
const DB_FILE = 'db.json';
function loadDB() {
    return fs.readJsonSync(DB_FILE);
}
function saveDB(data) {
    fs.writeJsonSync(DB_FILE, data, { spaces: 2 });
}

// Routes

// List all threads
app.get('/threads', (req, res) => {
    const db = loadDB();
    res.json(db.threads);
});

// Get a single thread
app.get('/thread/:id', (req, res) => {
    const db = loadDB();
    const thread = db.threads.find(t => t.id === req.params.id);
    if (!thread) return res.status(404).send('Thread not found');
    res.json(thread);
});

// Create a thread
app.post('/thread', upload.single('image'), (req, res) => {
    const db = loadDB();
    const thread = {
        id: Date.now().toString(),
        title: req.body.title || "Untitled",
        content: req.body.content || "",
        image: req.file ? `/uploads/${req.file.filename}` : null,
        createdAt: new Date().toISOString(),
        replies: []
    };
    db.threads.push(thread);
    saveDB(db);
    res.json(thread);
});

// Reply to a thread
app.post('/reply/:id', upload.single('image'), (req, res) => {
    const db = loadDB();
    const thread = db.threads.find(t => t.id === req.params.id);
    if (!thread) return res.status(404).send('Thread not found');

    const reply = {
        id: Date.now().toString(),
        content: req.body.content || "",
        image: req.file ? `/uploads/${req.file.filename}` : null,
        createdAt: new Date().toISOString()
    };

    thread.replies.push(reply);
    saveDB(db);
    res.json(reply);
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`http://127.0.0.1:${PORT}`);
});
