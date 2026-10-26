const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');


router.get('/', usersController.getAllUsers);
router.get('/profile', usersController.getProfile);
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);


module.exports = router;