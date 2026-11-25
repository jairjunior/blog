const express = require('express');
const router = express.Router();
const articlesController = require('../controllers/articlesController');


router.post('/', articlesController.createArticle);


module.exports = router;