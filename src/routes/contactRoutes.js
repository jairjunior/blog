const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');


// Trata o envio dos dados do formulário de contato
router.post('/', contactController.sendContactMessage);


module.exports = router;