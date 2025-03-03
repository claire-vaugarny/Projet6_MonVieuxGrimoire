const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
userID: {type: String, required: true}, //email utilisateur unique
title: { type: String, required: true },
author: { type: String, required: true },
imageURL: { type: String, required: true },
year: { type: Number, required: true },
genre: { type: String, required: true },

ratings: [{
    userID: {type: String, required: true}, //email utilisateur qui a noté le livre
    grade: { type: Number, required: true }, 
}],
averageRating: { type: Number, required: true },
});

module.exports = mongoose.model('Book', bookSchema);



// averageRating: { 
//     type: Number, 
//     default: 0, // par défaut à 0 si aucune note
//   }