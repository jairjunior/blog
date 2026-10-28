const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const categoryModel = require('../models/categoryModel');


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
    const redirectTo = req.query.redirect || '/';
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
/ Exporta as funções para serem utilizadas pela aplicação.
/*****************************************************************************/
module.exports = {
    renderLoginPage,
    renderHomePage,
    renderPostsPage,
    renderCategoryPage,
    renderPostBySlugs,
};
