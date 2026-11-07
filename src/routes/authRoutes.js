const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');


/****************************************************************************** 
/ Configuração do Rate Limit para a rota de reset de senha.
/ Opções:
/ -Janela de tempo: 15 minutos (em milissegundos)
/ -Limite máximo: Cada IP pode fazer no máximo 3 requisições por janela
/ -Retorna os headers informativos de limite (RateLimit-*)
/ -Desativa os headers antigos (X-RateLimit-*)
******************************************************************************/
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    legacyHeaders: false,
    standardHeaders: true,
    message: {
        success: false,
        messageEn: 'Too many requests from this address. Please wait 15 minutes before trying again.',
        messagePt: 'Muitas solicitações feitas a partir deste endereço. Por favor, aguarde 15 minutos antes de tentar novamente.'
    }
});


// Rotas de autenticação do site
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', forgotPasswordLimiter, authController.resetPassword);
router.get('/logout', authController.logout);


module.exports = router;