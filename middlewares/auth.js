const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    try{
        const token = req.headers.authorization.split(' ')[1]; //on récupère le token depuis "Bearer token"
        const decodedToken = jwt.verify(token, 'a3f1c2d9e6b74f85a9d0e3c4b5f6721a'); //clé secrète
        const userId= decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next()
    }catch(error){
        res.status(401).json({error});
    }
};