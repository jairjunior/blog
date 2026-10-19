const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ 
        author: 'Jair Junior',
        message: 'Welcome to the Blog Comments'
    });
});


module.exports = router;