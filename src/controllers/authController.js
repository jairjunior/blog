const databasePool = require('../config/database');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendNewUserVerificationEmail, sendResetPasswordEmail } = require('../services/emailService');
const { printConsoleError, printConsoleWarning } = require('../utils/logger');


/******************************************************************************
/ Função para tratar requisições POST no rota /api/auth/register
/
/ Cadastra um novo usuário no sistema.
/*****************************************************************************/
exports.register = async (req, res) => {
    const { email, firstName, lastName, password } = req.body;

    // Verifica se todos os dados foram enviados
    if(!email || !firstName || !lastName || !password) {
        return res.status(400).json({ // HTTP 400 Bad Request
            success: false,
            messageEn: 'Please, provide all required fields.',
            messagePt: 'Por favor, providencie todos os campos exigidos.'
        });
    }

    try {
        // Faz hash da senha e cria novo usuário no banco de dados
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUserId = await userModel.createUser(email, firstName, lastName, hashedPassword);

        // Cria um token JWT de verificação do e-mail válido por 24 horas
        const verificationToken = jwt.sign({ 
                userId: newUserId,
                email: email
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // Monta o link absoluto para a rota de verificação
        const protocol = req.protocol;
        const host = req.get('host');
        const verificationUrl = `${protocol}://${host}/verificar-conta?verificationToken=${verificationToken}`;
        let redirectUrl = '/informacoes-para-verificar-conta';

        // Dispara o envio do e-mail de verificação com tratamento personalizado.
        // Se der erro no envio, salva uma flag na sessão indicando que o e-mail falhou
        // ao ser despachado. Essa flag irá influenciar na renderização da view
        // verify-email.ejs, para onde o usuário será redirecionado na sequência.
        const userName = `${firstName} ${lastName}`;
        try {
            await sendNewUserVerificationEmail(email, userName, verificationUrl);
        } catch (emailError) {
            printConsoleError(emailError);
            redirectUrl = '/informacoes-para-verificar-conta?error=email_failed';
        }

        // Recupera todas as informações do banco de dados do usuário que acabou de ser criado
        // Cria o token JWT de autenticação, porém ainda não estará verificado
        const authToken = jwt.sign({
                id: newUserId, 
                email: email,
                first_name: firstName,
                last_name: lastName,
                avatarUrl: null,
                role: 'reader',
                isVerified: false
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Salva o token de autenticação em um cookie HttpOnly
        res.cookie('authToken', authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        // Sucesso!
        res.status(201).json({ // HTTP 201 Created
            success: true,
            redirectUrl: redirectUrl,
            messageEn: `User [${email}] registered successfully. Still needs confirmation.`,
            messagePt: `Usuário [${email}] registrado com sucesso. Ainda necessita de confirmação.`
        });

    } catch (error) {
        printConsoleError(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ // HTTP 409 Conflict
                success: false, 
                messageEn: 'Email already exists.',
                messagePt: 'O e-mail informado já está cadastrado.'
            });
        } else {
            return res.status(500).json({ // HTTP 500 Internal Server Error 
                success: false,
                messageEn: 'Internal server error. Please try again later or contact the administrator.',
                messagePt: 'Erro interno do servidor. Tente novamente mais tarde ou entre em contato com o administrador.'
            });
        }
    }

};


/******************************************************************************
/ Função para tratar requisições POST no rota /api/auth/login
/
/ Efetua login e autentica o usuário existente gerando um token JWT que será
/ armazenado como cookie no navegador do usuário.
/*****************************************************************************/
exports.login = async (req, res) => {
    const { email, password, redirectTo } = req.body;

    // Verifica se todos os dados foram enviados
    if(!email || !password) {
        return res.status(400).json({ 
            success: false,
            messageEn: 'Please provide both email and password.',
            messagePt: 'Por favor, providencie o e-mail e a senha para realizar o login.'
        });
    }

    try{
        // Busca usuário no banco de dados pelo e-mail
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ 
                success: false,
                messageEn: 'Invalid email or password.',
                messagePt: 'E-mail e/ou senha inválidos.'
            });
        }

        // Compara se a senha informada está correta
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ 
                success: false,
                messageEn: 'Invalid email or password.',
                messagePt: 'E-mail e/ou senha inválidos.'
            });
        }

        // Cria token JWT de autenticação
        const authToken = jwt.sign({
                id: user.id, 
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                avatarUrl: user.avatar,
                role: user.role,
                isVerified: user.is_verified
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Salva o token JWT de autenticação em um cookie HttpOnly
        res.cookie('authToken', authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });
        
        // Sucesso!
        const safeRedirect = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/';
        return res.status(200).json({
            success: true,
            messageEn: 'Login successful.',
            messagePt: 'Login realizado com sucesso.',
            redirectUrl: safeRedirect
        });

    } catch (error) {
        printConsoleError(error);
        return res.status(500).json({ 
            success: false,
            messageEn: 'Internal server error. Contact the administrator.',
            messagePt: 'Erro no servidor. Tente novamente mais tarde ou entre em contato com o administrador.'
        });

    }
};


/******************************************************************************
/ Função para tratar requisições GET no rota /api/auth/logout
/
/ Faz logout da aplicação invalidando o token de autenticação no navegador 
/ do usuário.
/*****************************************************************************/
exports.logout = async (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true em produção (HTTPS)
        sameSite: 'strict'
    });
    const redirectTo = req.get('referer') || '/';
    return res.redirect(redirectTo);
}


/******************************************************************************
/ Função para tratar requisições POST no rota /api/auth/forgot-password
/ 
/ Envia e-mail de recuperação de senha para o usuário.
/*****************************************************************************/
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            messageEn: 'Please provide an email address.',
            messagePt: 'Por favor, forneça um endereço de e-mail.'
        });
    }

    try {
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            printConsoleWarning(`Someone is trying to reset password of a non existing user: [${email}]`);
            return res.status(200).json({
                success: true,
                messageEn: 'If the email is registered, a link to reset your password has been sent.',
                messagePt: 'Se o e-mail estiver cadastrado, um link para redefinir sua senha foi enviado. Verifique também sua caixa de spam.'
            });
        }

        // Cria um JWT válido por 15 minutos
        // O uniqueSecret concatena a senha atual do usuário. Assim que a senha for trocada, 
        // o resetToken ficará inválido
        const userPasswordHash = user.password;
        const uniqueSecret = process.env.JWT_SECRET + userPasswordHash;
        const resetToken = jwt.sign({
                id: user.id,
                email: user.email
            }, 
            uniqueSecret, 
            { expiresIn: '15m' }
        );

        // Monta o link absoluto para a página de redefinição
        const protocol = req.protocol;
        const host = req.get('host');
        const resetUrl = `${protocol}://${host}/alterar-senha?resetToken=${resetToken}`;

        // Envia o e-mail com a URL
        const userName = user.first_name + ' ' + user.last_name;
        await sendResetPasswordEmail(user.email, userName, resetUrl);
        return res.status(200).json({
            success: true,
            messageEn: 'If the email is registered, a link to reset your password has been sent.',
            messagePt: 'Se o e-mail estiver cadastrado, um link para redefinir sua senha foi enviado. Verifique também sua caixa de spam.'
        });

    } catch (error) {
        printConsoleError(error);
        return res.status(500).json({
            success: false,
            messageEn: 'An internal error occurred while processing the request.',
            messagePt: 'Ocorreu um erro interno ao processar a solicitação. Tente novamente mais tarde ou entre em contato com o administrador.'
        });
    }
};


/******************************************************************************
/ Função para tratar requisições POST no rota /api/auth/reset-password
/ 
/ Atualiza a senha do usuário na base de dados.
/*****************************************************************************/
exports.resetPassword = async (req, res) => {
    const { resetToken, password, confirmPassword } = req.body;

    // Verifica se todos os campos foram preenchidos
    if (!resetToken || !password || !confirmPassword) {
        return res.status(400).json({
            success: false,
            messageEn: 'Please provide the Reset Token, new password, and password confirmation.',
            messagePt: 'Por favor, forneça o Reset Token, a nova senha e a confirmação de senha.'
        });
    }

    // Confirma se as senhas digitadas coincidem
    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            messageEn: 'Passwords do not match.',
            messagePt: 'As senhas informadas não correspondem.'
        });
    }

    // RegEx de validação da complexidade de senha
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.\-_])[A-Za-z\d@$!%*?&#.\-_]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            messageEn: 'Password does not meet the minimum complexity requirements.',
            messagePt: 'A senha informada não atende aos requisitos mínimos de complexidade.'
        });
    }

    try {
        // Decodifica o payload do Reset Token
        const decoded = jwt.decode(resetToken);
        if (!decoded || !decoded.id) {
            return res.status(400).json({
                success: false,
                messageEn: 'Invalid or malformed Reset Token. Could not decode it.',
                messagePt: 'Reset Token inválido ou malformado. Não foi possível decodificá-lo.'
            });
        }

        // Busca o usuário pelo ID obtido no Reset Token
        const user = await userModel.getUserById(decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                messageEn: 'User not found.',
                messagePt: 'Usuário não encontrado.'
            });
        }

        // Valida a assinatura e a expiração do Reset Token usando o secret + senha antiga
        const uniqueSecret = process.env.JWT_SECRET + user.password;
        try {
            jwt.verify(resetToken, uniqueSecret);
        } catch (jwtError) {
            printConsoleError(jwtError);
            return res.status(400).json({
                success: false,
                messageEn: 'Invalid or expired Reset Token. Please request a new password reset.',
                messagePt: 'O Reset Token para recuperação de senha é inválido ou já expirou. Solicite um novo link.'
            });
        }

        // Estando tudo certo, criptografa a nova senha e atualiza no banco de dados
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.updatePasswordById(user.id, hashedPassword);

        // Gera novo Token de Autenticação para realizar o login automático do usuário
        const authToken = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                avatarUrl: user.avatar,
                role: user.role
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Cria o cookie HttpOnly idêntico ao processo de login
        res.cookie('authToken', authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        // Sucesso!
        return res.status(200).json({
            success: true,
            messageEn: 'Password reset successfully. Redirecting...',
            messagePt: 'Senha alterada com sucesso! Redirecionando...',
            redirectUrl: '/'
        });

    } catch (error) {
        printConsoleError(error);
        return res.status(500).json({
            success: false,
            messageEn: 'Internal server error. Contact the administrator.',
            messagePt: 'Erro no servidor. Tente novamente mais tarde ou entre em contato com o administrador.'
        });
    }
};