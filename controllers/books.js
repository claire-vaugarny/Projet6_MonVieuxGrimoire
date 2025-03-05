const Book = require('../models/book');
const fs = require('fs');

// // // // méthodes GET (3)
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

// // // méthodes POST (2)
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        ImageURL: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        ratings: [], // Le tableau ratings est vide au départ
    });

    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error }));
}

exports.newRatingBook = (req, res, next) => {
    // Récupérer l'ID du livre et la note de la requête
    const { bookId, userId, rating } = req.body;

    // Trouver le livre par son ID
    Book.findOne({ _id: bookId })
        .then(book => {
            //vérification du livre dans la base de donnée.
            if (!book) { 
                return res.status(404).json({ message: 'Livre non trouvé.' });
            } else {
                //vérification de l'authentificaiton du l'utilisateur
                if (book.userId != req.auth.userId) { 
                    res.status(401).json({ message: 'Non authorisé' });
                } else {
                    // vérification si l'utilisateur a déjà noté ce livre
                    if (book.ratings.some(rating => rating.userId.toString() === userId.toString())) { 
                        return res.status(400).json({ message: 'Cet utilisateur a déjà noté ce livre.' });
                    } else {
                        // Ajouter la nouvelle note à la liste des notes du livre
                        book.ratings.push({ userId, rating });

                        // Calculer la nouvelle moyenne des notes
                        const totalRatings = book.ratings.reduce((sum, current) => sum + current.rating, 0);
                        const averageRating = totalRatings / book.ratings.length;

                        // Mettre à jour le livre avec la nouvelle moyenne de note
                        book.averageRating = averageRating;

                        // Sauvegarder les modifications
                        book.save()
                            .then(updatedBook => {
                                res.status(200).json({ message: 'Note ajoutée avec succès', book: updatedBook });
                            })
                            .catch(error => {
                                res.status(500).json({ message: 'Erreur lors de l\'ajout de la note.', error });
                            });
                    }
                }
            }
        })
        .catch(error => { res.status(500).json({ message: error }) })
}

// // // méthode PUT (1)
exports.modifyBook = (req, res, next) => {
    const thingObject = req.file ? {
        ...JSON.parse(req.body.book),
        ImageURL: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    delete thingObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch(error => res.status(404).json({ error }));
}

// // // méthode DELETE (1)
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};