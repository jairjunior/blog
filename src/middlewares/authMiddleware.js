const jwt = require('jsonwebtoken');
require('dotenv').config();
const { printConsoleError, printConsoleWarning } = require('../utils/logger');

module.exports = (req, res, next) => {
    const authToken = req.cookies.authToken ? req.cookies.authToken : null;

    // Se o usuário não possuir o cookie com o authToken, então não está logado
    if (!authToken) {
        res.locals.currentUser = null;
        res.locals.tokenFailure = null;
        return next();
    }

    // Decodifica o Token JWT de Autenticação (authToken) e coloca 
    // os dados do usuário na variável 'res.locals.currentUser'
    try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        res.locals.currentUser = decoded;
        res.locals.tokenFailure = false;

    // Se der erro, verifica se o token está expirado e imprime 
    // mensagem correspondente no console
    } catch (error) {
        printConsoleError(error);
        res.locals.currentUser = null;
        res.locals.tokenFailure = true;
    }
    
    next();

}