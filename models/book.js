const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, //email utilisateur unique qui a créé le livre
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },

    ratings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }, //email utilisateur qui a noté le livre
        grade: { type: Number, required: true },
    }],

    averageRating: { type: Number, default: 0 }, //par défaut la valeur est 0, s'il n'y a aucune note
});

module.exports = mongoose.model('Book', bookSchema);