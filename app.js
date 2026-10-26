const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const authMiddleware = require('./src/middlewares/authMiddleware');
require('dotenv').config();


const app = express();


// Configurações do Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(authMiddleware);


// Rotas da aplicação
const routes = require('./src/routes');
app.use('/', routes);


// Inicia o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});