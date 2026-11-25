const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const authMiddleware = require('./src/middlewares/authMiddleware');
require('dotenv').config();


// Verifica se a variável de ambiente JWT_SECRET existe, pois ela será utilizada 
// pela parte de autenticação da aplicação.
// Se estiver ausente ou vazia, derruba a aplicação.
if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    printConsoleError(
        'CONFIG_ERROR_MISSING_JWT_SECRET',
        new Error('Variável de ambiente JWT_SECRET não definida ou vazia.')
    );
    process.exit(1);
}


// Inicializa o framework Express
const app = express();


// Configurações do Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('trust proxy', 1);


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Ignora a requisição automática do Chrome DevTools
app.use('/.well-known/appspecific/com.chrome.devtools.json', (_, res) => {
    res.status(204).end(); // HTTP 204 No Content
});

// Intercepta o favicon antes do authMiddleware
app.get('/favicon.ico', (_, res) => res.status(204).end()); // HTTP 204 No Content

// Meu middleware de autenticação de usuários
app.use(authMiddleware);


// Rotas da aplicação
const routes = require('./src/routes');
app.use('/', routes);


// Inicia o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});