const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const commentsController = require('../controllers/commentsController');


router.get('/', blogController.renderHomePage);
router.get('/login', blogController.getLoginPage)
router.get('/posts', blogController.renderPostsPage);
router.get('/posts/:categorySlug', blogController.renderCategoryPage);
router.get('/posts/:categorySlug/:postSlug', blogController.renderPostBySlugs);
router.post('/posts/:categorySlug/:postSlug/comments', commentsController.postComment);


module.exports = router;