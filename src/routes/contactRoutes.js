const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const rateLimit = require('express-rate-limit');



/****************************************************************************** 
/ Configuração do Rate Limit para a rota de contato.
/ Opções:
/ -Janela de tempo: 15 minutos (em milissegundos)
/ -Limite máximo: Cada IP pode fazer no máximo 5 requisições por janela
/ -Retorna os headers informativos de limite (RateLimit-*)
/ -Desativa os headers antigos (X-RateLimit-*)
******************************************************************************/
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 3,
    legacyHeaders: false,
    standardHeaders: true,
    message: {
        success: false,
        messageEn: 'Too many messages sent from this IP. Please try again after 15 minutes.',
        messagePt: 'Muitas mensagens enviadas a partir deste endereço IP. Por favor, tente novamente após 15 minutos.'
    }
});



// Trata o envio dos dados do formulário de contato
router.post('/', contactLimiter, contactController.sendContactMessage);


module.exports = router;