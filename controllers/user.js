const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// // // // méthodes POST (2)

exports.signup = (req, res, next) => {
    // Vérification que la requête est bien au format JSON
    if (!req.is('application/json')) {
        return res.status(400).json({ message: "Erreur interne : requête invalide" });
    };
    //vérification que l'email est au bon format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ message: 'Email invalide' });
    };
    //vérification que le mot de passe est bien une chaîne de caractères
    if (typeof req.body.password !== "string") {
        return res.status(400).json({ message: "Le mot de passe doit être une chaîne de caractères" });
    }


    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    // Vérification que la requête est bien au format JSON
    if (!req.is('application/json')) {
        return res.status(400).json({ message: "Erreur interne : requête invalide" });
    };
    //vérification que l'email est au bon format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ message: 'Email invalide' });
    };
    //vérification que le mot de passe est bien une chaîne de caractères
    if (typeof req.body.password !== "string") {
        return res.status(400).json({ message: "Le mot de passe doit être une chaîne de caractères" });
    }


    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id }, //payload
                            'a3f1c2d9e6b74f85a9d0e3c4b5f6721a',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}
