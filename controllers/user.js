const User = require('../models/user');
const bcrypt = require('bcrypt');

// // // // méthodes POST
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) //crypte le mdp
        .then(hash => { //créer un nouveau user avec l'email de req et le mdp crypté
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save() //pour enregistrer le user dans la base de données (BDD)
                .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOnde({ email: req.body.email }) //cherche si l'utilisateur est déjà présent dans la BDD
        .then(user => {
            if (user === null) { //si l'utilisateur n'est pas trouvé
                res.status(401).json({ message: 'Paire identifiant/mot de passe incorrect' }) //message volontairement flou pour ne pas dire au client = fuite de donnée, et évite de savoir pour une autre personne si une personne est déjà inscrite chez nous
            } else {//si l'utilisateur est trouvé
                bcrypt.compare(req.body.password, user.password)//compare mdp de la BDD avec celui qui nous a été transmis
                    .then(valid => {
                        if (!valid) {//si le mdp ne correspond pas, on renvoie le même message
                            res.status(401).json({ message: 'Paire identifiant/mot de passe incorrect' })
                        } else {//si le mdp est correct
                            res.status(200).json({
                                userId: user._id,
                                token: 'TOKEN'
                            });
                        }
                    })
                    .catch(error => res.status(500).json({ error }));//erreur de traitement
            }
        })
        .catch(error => res.status(500).json({ error }))
};
