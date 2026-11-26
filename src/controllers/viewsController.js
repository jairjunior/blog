const articleModel = require('../models/articleModel');
const categoryModel = require('../models/categoryModel');
const commentModel = require('../models/commentModel');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { setAuthCookie } = require('../utils/authUtils');
const { printConsoleError, printConsoleWarning, printSecurityAudit } = require('../utils/logger');


/******************************************************************************
 * Função para tratar requisições GET no caminho raiz '/'
 ******************************************************************************
 * Renderiza a página principal do site utilizando template EJS.
 *****************************************************************************/
const renderHomePage = async (req, res) => {
    try {
        const NUMBER_OF_LATEST_ARTICLES = 3;
        const latestArticles = await articleModel.getLatestArticles(NUMBER_OF_LATEST_ARTICLES);
        return res.render('index', { 
            latestArticles,
            user: res.locals.currentUser,
            currentUrl: req.originalUrl
        });

    } catch (error) {
        printConsoleError('VIEW_ERROR_RENDER_HOME_PAGE', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error. Contact the administrator.'
        });
    }
}


/******************************************************************************
 * Função para tratar requisições GET no caminho '/artigos'
 ******************************************************************************
 * Renderiza a página que exibe todos os artigos do site utilizando template EJS.
 * Por padrão, os artigos serão renderizados do mais recente para o mais antigo.
 * Para modificar esse comportamento, utiliza-se a query string "filter" na URL.
 *****************************************************************************/
const renderArticlesPage = async (req, res) => {
    try {
        const numberOfArticles = 18;
        const articles = await articleModel.getLatestArticles(numberOfArticles);
        const categoryName = 'Artigos';
        const categoryDescription = 'Todos os artigos do site outOfBounds estarão listados nesta página.';
        return res.render('category', { 
            articles,
            categoryName,
            categoryDescription,
            user: res.locals.currentUser,
            currentUrl: req.originalUrl
        });

    } catch (error) {
        printConsoleError('VIEW_ERROR_RENDER_ARTICLES_PAGE', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error. Contact the administrator.'
        });
    }
}


/******************************************************************************
 * Função para tratar requisições GET no caminho '/artigos/:categorySlug'
 ******************************************************************************
 * Renderiza a página que exibe todos os artigos de uma determinada categoria
 * do site utilizando template EJS.
 * Os artigos são recuperados por meio do parâmetro "category" que é passado 
 * pela URL.
 *****************************************************************************/
const renderCategoryPage = async (req, res) => {
    try {
        const categorySlug = req.params.categorySlug;
        const category = await categoryModel.getCategoryBySlug(categorySlug);
        if(!category){
            return res.status(404).json({ // HTTP 404 Not Found
                success: false,
                messageEn: 'Category not found.',
                messagePt: 'Categoria não encontrada.'
            });
        }

        const articles = await articleModel.getArticlesByCategory(categorySlug);
        return res.render('category', {
            articles,
            categoryName: category.name,
            categoryDescription: category.description,
            user: res.locals.currentUser,
            currentUrl: req.originalUrl
        });

    } catch (error) {
        printConsoleError('VIEW_ERROR_RENDER_CATEGORY_PAGE', error);
        return res.status(500).json({ // HTTP 500 Internal Server Error 
            success: false,
            messageEn: 'Internal server error. Contact the administrator.',
            messagePt: 'Erro no servidor. Entre em contato com o administrador.'
        });
    }
}


/******************************************************************************
 * Função para tratar requisições GET no caminho '/artigos/:categorySlug/:articleSlug'
 ******************************************************************************
 * Renderiza um artigo específico utilizando template EJS.
 * O conteúdo do artigo é recuperado por meio dos parâmetros "category" e "slug"
 * que são passados pela URL.
 *****************************************************************************/
const renderArticleBySlugs = async (req, res) => {
    try {
        const { categorySlug, articleSlug } = req.params;

        const article = await articleModel.getArticleBySlugs(categorySlug, articleSlug);
        if(!article){
            return res.status(404).json({ // HTTP 404 Not Found
                success: false,
                messageEn: 'Post not found.',
                messagePt: 'Post não encontrado.'
            });
        }
        
        const comments = await commentModel.getComments(article.id);
        return res.render('article', {
            article,
            comments,
            user: res.locals.currentUser,
            currentUrl: req.originalUrl
        });

    } catch (error) {
        printConsoleError('VIEW_ERROR_RENDER_SINGLE_ARTICLE_PAGE', error);
        return res.status(500).json({ // HTTP 500 Internal Server Error 
            success: false,
            messageEn: 'Internal server error. Contact the administrator.',
            messagePt: 'Erro no servidor. Entre em contato com o administrador.'
        });
    }
}


/******************************************************************************
 * Função para tratar requisições GET no caminho '/sobre'
 ******************************************************************************
 * Renderiza a página "Sobre" utilizando template EJS.
 * Nenhuma informação dinâmica é necessária para essa página, então não há 
 * necessidade de buscar nada no banco de dados.
 *****************************************************************************/
const renderAboutPage = async (req, res) => {
    return res.render('about', {
        user: res.locals.currentUser,
        currentUrl: req.originalUrl
    });
}


/******************************************************************************
 * Função para tratar requisições GET no caminho '/contato'
 ******************************************************************************
 * Renderiza a página "Contato" utilizando template EJS.
 * Nenhuma informação dinâmica é necessária para essa página, então não há 
 * necessidade de buscar nada no banco de dados.
 *****************************************************************************/
const renderContactPage = async (req, res) => {
    return res.render('contact', {
        user: res.locals.currentUser,
        currentUrl: req.originalUrl
    });
}


/******************************************************************************
 * Função para tratar requisições GET no caminho '/register'
 ******************************************************************************
 * Renderiza a página odne o suuário pdoe se cadastrar no sistema preenchendo o
 * formulário que será enviando para o servidor.
 *****************************************************************************/
const renderRegisterPage = async (req, res) => {
    return res.render('register');
}


/******************************************************************************
 * Função para tratar requisições GET no caminho '/login'
 ******************************************************************************
 * Pega o parâmetro 'redirectTo' que é passado na URL como uma query string.
 * Esse parâmetro vai dizer para onde o usuário deve ser redirecionado após
 * efetuar o login com sucesso.
 * Esse caminho é exatamente de onde o usuário veio e é para onde ele deve 
 * voltar.
 *****************************************************************************/
const renderLoginPage = async (req, res) => {
    const redirectTo = req.query.redirectTo || '/';
    return res.render('login', { redirectTo });
}


/******************************************************************************
 * Função para tratar requisições GET no caminho '/recuperar-senha'
 ******************************************************************************
 * Renderiza a página onde o usuário pode solicitar a recuperação de sua senha
 * informando o e-mail cadastrado.
 *****************************************************************************/
const renderForgotPasswordPage = async (req, res) => {
    return res.render('forgot-password');
}


/******************************************************************************
 * Função para tratar requisições GET no caminho '/alterar-senha'
 ******************************************************************************
 * Essa rota será chamada quando o usuário estiver tentando resgatar o acesso
 * ao site. A validação acontecerá pelo Token JWT de Reset que será
 * encaminhado por e-mail e estará contido na URL.
 *****************************************************************************/
const renderResetPasswordPage = async (req, res) => {
    const { resetToken } = req.query;

    // Se o Token JWT de Reset não consta na URL, redireciona para a Página Inicial
    if (!resetToken) {
        return res.redirect('/');
    }

    try {
        // Decodifica o Token JWT de Reset e verifica o payload
        // É necessário decodificar o token primeiro para buscar o usuário no 
        // banco de dados, pois o personalSecret utiliza a senha atual.
        const decoded = jwt.decode(resetToken);
        if (!decoded || !decoded.userId || !decoded.userEmail) {
            throw new Error('Invalid or malformed token. Could not decode it.')
        }

        // Busca o usuário no banco de dados
        const user = await userModel.getUserById(decoded.userId);
        if (!user) throw new Error('User not found in the database.');

        // Recria o secret personalizado utilizando a senha atual do usuário
        // Verifica o Token JWT de Reset
        const personalSecret = process.env.JWT_SECRET + user.password;
        jwt.verify(resetToken, personalSecret);

        // Se o token for válido, renderiza página repassando o resetToken
        // Também envia o e-mail para o navegador reconhecer a nova senha atualizar
        // no gerenciador de senhas.
        return res.render('reset-password', {
            success: true,
            resetToken,
            email: user.email
        });

    } catch (error) {
        printConsoleError('VIEW_ERROR_RENDER_RESET_PASSWORD_PAGE', error);
        return res.render('reset-password', {
            success: false,
            messageEn: 'The recovery link is invalid or has already expired.\nPlease submit a new request to recover your password or contact the administrator.',
            messagePt: `O link de recuperação é inválido ou já expirou.\nFaça uma nova solicitação para recuperar a senha.`
        });
    }
};

/******************************************************************************
 * Função para tratar requisições GET no caminho '/informacoes-para-verificar-conta'
 ******************************************************************************
 * Renderiza a página de instruções de verificação de e-mail pós-cadastro.
 * Recupera o e-mail e o primeiro nome do usuário autenticado via cookie (authToken).
 * Apresenta um botão de reenvio para o caso de o e-mail de verificação ter falhado.
 * Protege a rota contra acessos anônimos e redireciona usuários já verificados.
 *****************************************************************************/
const renderAccountVerifyInformationPage = (req, res) => {
    // Verifica se é um usuário anônimo ou se o Token JWT de Autenticação 
    // está com algum problema (expirado, inválido, malformado, etc).
    // Caso alguma das condições seja verdadeira, redireciona para fazer o login.
    if (!res.locals.currentUser || res.locals.tokenFailure === true) {
        return res.redirect('/login?redirectTo=/informacoes-para-verificar-conta');
    }

    // Verifica se o e-mail do usuário já está verificado.
    // Caso positivo, redireciona para a Página Inicial.
    if (res.locals.currentUser.isVerified === true) {
        return res.redirect('/');
    }

    // Lê e invalida imediatamente o cookie efêmero de transição pós-cadastro
    const isFirstVisitAfterRegister = Boolean(req.cookies && req.cookies.verifyContext === 'registered');
    if (req.cookies?.verifyContext) {
        res.clearCookie('verifyContext', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
    }

    // Renderiza a página caso esteja logado e com isVerified = false
    // Verifica se houve erro no envio do e-mail de verificação.
    // Pega o e-mail e o primeiro nome contidos na variável local 'currentUser'.
    return res.render('account-verify-info', {
        email: res.locals.currentUser.email,
        firstName: res.locals.currentUser.firstName,
        verificationEmailFailed: req.query.error === 'email_failed',
        isFirstVisitAfterRegister
    });
};


/******************************************************************************
 * Função para tratar requisições GET no caminho '/verificar-conta'
 ******************************************************************************
 * Valida o Token JWT de Verificação enviado por e-mail, atualiza o status no 
 * banco de dados, emite um novo Token JWT de Autenticação atualizado e 
 * renderiza a view.
 * Esta rota é protegida contra usuários sem Token JWT de Verificação e 
 * contas já verificadas.
 *****************************************************************************/
const renderAccountVerifyPage = async (req, res) => {
    const { verificationToken } = req.query;
    
    // Se o Token JWT de Verificação não consta na URL, redireciona para a Página Inicial
    if (!verificationToken) {
        return res.redirect('/');
    }
    
    try {
        // Decodifica o Token JWT de Verificação e verifica o payload
        const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId || !decoded.userEmail) {
            throw new Error('Invalid or malformed verification token.');
        }

        // Busca o usuário no banco de dados
        const user = await userModel.getUserById(decoded.userId);
        if (!user) throw new Error('User not found in the database.');

        // Se o usuário ainda não estiver verificado, atualiza o status de verificação no banco de dados
        if (!user.is_verified) {
            await userModel.updateVerificationStatusById(user.id, true);
            user.is_verified = true;
        }

        // Gera um novo Token JWT de Autenticação com isVerified: true 
        // para que o banner suma imediatamente e o usuário ganhe acesso total ao site.
        // Salva o novo token em um cookie no navegador do usuário
        setAuthCookie(res, user);

        // Renderiza a página de sucesso com os dados do usuário
        printSecurityAudit(
            'AUTH_AUDIT_ACCOUNT_VERIFIED', 
            `Conta ativada com sucesso. Usuário ID: [${user.id}], E-mail: [${user.email}], IP: [${req.ip}]`
        );
        res.render('account-verify', {
            success: true,
            userName: user.first_name
        });

    } catch (error) {
        printConsoleError('VIEW_ERROR_RENDER_ACCOUNT_VERIFY_PAGE', error);
        printConsoleWarning(
            'AUTH_WARN_VERIFY_TOKEN_INVALID',
            `Tentativa de ativação de conta com token inválido ou expirado. IP: [${req.ip}]`
        );
        return res.render('account-verify', {
            success: false,
            messageEn: 'The verification link is invalid or has already expired. Please request a new verification link.',
            messagePt: 'O link de verificação é inválido ou já expirou. Solicite um novo link de confirmação para ativar sua conta.'
        });
    }
};


/******************************************************************************
 * Exporta as funções para serem utilizadas pela aplicação.
 *****************************************************************************/
module.exports = {
    renderRegisterPage,
    renderLoginPage,
    renderHomePage,
    renderArticlesPage,
    renderCategoryPage,
    renderArticleBySlugs,
    renderAboutPage,
    renderContactPage,
    renderForgotPasswordPage,
    renderResetPasswordPage,
    renderAccountVerifyInformationPage,
    renderAccountVerifyPage
};
