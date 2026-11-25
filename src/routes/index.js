const express = require('express');
const router = express.Router();


// Rotas da API
router.use('/api/auth', require('./authRoutes.js'));
router.use('/api/users', require('./usersRoutes.js'));
router.use('/api/articles', require('./articlesRoutes.js'));
router.use('/api/comments', require('./commentsRoutes.js'));
router.use('/api/contact', require('./contactRoutes.js'));


// Rota para renderizar as views das páginas com  EJS
router.use('/', require('./viewsRoutes.js'));


module.exports = router;