const postModel = require('../models/postModel');
const categoryModel = require('../models/categoryModel');
const commentModel = require('../models/commentModel');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { printConsoleError } = require('../utils/logger');


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/register'
/
/ Pega o parâmetro 'redirectTo' que é passado na URL como uma query string.
/ Esse parâmetro vai dizer para onde o usuário deve ser redirecionado após
/ efetuar o cadastro no site.
/ Esse caminho é exatamente de onde o usuário veio e é para onde ele deve 
/ voltar.
/*****************************************************************************/
const renderRegisterPage = async (req, res) => {
    const redirectTo = req.query.redirectTo || '/';
    res.render('register', { redirectTo });
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/login'
/
/ Pega o parâmetro 'redirectTo' que é passado na URL como uma query string.
/ Esse parâmetro vai dizer para onde o usuário deve ser redirecionado após
/ efetuar o login com sucesso.
/ Esse caminho é exatamente de onde o usuário veio e é para onde ele deve 
/ voltar.
/*****************************************************************************/
const renderLoginPage = async (req, res) => {
    const redirectTo = req.query.redirectTo || '/';
    res.render('login', { redirectTo });
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho raiz '/'
/
/ Renderiza a página principal do blog utilizando template EJS.
/*****************************************************************************/
const renderHomePage = async (req, res) => {
    try {
        const NUMBER_OF_LATEST_POSTS = 3;
        const latestPosts = await postModel.getLatestPosts(NUMBER_OF_LATEST_POSTS);
        res.render('index', { 
            latestPosts,
            user: res.locals.currentUser,
            currentUrl: req.originalUrl
        });

    } catch (error) {
        console.error('ERROR in blogController.renderHomePage():\n', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error. Contact the administrator.'
        });
    }
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/posts'
/
/ Renderiza a página que exibe todos os posts do blog utilizando template EJS.
/ Por padrão, os posts serão renderizados do mais recente para o mais antigo.
/ Para modificar esse comportamento, utiliza-se a query string "filter" na URL.
/*****************************************************************************/
const renderPostsPage = async (req, res) => {
    try {
        const numberOfPosts = 18;
        const posts = await postModel.getLatestPosts(numberOfPosts);
        const categoryName = 'Artigos';
        res.render('category', { 
            posts,
            categoryName,
            user: res.locals.currentUser,
            currentUrl: req.originalUrl
        });

    } catch (error) {
        console.error('ERROR in blogController.renderPostsPage():\n', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error. Contact the administrator.'
        });
    }
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/posts/:category'
/
/ Renderiza a página que exibe todos os posts de uma determinada categoria
/ do blog utilizando template EJS.
/ Os posts são recuperados por meio do parâmetro "category" que é passado 
/ pela URL.
/*****************************************************************************/
const renderCategoryPage = async (req, res) => {
    try {
        const categorySlug = req.params.categorySlug;
        const posts = await postModel.getPostsByCategory(categorySlug);
        const category = await categoryModel.getCategoryBySlug(categorySlug);
        res.render('category', {
            posts,
            categoryName: category.name,
            user: res.locals.currentUser,
            currentUrl: req.originalUrl
        });

    } catch (error) {
        console.error('ERROR in blogController.renderCategoryPage():\n', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error. Contact the administrator.'
        });
    }
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/posts/:category/:slug'
/
/ Renderiza um post específico utilizando template EJS.
/ O conteúdo do post é recuperado por meio dos parâmetros "category" e "slug"
/ que são passados pela URL.
/*****************************************************************************/
const renderPostBySlugs = async (req, res) => {
    try {
        const { categorySlug, postSlug } = req.params;

        const post = await postModel.getPostBySlugs(categorySlug, postSlug);
        if(!post){
            res.status(404).json({ 
                success: false,
                messageEn: 'Post not found.',
                messagePt: 'Post não encontrado.'
            });
        }
        const comments = await commentModel.getComments(post.id);
        res.render('post', {
            post,
            comments,
            user: res.locals.currentUser,
            currentUrl: req.originalUrl
        });

    } catch (error) {
        console.error('ERROR in blogController.renderPostBySlugs():\n', error);
        res.status(500).json({ 
            success: false,
            messageEn: 'Internal server error. Contact the administrator.',
            messagePt: 'Erro no servidor. Entre em contato com o administrador.'
        });
    }
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/sobre'
/
/ Renderiza a página "Sobre" utilizando template EJS.
/ Nenhuma informação dinâmica é necessária para essa página, então não há 
/ necessidade de buscar nada no banco de dados.
/*****************************************************************************/
const renderAboutPage = async (req, res) => {
    res.render('about', {
        user: res.locals.currentUser,
        currentUrl: req.originalUrl
    });
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/contato'
/
/ Renderiza a página "Contato" utilizando template EJS.
/ Nenhuma informação dinâmica é necessária para essa página, então não há 
/ necessidade de buscar nada no banco de dados.
/*****************************************************************************/
const renderContactPage = async (req, res) => {
    res.render('contact', {
        user: res.locals.currentUser,
        currentUrl: req.originalUrl
    });
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/recuperar-senha'
/
/ 
/*****************************************************************************/
const renderForgotPasswordPage = async (req, res) => {
    res.render('forgot-password');
}



/*****************************************************************************
/ Função para tratar requisições GET no caminho '/alterar-senha'
/
/ Essa rota será chamada quando o usuário estiver tentando resgatar o acesso
/ ao site. A validação acontecerá pelo token JWT encaminhado pela URL.
/*****************************************************************************/
const renderResetPasswordPage = async (req, res) => {
    const { token } = req.query;

    try {
        // Decodifica o token
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.id) {
            throw new Error('Invalid or malformed token. Could not decode it.')
        }

        // Busca o usuário no banco de dados
        const user = await userModel.getUserById(decoded.id);
        if (!user) throw new Error('User not found in the database.');

        // Recria o secret usando a senha atual
        const secretForThisUser = process.env.JWT_SECRET + user.password;
        // Agora sim, verifica o token
        jwt.verify(token, secretForThisUser);
        // Em caso de sucesso, renderiza página e envia o token
        res.render('reset-password', {
            success: true,
            token
        });

    } catch (error) {
        printConsoleError(error);
        return res.render('reset-password', {
            success: false,
            messageEn: 'The recovery link is invalid or has already expired. Please submit a new request to recover your password or contact the administrator.',
            messagePt: 'O link de recuperação é inválido ou já expirou. Faça uma nova solicitação para recuperar a senha ou entre em contato com o administrador.'
        });
    }
};

/*****************************************************************************
/ Função para tratar requisições GET no caminho '/confirmacao-de-cadastro'
/
/ 
/*****************************************************************************/
const renderEmailVerificationPendingPage = (req, res) => {
    const sessionEmail = req.session.pendingVerificationEmail;
    
    // Verifica por meio da session variable se o usuário passou pelo fluxo de cadastro
    if (!sessionEmail) {
        return res.redirect('/');
    }

    // Captura se houve falha no envio do e-mail através da session variable específica
    const verificationEmailFailure = Boolean(req.session.failedToSendVerificationEmail);

    // Limpa as session variables para evitar que o usuário 
    // reutilize essa visualização indefinidamente
    delete req.session.pendingVerificationEmail;
    delete req.session.failedToSendVerificationEmail;
    
    // Renderiza a página '/confirmacao-de-cadastro' personalizada
    // com e-mail, nome do usuário e o status de erro no envio
    const { firstName } = req.query;
    res.render('verify-email', {
        email: sessionEmail || '',
        firstName: firstName || '',
        emailSendFailed: verificationEmailFailure
    });

};


/*****************************************************************************
/ Exporta as funções para serem utilizadas pela aplicação.
/*****************************************************************************/
module.exports = {
    renderRegisterPage,
    renderLoginPage,
    renderHomePage,
    renderPostsPage,
    renderCategoryPage,
    renderPostBySlugs,
    renderAboutPage,
    renderContactPage,
    renderForgotPasswordPage,
    renderResetPasswordPage,
    renderEmailVerificationPendingPage
};
