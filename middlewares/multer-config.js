// middleware/multerUpload.js
const multer = require('multer');

// Utilisation de memoryStorage pour accéder au buffer de l'image
const storage = multer.memoryStorage();

module.exports = multer({ storage }).single('image');
