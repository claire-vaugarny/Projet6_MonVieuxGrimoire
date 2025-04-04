const mongoose = require('mongoose');
const express = require('express');
const app = express();
const config = require('./config').get(process.env.MONGODB_URI)

const authRoutes = require('./routes/user');
const booksRoutes = require('./routes/books');
const path = require('path');

mongoose.connect(config.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connexion à MongoDB réussie !');
    // Le serveur ne démarre que si la connexion à MongoDB est réussie
    const server = require('./server'); // Appel à server.js pour démarrer le serveur
  })
  .catch((error) => {
    console.error('Erreur de connexion MongoDB : ', error);
    process.exit(1); // Quitter si la connexion échoue
  });

app.use(express.json());

// Configuration CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/images', express.static(path.join(__dirname, 'images'))); //pour les fichiers statiques comme les images

module.exports = app;
