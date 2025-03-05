const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

const booksCtrl = require('../controllers/books')

router.get('/', booksCtrl.getAllBooks);
router.get('/:id', booksCtrl.getOneBook);
router.get('/bestrating', booksCtrl.bestRatingBooks);
router.post('/', auth, multer, booksCtrl.createBook);
router.post('/:id/rating', auth, multer, booksCtrl.newRatingBook);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, multer, booksCtrl.deleteBook);

module.exports = router;