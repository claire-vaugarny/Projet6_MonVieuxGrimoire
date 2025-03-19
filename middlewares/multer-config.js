const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png'
};

// Définition de la configuration du stockage avec multer
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },

    filename: (req, file, callback) => {
        // Vérification du type MIME du fichier
        const fileExtension  = MIME_TYPES[file.mimetype.toLowerCase()];
        if (!fileExtension) {
            return callback(new Error('Type de fichier non autorisé'), null);
        }
        // Création du nom du fichier
        const name = file.originalname.split(' ').join('_'); // Remplace les espaces par des underscores
        const sanitizedFileName = name.replace(/[^a-zA-Z0-9_-]/g, ''); // Supprime les caractères spéciaux
        callback(null, sanitizedFileName + Date.now() + '.' + fileExtension);
    }
});

module.exports = multer({ storage: storage }).single('image');