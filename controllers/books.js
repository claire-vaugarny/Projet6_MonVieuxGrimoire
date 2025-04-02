const Book = require('../models/book');
const fs = require('fs');

// // // // méthodes GET (3)
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
}

exports.getOneBook = (req, res, next) => {
    // Vérification que l'ID n'est pas null, undefined ou une chaîne vide
    if (!req.params.id) {
        return res.status(404).json({ message: "Livre non trouvé : ID invalide" });
    }

    // Recherche du livre dans la base de données
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                // Si aucun livre n'est trouvé, renvoyer une erreur 404
                return res.status(404).json({ message: "Livre non trouvé" });
            }
            // Si le livre est trouvé, renvoyer les informations
            res.status(200).json(book);
        })
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
    // Vérification que le body de la requête est au format JSON
    if (!req.is('application/json')) {
        return res.status(400).json({ message: "Erreur interne : requête invalide" });
    };

    let bookObject;
    try {
        // Tentative de parsing du corps de la requête pour vérifier le format JSON c'est à dire que l'on n'a pas {] par exemple
        bookObject = JSON.parse(req.body.book);
    } catch (error) {
        return res.status(400).json({ message: "Erreur interne : requête invalide" });
    }

    //vérification que le tableau ratings ne contient qu'un seul avis
    if (bookObject.ratings.length !== 1) {
        return res.status(400).json({ message: "Erreur interne : requête invalide" });
    }
    //vérification que la note est un entier entre 0 et 5 inclus
    if (!Number.isInteger(bookObject.ratings[0].grade) || bookObject.ratings[0].grade < 0 || bookObject.ratings[0].grade > 5) {
        return res.status(400).json({ message: "Erreur interne : requête invalide" });
    };

    // Création de l'objet Book avec les données validées
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId, // Remplacement du userId par celui validé par l'authentification
        ratings: [{
            userId: req.auth.userId,
            grade: bookObject.ratings[0].grade
        }],
        averageRating: bookObject.ratings[0].grade, // Ici, la note de ce premier avis devient la moyenne
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
    const userId = req.auth.userId;
    const rating = req.body.rating;

    //vérification que la note est un entier entre 0 et 5 inclus
    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
        return res.status(400).json({ message: "Erreur interne : requête invalide" });
    };

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
    // Vérification du format de la requête uniquement si aucune image n'est envoyée
    if (!req.file && !req.is('application/json')) {
        return res.status(400).json({ message: "Erreur interne : requête invalide" });
    }
    let bookObject;
    try {
        // Si une image est envoyée, on parse le JSON et on ajoute l'URL de l'image
        bookObject = req.file ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    } catch (error) {
        // Si le parsing échoue, on renvoie une erreur
        return res.status(400).json({ message: "Erreur interne : requête invalide" });
    }

    delete bookObject.userId;
    delete bookObject.ratings;
    delete bookObject.averageRating;

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
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
            } else {

                // Vérification si l'utilisateur est bien celui qui a créé le livre
                if (book.userId.toString() !== req.auth.userId.toString()) {
                    return res.status(403).json({ message: 'Non autorisé' });
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
