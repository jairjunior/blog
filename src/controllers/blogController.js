const postModel = require('../models/postModel');
const categoryModel = require('../models/categoryModel');
const commentModel = require('../models/commentModel');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { setAuthCookie } = require('../utils/authUtils');
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
/ Função para tratar requisições GET no caminho '/posts/:categorySlug'
/
/ Renderiza a página que exibe todos os artigos de uma determinada categoria
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
/ Função para tratar requisições GET no caminho '/posts/:categorySlug/:postSlug'
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
/ Renderiza a página onde o usuário pode solicitar a recuperação de sua senha
/ informando o e-mail cadastrado.
/*****************************************************************************/
const renderForgotPasswordPage = async (req, res) => {
    res.render('forgot-password');
}


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/alterar-senha'
/
/ Essa rota será chamada quando o usuário estiver tentando resgatar o acesso
/ ao site. A validação acontecerá pelo Token JWT de Reset que será
/ encaminhado por e-mail e estará contido na URL.
/*****************************************************************************/
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
        // noo gerenciador de senhas.
        res.render('reset-password', {
            success: true,
            resetToken,
            email: user.email
        });

    } catch (error) {
        printConsoleError(error);
        return res.render('reset-password', {
            success: false,
            messageEn: 'The recovery link is invalid or has already expired.\nPlease submit a new request to recover your password or contact the administrator.',
            messagePt: `O link de recuperação é inválido ou já expirou.\nFaça uma nova solicitação para recuperar a senha.`
        });
    }
};

/*****************************************************************************
/ Função para tratar requisições GET no caminho '/informacoes-para-verificar-conta'
/
/ Renderiza a página de instruções de verificação de e-mail pós-cadastro.
/ Recupera o e-mail e o primeiro nome do usuário autenticado via cookie (authToken).
/ Apresenta um botão de reenvio para o caso de o e-mail de verificação ter falhado.
/ Protege a rota contra acessos anônimos e redireciona usuários já verificados.
/*****************************************************************************/
const renderAccountVerifyInformationPage = (req, res) => {
    // Verifica se é um usuário anônimo ou se o Token JWT de Autenticação 
    // está com algum problema (expirado, inválido, malformado, etc).
    // Caso alguma das condições seja verdadeira, redireciona para fazer o login.
    if (!res.locals.currentUser || res.locals.tokenFailure === true) {
        return res.redirect('/login?redirectTo=/informacoes-para-verificar-conta');
    }

    // Verifica se o e-mail do usuário já está verificado.
    // Caso positivo, redireciona para a Página Inicial.
    if (res.locals.currentUser.isVerified) {
        return res.redirect('/');
    }

    // Renderiza a página caso esteja logado e com isVerified = false
    // Verifica se houve erro no envio do e-mail de verificação.
    // Pega o e-mail e o primeiro nome contidos na variável local 'currentUser'.
    const emailSendFailed = req.query.error === 'email_failed';
    res.render('account-verify-info', {
        email: res.locals.currentUser.email,
        firstName: res.locals.currentUser.firstName,
        verificationEmailFailure: emailSendFailed,
    });
};


/*****************************************************************************
/ Função para tratar requisições GET no caminho '/verificar-conta'
/
/ Valida o Token JWT de Verificação enviado por e-mail, atualiza o status no 
/ banco de dados, emite um novo Token JWT de Autenticação atualizado e 
/ renderiza a view.
/ Esta rota é protegida contra usuários sem Token JWT de Verificação e 
/ contas já verificadas.
/*****************************************************************************/
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

        // Se o usuário já estiver verificado, redireciona para a Página Inicial
        // Do contrário, atualiza o status de verificação no banco de dados
        if (user.is_verified) {
            return res.redirect('/');
        } else {
            await userModel.updateVerificationStatusById(user.id, true);
            user.is_verified = true;
        }

        // Gera um novo Token JWT de Autenticação com isVerified: true 
        // para que o banner suma imediatamente e o usuário ganhe acesso total ao site.
        // Salva o novo token em um cookie no navegador do usuário
        setAuthCookie(res, user);

        // Renderiza a página de sucesso com os dados do usuário
        res.render('account-verify', {
            success: true,
            userName: user.first_name
        });

    } catch (error) {
        printConsoleError(error);
        return res.render('account-verify', {
            success: false,
            messageEn: 'The verification link is invalid or has already expired. Please request a new verification link.',
            messagePt: 'O link de verificação é inválido ou já expirou. Solicite um novo link de confirmação para ativar sua conta.'
        });
    }
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
    renderAccountVerifyInformationPage,
    renderAccountVerifyPage
};
