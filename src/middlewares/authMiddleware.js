const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        res.locals.isLoggedIn = false;
        res.locals.currentUser = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.isLoggedIn = true;
        res.locals.currentUser = decoded;
        console.log('Usuário logado!')
    } catch (error) {
        console.error('ERROR in authMiddleware: ', error);
        res.locals.isLoggedIn = false;
        res.locals.currentUser = null;
    }
    
    next();

}