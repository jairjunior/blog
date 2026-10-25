const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/', authMiddleware, usersController.getAllUsers);
router.get('/profile', authMiddleware, usersController.getProfile);
router.get('/:id', authMiddleware, usersController.getUserById);
router.put('/:id', authMiddleware, usersController.updateUser);


module.exports = router;