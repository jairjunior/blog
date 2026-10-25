const express = require('express');
const router = express.Router();


// Rotas da API
router.use('/api/auth', require('./authRoutes.js'));
router.use('/api/users', require('./usersRoutes.js'));
router.use('/api/posts', require('./postsRoutes.js'));
router.use('/api/comments', require('./commentsRoutes.js'));


// Rotas do Blog
router.use('/', require('./blogRoutes.js'));


module.exports = router;