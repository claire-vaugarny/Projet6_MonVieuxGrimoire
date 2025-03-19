require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; //on récupère le token depuis "Bearer token"
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET); //clé secrète dans le fichier .env
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next()
    } catch (error) {
        res.status(401).json({ error });
    }
};