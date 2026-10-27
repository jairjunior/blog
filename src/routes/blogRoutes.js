const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');


router.get('/', blogController.renderHomePage);
router.get('/login', blogController.getLoginPage)
router.get('/posts', blogController.renderPostsPage);
router.get('/posts/:categorySlug', blogController.renderCategoryPage);
router.get('/posts/:categorySlug/:postSlug', blogController.renderPostBySlugs);
router.post('/posts/:categorySlug/:postSlug/comments', blogController.postComment);


module.exports = router;