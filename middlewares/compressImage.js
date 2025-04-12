// middleware/compressImage.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png'
};

module.exports = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier à traiter.' });
    }

    const mimeType = req.file.mimetype.toLowerCase();
    const extension = MIME_TYPES[mimeType];

    if (!extension) {
        return res.status(400).json({ message: 'Type de fichier non autorisé.' });
    }

    try {
        // Nom de fichier propre
        const originalName = req.file.originalname.split(' ').join('_');
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9_-]/g, '_').split('.')[0];
        const fileName = `${sanitizedName}_${Date.now()}.${extension}`;
        const outputPath = path.join('images', fileName);

        // Compression selon format
        let sharpInstance = sharp(req.file.buffer);
        if (extension === 'jpeg' || extension === 'jpg') {
            sharpInstance = sharpInstance.jpeg({ quality: 80 });
        } else if (extension === 'png') {
            sharpInstance = sharpInstance.png({ compressionLevel: 9 });
        }

        await sharpInstance.toFile(outputPath);

        // Injecter le nom du fichier pour l'étape suivante (ex: contrôleur ou DB)
        req.file.filename = fileName;

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Erreur lors du traitement de l\'image.', error });
    }
};
