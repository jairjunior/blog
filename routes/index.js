const express = require('express');
const router = express.Router();

router.use('/posts', require('./posts.js'));
router.use('/comments', require('./comments.js'));

module.exports = router;