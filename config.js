require('dotenv').config();

const config = {
    default : {
        MONGODB_URI : process.env.MONGODB_URI
    }
}

exports.get = function get (env){
    return config.default;
}
