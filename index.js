const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();


const app = express();


// Configurações do Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));


// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// Rotas da aplicação
const routes = require('./src/routes');
app.use('/', routes);


// Inicia o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});