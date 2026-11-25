const express = require('express');
const router = express.Router();
const viewsController = require('../controllers/viewsController');
const commentsController = require('../controllers/commentsController');


// Rotas com método GET
router.get('/', viewsController.renderHomePage);
router.get('/sobre', viewsController.renderAboutPage);
router.get('/contato', viewsController.renderContactPage);

router.get('/cadastrar', viewsController.renderRegisterPage);
router.get('/login', viewsController.renderLoginPage);
router.get('/recuperar-senha', viewsController.renderForgotPasswordPage);
router.get('/alterar-senha', viewsController.renderResetPasswordPage);
router.get('/informacoes-para-verificar-conta', viewsController.renderAccountVerifyInformationPage);
router.get('/verificar-conta', viewsController.renderAccountVerifyPage);

router.get('/artigos', viewsController.renderArticlesPage);
router.get('/artigos/:categorySlug', viewsController.renderCategoryPage);
router.get('/artigos/:categorySlug/:articleSlug', viewsController.renderArticleBySlugs);


// Rotas com método POST
router.post('/artigos/:categorySlug/:articleSlug/comments', commentsController.postComment);


module.exports = router;