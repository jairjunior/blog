const path = require('path');
const postModel = require('../models/postModel');
const categoryModel = require('../models/categoryModel');


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/login'
/
/ Apenas devolve ao usuário a página de login, que é um arquivo estático.
/*****************************************************************************/
const getLoginPage = async (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/login.html'));
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho raiz '/'
/
/ Renderiza a página principal do blog utilizando template EJS.
/*****************************************************************************/
const renderHomePage = async (req, res) => {
    try {
        const numberOfPosts = 3;
        const latestPosts = await postModel.getLatestPosts(numberOfPosts);
        res.render('index', { latestPosts });

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
        res.render('category', { posts, categoryName });

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
        res.render('category', { posts, categoryName: category.name });

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
        const comments = await postModel.getComments(post.id);
        res.render('post', { post, comments });

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
/ Função para tratar requisições POST no caminho 
/ '/posts/:categorySlug/:postSlug/comments'
/ 
/ Registra um novo comentário no post especificado na URL.
/ Verifica se o token está válido, senão, solicita novo login do usuário.
/*****************************************************************************/
const postComment = async (req, res) => {
    
    if(res.locals.tokenExpired === true){
        return res.status(401).json({
            success: false,
            messageEn: 'Expired token. Please log in again to submit your comment.',
            messagePt: 'Token expirado. Por favor, realize o login novamente para submeter seu comentário.'
        });
    }
    if(res.locals.isLoggedIn === false){
        return res.status(401).json({
            success: false,
            messageEn: 'You need to be logged in to comment.',
            messagePt: 'Você precisa estar logado para comentar.'
        });
    }
    
    try{
        const { categorySlug, postSlug } = req.params;
        const { commentContent } = req.body;
        const userId = res.locals.currentUser.id;

        if (!commentContent || commentContent.trim() === ''){
            return res.status(400).json({
                success: false,
                messageEn: 'Comments cannot be empty.',
                messagePt: 'Comentários não podem estar vazios.'
            });
        }

        const { id: postId } = await postModel.getPostIdBySlugs(categorySlug, postSlug);
        if(!postId){
            res.status(404).json({ 
                success: false,
                messageEn: 'Post not found.',
                messagePt: 'Post não encontrado.'
            });
        }

        await postModel.createComment(postId, userId, commentContent);
        return res.status(201).json({
            success: true,
            messageEn: 'Comment successfully added.',
            messagePt: 'Comentário adicionado com sucesso.'
        });

    } catch(error) {
        console.error('ERROR in blogController.postComment():\n', error);
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
    getLoginPage,
    renderHomePage,
    renderPostsPage,
    renderCategoryPage,
    renderPostBySlugs,
    postComment
};
