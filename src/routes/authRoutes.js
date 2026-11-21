const express = require('express');
const router = express.Router();
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const authController = require('../controllers/authController');
const { printRateLimitBlock } = require('../utils/logger');


/******************************************************************************
/ Configuração do Rate Limit para as rotas de autenticação.
/ Opções:
/ -Janela de tempo: XX minutos (em milissegundos)
/ -Limite máximo: Cada IP pode fazer no máximo XX requisições por janela
/ -Retorna os headers informativos de limite (RateLimit-*)
/ -Desativa os headers antigos (X-RateLimit-*)
/ -Ignora requisições bem sucedidas (status < 400)
/*****************************************************************************/
// Cadastro Novo Usuário = 3 requisições a cada 1 hora (para cada IP)
/*****************************************************************************/
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    legacyHeaders: false,
    standardHeaders: true,
    skipSuccessfulRequests: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip, 56),
    handler: (req, res, _, options) => {
        const email = req.body.email || 'Unknown email';
        const clientIp = ipKeyGenerator(req.ip, 56);
        printRateLimitBlock(email, clientIp, req.originalUrl);

        options.standardHeaders ? res.setHeader('Retry-After', options.windowMs / 1000) : null;
        res.status(options.statusCode).send(options.message);
    },
    message: {
        success: false,
        messageEn: `You have made too many register attempts.\n
            Please wait 1 hour before trying again.`,
        messagePt: `Você realizou muitas tentativas de cadastro.
            Aguarde 1 hora para tentar novamente.`
    }
});


/*****************************************************************************/
// Login = 5 requisições a cada 10 minutos (para cada IP + email)
/*****************************************************************************/
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    legacyHeaders: false,
    standardHeaders: true,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        const email = req.body.email ? req.body.email.toLowerCase().trim() : '';
        const clientIp = ipKeyGenerator(req.ip, 56);
        return `${clientIp}-${email}`;
    },
    handler: (req, res, _, options) => {
        const email = req.body.email || 'Unknown email';
        const clientIp = ipKeyGenerator(req.ip, 56);
        printRateLimitBlock(email, clientIp, req.originalUrl);

        options.standardHeaders ? res.setHeader('Retry-After', options.windowMs / 1000) : null;
        res.status(options.statusCode).send(options.message);
    },
    message: {
        success: false,
        messageEn: `You have made too many unsuccessful login attempts.\n
            Please wait 10 minutes before trying again, or reset your password.`,
        messagePt: `Você realizou muitas tentativas de login sem sucesso.\n
            Aguarde 10 minutos para tentar novamente ou faça o reset da sua senha.`
    }
});


/*****************************************************************************/
// Esqueceu a Senha = 1 requisição a cada 10 minutos (para cada IP + email)
/*****************************************************************************/
const forgotPasswordLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 1,
    legacyHeaders: false,
    standardHeaders: true,
    keyGenerator: (req) => {
        const email = req.body.email ? req.body.email.toLowerCase().trim() : '';
        const clientIp = ipKeyGenerator(req.ip, 56);
        return `${clientIp}-${email}`;
    },
    handler: (req, res, _, options) => {
        const email = req.body.email || 'Unknown email';
        const clientIp = ipKeyGenerator(req.ip, 56);
        printRateLimitBlock(email, clientIp, req.originalUrl);

        options.standardHeaders ? res.setHeader('Retry-After', options.windowMs / 1000) : null;
        res.status(options.statusCode).send(options.message);
    },
    message: {
        success: false,
        messageEn: `You can only submit a password recovery request once every 5 minutes.\n
            Don't forget to check your spam folder.`,
        messagePt: `Você só pode realizar uma solicitação de recuperação de senha a cada 5 minutos.\n
            Antes de repetir, verifique a sua caixa de entrada e também a caixa de spam (lixo eletrônico).`
    }
});


/*****************************************************************************/
// Resetar Senha = 3 requisição a cada 15 minutos
/*****************************************************************************/
const genericAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    legacyHeaders: false,
    standardHeaders: true,
    handler: (req, res, _, options) => {
        const email = req.body.email || 'Unknown email';
        const clientIp = ipKeyGenerator(req.ip, 56);
        printRateLimitBlock(email, clientIp, req.originalUrl);

        options.standardHeaders ? res.setHeader('Retry-After', options.windowMs / 1000) : null;
        res.status(options.statusCode).send(options.message);
    },
    message: {
        success: false,
        messageEn: `Too many requests from this address.\n
            Please wait 15 minutes before trying again.`,
        messagePt: `Muitas solicitações feitas a partir deste endereço.\n
            Por favor, aguarde 15 minutos antes de tentar novamente.`
    }
});


/*****************************************************************************/
// Rotas de autenticação do site
/*****************************************************************************/
router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', genericAuthLimiter, authController.resetPassword);
router.get('/logout', authController.logout);


module.exports = router;