const express = require('express');
const router = express.Router();

const booksCtrl = require('../controllers/books')

router.get('/', booksCtrl.getAllBooks);
router.get('/:id', booksCtrl.getOneBook);
router.get('/bestrating', booksCtrl.bestRatingBooks);

module.exports = router;




// router.post('/', (req, res, next) => {
//     delete req.body._id;
//     const book = new Book({
//         ...req.body
//     });
//     book.save()
//         .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
//         .catch(error => res.status(400).json({ error }));
// });

// router.put('/:id', (req, res, next) => {
//     Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
//         .then(() => res.status(200).json({ message: 'Objet modifié !' }))
//         .catch(error => res.status(400).json({ error }));
// });

// router.delete('/:id', (req, res, next) => {
//     Book.deleteOne({ _id: req.params.id })
//         .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
//         .catch(error => res.status(400).json({ error }));
// });


