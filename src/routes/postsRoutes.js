const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/', authMiddleware, postsController.createPost);


module.exports = router;