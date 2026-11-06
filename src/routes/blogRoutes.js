const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const commentsController = require('../controllers/commentsController');


// Rotas com método GET
router.get('/', blogController.renderHomePage);
router.get('/sobre', blogController.renderAboutPage);
router.get('/contato', blogController.renderContactPage);

router.get('/cadastrar', blogController.renderRegisterPage);
router.get('/login', blogController.renderLoginPage);
router.get('/recuperar-senha', blogController.renderForgotPasswordPage);
router.get('/alterar-senha', blogController.renderResetPasswordPage);

router.get('/posts', blogController.renderPostsPage);
router.get('/posts/:categorySlug', blogController.renderCategoryPage);
router.get('/posts/:categorySlug/:postSlug', blogController.renderPostBySlugs);


// Rotas com método POST
router.post('/posts/:categorySlug/:postSlug/comments', commentsController.postComment);


module.exports = router;