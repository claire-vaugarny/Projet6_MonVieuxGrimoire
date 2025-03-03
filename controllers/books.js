const Book = require('../models/book');

// // // // méthodes GET
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
}

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
}

exports.bestRatingBooks = (req, res, next) => {
    Book.find()
    .sort({ averageRating: -1 })  // Trie par la note moyenne en décroissant
    .limit(3)  // Limite à 3 résultats
    .then(books => res.status(200).json(books))  // Retourne les 3 meilleurs livres
    .catch(error => res.status(400).json({ error }));
}