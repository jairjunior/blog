const path = require('path');
const postModel = require('../models/postModel');
const categoryModel = require('../models/categoryModel');


/* O campo "status" da tabela post pode assumir os seguintes valores:
 * "published": O post está finalizado, aprovado e liberado para o público
 * "draft": O artigo ainda está sendo escrito ou revisado pelo autor.
 * "archived": Para posts antigos que você não quer mais exibir publicamente,
 *             mas também não quer deletar do banco de dados.
 * "scheduled": Para posts que vão ao ar automaticamente em uma data futura
 *              (trabalhando em conjunto com o campo published_at) - Opcional.
*/


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/login'
/ Apenas devolve ao usuário a página de login, que é um arquivo estático.
/*****************************************************************************/
const getLoginPage = async (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/login.html'));
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho raiz '/'
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
/ Renderiza a página que exibe todos os posts do blog utilizando template EJS.
/ Por padrão, os posts serão renderizados do mais recente para o mais antigo.
/ Para modificar esse comportamento, utiliza-se a query string "filter" na URL.
/*****************************************************************************/
const renderAllPostsPage = async (req, res) => {
    try {
        const numberOfPosts = 18;
        const posts = await postModel.getLatestPosts(numberOfPosts);
        const categoryName = 'Todos os Posts';
        res.render('category', { posts, categoryName });

    } catch (error) {
        console.error('ERROR in blogController.renderHomePage():\n', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error. Contact the administrator.'
        });
    }
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/posts/:category'
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
        const categoryName = category.name;
        res.render('category', { posts, categoryName });

    } catch (error) {
        console.error('ERROR in blogController.renderPostsByCategory():\n', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error. Contact the administrator.'
        });
    }
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/posts/:category/:slug'
/ Renderiza um post específico utilizando template EJS.
/ O conteúdo do post é recuperado por meio dos parâmetros "category" e "slug"
/ que são passados pela URL.
/*****************************************************************************/
const renderPostBySlug = async (req, res) => {
    try {
        const { categorySlug, postSlug } = req.params;
        const post = await postModel.getPostByCategoryAndSlug(categorySlug, postSlug);
        if(!post){
            res.status(404).json({ 
                success: false,
                message: 'Post not found.'
            });
        }
        res.render('post', { post });

    } catch (error) {
        console.error('ERROR in blogController.renderPostBySlug():\n', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error. Contact the administrator.'
        });
    }
}


/*****************************************************************************
/ Exporta as funções para serem utilizadas pela aplicação fora deste arquivo.
/*****************************************************************************/
module.exports = {
    getLoginPage,
    renderHomePage,
    renderAllPostsPage,
    renderCategoryPage,
    renderPostBySlug
};
