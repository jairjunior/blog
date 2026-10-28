const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.locals.isLoggedIn = false;
        res.locals.tokenExpired = null;
        res.locals.currentUser = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.isLoggedIn = true;
        res.locals.tokenExpired = false;
        res.locals.currentUser = decoded;

    } catch (error) {
        res.locals.isLoggedIn = false;
        res.locals.currentUser = null;
        if (error.message === 'jwt expired') {
            res.locals.tokenExpired = true;
        } else {
            res.locals.tokenExpired = null;
            console.error('ERROR in authMiddleware:\n', error);
        }
    }
    
    next();

}