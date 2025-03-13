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
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });

    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error }));
}

// Fonction pour calculer la moyenne des évaluations
function calculateAverageRating(ratings) {
    const total = ratings.reduce((acc, rating) => acc + rating.grade, 0);
    return total / ratings.length;
}
exports.newRatingBook = (req, res, next) => {
    const { userId, rating } = req.body;
    const bookId = String(req.params.id); // L'ID du livre est récupéré à partir de l'URL

    Book.findOne({ _id: bookId })
        .then(book => {
            //vérification du livre dans la base de donnée.
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé.' });
            } else {
                // vérification si l'utilisateur a déjà noté ce livre
                if (book.ratings.some(rating => rating.userId.toString() === userId.toString())) {
                    return res.status(400).json({ message: 'Cet utilisateur a déjà noté ce livre.' });
                } else {
                    // Ajouter la nouvelle note à la liste des notes du livre
                    const newRating = { userId, grade: rating };
                    book.ratings.push(newRating);

                    //mise a jour de l'évaluation moyenne
                    book.averageRating = calculateAverageRating(book.ratings);

                    // Sauvegarde les modifications
                    book.save()
                        .then(updatedBook => {
                            res.status(200).json({ message: 'Note ajoutée avec succès', book: updatedBook });
                        })
                        .catch(error => {
                            res.status(500).json({ message: 'Erreur lors de l\'ajout de la note.', error });
                        });
                }
            }
        })
        .catch(error => { res.status(500).json({ message: error }) })
}

// // // méthode PUT (1)
exports.modifyBook = (req, res, next) => {
    const thingObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
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
    // Récupérer l'ID du livre
    const bookId = req.params.id;
    // Trouver le livre dans la base de données
    Book.findOne({ _id: bookId })
        .then(book => {
            // Si le livre n'existe pas
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé.' });
            }else{

                // Vérification si l'utilisateur est bien celui qui a créé le livre
                if (book.userId.toString() !== req.auth.userId.toString()) {
                    return res.status(401).json({ message: 'Non autorisé' });
                }
                // Récupérer le nom du fichier image pour le supprimer
                const filename = book.imageUrl.split('/images/')[1];
                // Supprimer le fichier image associé au livre
                fs.unlink(`images/${filename}`, (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Erreur lors de la suppression de l\'image.', error: err });
                    }
                    
                    // Supprimer le livre de la base de données
                    book.deleteOne()
                    .then(() => {
                        res.status(200).json({ message: 'Livre supprimé avec succès.' });
                    })
                    .catch(error => {
                        res.status(500).json({ message: 'Erreur lors de la suppression du livre.', error });
                    });
                });
            }
        })
        .catch(error => {
            res.status(500).json({ message: 'Erreur lors de la recherche du livre.', error });
        });
};
