const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const compressImage = require('../middlewares/compressImage')

const booksCtrl = require('../controllers/books')

router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.bestRatingBooks); //route statique avant la route dynamique
router.get('/:id', booksCtrl.getOneBook);

router.post('/', auth, multer, compressImage, booksCtrl.createBook);
router.post('/:id/rating', auth, booksCtrl.newRatingBook); //pas de fichier lors de l'ajout d'une évaluatioin
router.put('/:id', auth, multer, compressImage, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook); //pas de fichier non plus

module.exports = router;