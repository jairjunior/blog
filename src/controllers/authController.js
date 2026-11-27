const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendNewUserVerificationEmail, sendResetPasswordEmail } = require('../services/emailService');
const { setAuthCookie } = require('../utils/authUtils');
const { printConsoleError, printConsoleWarning, printSecurityAudit } = require('../utils/logger');


/******************************************************************************
 * Função para tratar requisições POST no rota '/api/auth/register'
 *
 * Cadastra um novo usuário no sistema.
 *****************************************************************************/
exports.register = async (req, res) => {
    const { email, firstName, lastName, password } = req.body;

    // Verifica se todos os dados foram enviados
    if(!email || !firstName || !lastName || !password) {
        return res.status(400).json({ // HTTP 400 Bad Request
            success: false,
            messageEn: 'Please, provide all required information.',
            messagePt: 'Por favor, providencie todas as informações exigidas.'
        });
    }

    // Normalização
    const normalizedEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    // Validação de formato de e-mail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ // HTTP 400 Bad Request
            success: false,
            messageEn: 'Invalid email format.',
            messagePt: 'Formato de e-mail inválido.'
        });
    }

    // Verifica a complexidade de senha
    if (!isStrongPassword(password)) {
        return res.status(400).json({ // HTTP 400 Bad Request
            success: false,
            messageEn: 'Password does not meet the minimum complexity requirements.',
            messagePt: 'A senha informada não atende aos requisitos mínimos de complexidade.'
        });
    }

    /*-----------------------------------------------------------------------*/
    try {
        // Faz hash da senha e cria novo usuário no banco de dados
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUserId = await userModel.createUser(normalizedEmail, cleanFirstName, cleanLastName, hashedPassword);

        // Cria um Token JWT de Verificação para ser enviado por o e-mail, válido por 24 horas.
        const verificationToken = jwt.sign({ 
                userId: newUserId,
                userEmail: normalizedEmail
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
        // Se der erro no envio, adiciona uma query string indicando que o e-mail falhou
        // ao ser despachado. Essa flag irá influenciar na renderização da view
        // account-verify-info.ejs, para onde o usuário será redirecionado na sequência.
        const userName = `${cleanFirstName} ${cleanLastName}`;
        try {
            await sendNewUserVerificationEmail(normalizedEmail, userName, verificationUrl);
        } catch (emailError) {
            printConsoleError('AUTH_ERROR_SEND_VERIFICATION_EMAIL', emailError);
            redirectUrl = '/informacoes-para-verificar-conta?error=email_failed';
        }

        // Configura as informações do novo usuário para serem colocadas na payload
        // do Token JWT de Autenticação. Neste momento, o usuário ainda consta como "não verificado".
        // O objeto newUser deve ser montado de acordo com o esquema do banco de dados.
        const newUser = {
            id: newUserId, 
            email: normalizedEmail,
            first_name: cleanFirstName,
            last_name: cleanLastName,
            avatar_url: null,
            role: 'reader',
            is_verified: false
        };

        // Cria Token JWT de Autenticação e 
        // salva em um cookie no navegador do usuário
        setAuthCookie(res, newUser);

        // Cookie efêmero de transição para sinalizar primeiro acesso pós-cadastro
        res.cookie('verifyContext', 'registered', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 1000
        });

        // Sucesso!
        printSecurityAudit(
            'AUTH_AUDIT_USER_CREATED', 
            `Novo usuário registrado com sucesso. ID: [${newUserId}], E-mail: [${normalizedEmail}], IP: [${req.ip}]`
        );
        return res.status(201).json({ // HTTP 201 Created
            success: true,
            redirectUrl: redirectUrl,
            messageEn: `User [${normalizedEmail}] registered successfully. Still needs confirmation.`,
            messagePt: `Usuário [${normalizedEmail}] registrado com sucesso. Ainda necessita de confirmação.`
        });

    /*-----------------------------------------------------------------------*/
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            printConsoleWarning(
                'AUTH_WARN_REGISTER_DUPLICATE_EMAIL', 
                `Tentativa de cadastro com e-mail já existente: [${normalizedEmail}] originada do IP: [${req.ip}]`
            );
            return res.status(409).json({ // HTTP 409 Conflict
                success: false, 
                messageEn: 'Email already exists.',
                messagePt: 'O e-mail informado já está cadastrado.'
            });
        } else {
            printConsoleError('AUTH_ERROR_REGISTER_NEW_USER', error);
            return res.status(500).json({ // HTTP 500 Internal Server Error 
                success: false,
                messageEn: 'Internal server error. Please try again later or contact the administrator.',
                messagePt: 'Erro interno do servidor. Tente novamente mais tarde ou entre em contato com o administrador.'
            });
        }
    }

};


/******************************************************************************
 * Função para tratar requisições POST no rota '/api/auth/login'
 *
 * Efetua login e autentica o usuário existente gerando um token JWT que será
 * armazenado como cookie no navegador do usuário.
 *****************************************************************************/
exports.login = async (req, res) => {
    const { email, password, redirectTo } = req.body;

    // Verifica se todos os dados foram enviados pelo formulário
    if(!email || !password) {
        return res.status(400).json({ // HTTP 400 Bad Request
            success: false,
            messageEn: 'Please provide both email and password.',
            messagePt: 'Por favor, providencie o e-mail e a senha para realizar o login.'
        });
    }

    // Normalização
    const normalizedEmail = email.trim().toLowerCase();

    /*-----------------------------------------------------------------------*/
    try{
        // Busca usuário no banco de dados pelo e-mail
        const user = await userModel.getUserByEmail(normalizedEmail);
        if (!user) {
            printConsoleWarning(
                'AUTH_WARN_LOGIN_EMAIL_NOT_FOUND', 
                `Tentativa de login para e-mail não cadastrado: [${normalizedEmail}] originada do IP: [${req.ip}]`
            );
            return res.status(401).json({ // HTTP 401 Unauthorized
                success: false,
                messageEn: 'Invalid email or password.',
                messagePt: 'E-mail e/ou senha inválidos.'
            });
        }

        // Verifica se a senha informada está correta
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            printConsoleWarning(
                'AUTH_WARN_LOGIN_WRONG_PASSWORD', 
                `Falha de autenticação (senha incorreta) para o usuário ID: [${user.id}], E-mail: [${user.email}], IP: [${req.ip}]`
            );
            return res.status(401).json({ // HTTP 401 Unauthorized
                success: false,
                messageEn: 'Invalid email or password.',
                messagePt: 'E-mail e/ou senha inválidos.'
            });
        }

        // Cria Token JWT de Autenticação e 
        // salva em um cookie no navegador do usuário
        setAuthCookie(res, user);
        
        // Verifica a URL de redirecionamento
        const isSafeUrl = typeof redirectTo === 'string' && 
                  redirectTo.startsWith('/') && 
                  !redirectTo.startsWith('//') && 
                  !redirectTo.includes('\\');
        const safeRedirect = isSafeUrl ? redirectTo : '/';

        // Sucesso!
        printSecurityAudit(
            'AUTH_AUDIT_LOGIN_SUCCESS', 
            `Login bem-sucedido para o usuário ID: [${user.id}], E-mail: [${user.email}], IP: [${req.ip}]`
        );
        return res.status(200).json({ // HTTP 200 OK
            success: true,
            messageEn: 'Login successful.',
            messagePt: 'Login realizado com sucesso.',
            redirectUrl: safeRedirect
        });
    
    /*-----------------------------------------------------------------------*/
    } catch (error) {
        printConsoleError('AUTH_ERROR_LOGIN', error);
        return res.status(500).json({ // HTTP 500 Internal Server Error 
            success: false,
            messageEn: 'Internal server error. Contact the administrator.',
            messagePt: 'Erro no servidor. Tente novamente mais tarde ou entre em contato com o administrador.'
        });

    }
};


/******************************************************************************
 * Função para tratar requisições GET no rota '/api/auth/logout'
 *
 * Faz logout da aplicação invalidando o token de autenticação no navegador 
 * do usuário.
 *****************************************************************************/
exports.logout = async (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true em produção (HTTPS)
        sameSite: 'strict'
    });

    const userIdentifier = res.locals.currentUser 
        ? `ID: [${res.locals.currentUser.id}], E-mail: [${res.locals.currentUser.email}]` 
        : 'Sessão anônima';
    printSecurityAudit(
        'AUTH_AUDIT_LOGOUT', 
        `Logout efetuado para: ${userIdentifier}, IP: [${req.ip}]`
    );

    let safeLogoutRedirect = '/';
    const referer = req.get('referer');
    if (referer) {
        try {
            const parsedUrl = new URL(referer);
            const currentHost = req.get('host');
            if (parsedUrl.host === currentHost && ['http:', 'https:'].includes(parsedUrl.protocol)) {
                safeLogoutRedirect = `${parsedUrl.pathname}${parsedUrl.search}`;
            }
        } catch {
            safeLogoutRedirect = '/';
        }
    }
    return res.redirect(safeLogoutRedirect);
}


/******************************************************************************
 * Função para tratar requisições POST no rota '/api/auth/forgot-password'
 * 
 * Envia e-mail de recuperação de senha para o usuário.
 *****************************************************************************/
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ // HTTP 400 Bad Request
            success: false,
            messageEn: 'Please provide an email address.',
            messagePt: 'Por favor, forneça um endereço de e-mail.'
        });
    }

    // Normalização
    const normalizedEmail = email.trim().toLowerCase();

    /*-----------------------------------------------------------------------*/
    try {
        const user = await userModel.getUserByEmail(normalizedEmail);
        
        // Se o e-mail cadastrado não existir, retorna status de sucesso para omitir a informação
        // e evitar ataques de email enumeration.
        if (!user) {
            printConsoleWarning(
                'AUTH_WARN_FORGOT_EMAIL_NOT_FOUND',
                `Tentativa de recuperação de senha para e-mail não cadastrado: [${normalizedEmail}], IP: [${req.ip}]`
            );
            return res.status(200).json({ // HTTP 200 OK
                success: true,
                messageEn: 'If the email is registered, a link to reset your password has been sent.',
                messagePt: 'Se o e-mail estiver cadastrado, um link para redefinir sua senha foi enviado. Verifique sua caixa de entrada e também a caixa de spam (lixo eletrônico).'
            });
        }

        // Cria um Token JWT de Reset válido por 15 minutos
        // O uniqueSecret concatena a senha atual do usuário. 
        // Assim que a senha for trocada, o resetToken ficará inválido.
        const userPasswordHash = user.password;
        const uniqueSecret = process.env.JWT_SECRET + userPasswordHash;
        const resetToken = jwt.sign({
                userId: user.id,
                userEmail: user.email
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
        printSecurityAudit(
            'AUTH_AUDIT_PASSWORD_RESET_REQUESTED', 
            `Link de recuperação de senha gerado e enviado para o usuário ID: [${user.id}], E-mail: [${user.email}], IP: [${req.ip}]`
        );
        return res.status(200).json({ // HTTP 200 OK
            success: true,
            messageEn: 'If the email is registered, a link to reset your password has been sent.',
            messagePt: 'Se o e-mail estiver cadastrado, um link para redefinir sua senha foi enviado. Verifique sua caixa de entrada e também a caixa de spam (lixo eletrônico).'
        });

    /*-----------------------------------------------------------------------*/
    } catch (error) {
        printConsoleError('AUTH_ERROR_FORGOT_PASSWORD', error);
        return res.status(500).json({ // HTTP 500 Internal Server Error
            success: false,
            messageEn: 'An internal error occurred while processing the request.',
            messagePt: `Ocorreu um erro interno ao processar a solicitação.\nTente novamente mais tarde ou entre em contato com o administrador.`
        });
    }
};


/******************************************************************************
 * Função para tratar requisições POST no rota '/api/auth/reset-password'
 * 
 * Atualiza a senha do usuário na base de dados.
 *****************************************************************************/
exports.resetPassword = async (req, res) => {
    const { resetToken, password } = req.body;

    // Verifica se todos os dados foram enviados
    if (!resetToken || !password) {
        return res.status(400).json({ // HTTP 400 Bad Request
            success: false,
            messageEn: 'Please, provide all required information.',
            messagePt: 'Por favor, providencie todas as informações exigidas.'
        });
    }

    // Verifica a complexidade de senha
    if (!isStrongPassword(password)) {
        return res.status(400).json({ // HTTP 400 Bad Request
            success: false,
            messageEn: 'Password does not meet the minimum complexity requirements.',
            messagePt: 'A senha informada não atende aos requisitos mínimos de complexidade.'
        });
    }

    /*-----------------------------------------------------------------------*/
    try {
        // Decodifica o payload do Reset Token
        const decoded = jwt.decode(resetToken);
        if (!decoded || !decoded.userId || !decoded.userEmail) {
            return res.status(400).json({ // HTTP 400 Bad Request
                success: false,
                messageEn: 'Invalid or malformed Reset Token.\nCould not decode it.',
                messagePt: 'Reset Token inválido ou malformado.\nNão foi possível decodificá-lo.'
            });
        }

        // Busca o usuário pelo ID obtido no Reset Token
        const user = await userModel.getUserById(decoded.userId);
        if (!user) {
            return res.status(404).json({ // HTTP 404 Not Found
                success: false,
                messageEn: 'User not found.',
                messagePt: 'Usuário não encontrado.'
            });
        }

        // Valida o Token JWT de Reset usando o secret + senha antiga
        const uniqueSecret = process.env.JWT_SECRET + user.password;
        try {
            jwt.verify(resetToken, uniqueSecret);
        } catch (_) {
            printConsoleWarning(
                'AUTH_WARN_RESET_TOKEN_INVALID', 
                `Tentativa de redefinição de senha com token inválido ou expirado. Usuário ID: [${user.id}], E-mail: [${user.email}], IP: [${req.ip}]`
            );
            return res.status(400).json({ // HTTP 400 Bad Request
                success: false,
                messageEn: 'Invalid or expired Reset Token. Please request a new password reset.',
                messagePt: `O Reset Token para recuperação de senha é inválido ou já expirou.\nSolicite um novo link.`
            });
        }

        // Estando tudo certo, criptografa a nova senha e atualiza no banco de dados
        // Neste momento, o resetToken deixa de ser válido, pois a senha mudou.
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.updatePasswordById(user.id, hashedPassword);

        // Cria novo Token JWT de Autenticação e
        // salva em um cookie no navegador do usuário
        setAuthCookie(res, user);

        // Sucesso!
        printSecurityAudit(
            'AUTH_AUDIT_PASSWORD_CHANGED', 
            `Senha alterada com sucesso para o usuário ID: [${user.id}], E-mail: [${user.email}], IP: [${req.ip}]`
        );
        return res.status(200).json({ // HTTP 200 OK
            success: true,
            messageEn: 'Password reset successfully.',
            messagePt: `Senha alterada com sucesso!\nVocê será redirecionado para a página inicial em alguns segundos.`
        });

    /*-----------------------------------------------------------------------*/
    } catch (error) {
        printConsoleError('AUTH_ERROR_RESET_PASSWORD', error);
        return res.status(500).json({ // HTTP 500 Internal Server Error
            success: false,
            messageEn: 'Internal server error. Contact the administrator.',
            messagePt: `Erro no servidor.\nTente novamente mais tarde ou entre em contato com o administrador.`
        });
    }
};


/******************************************************************************
 * Função para tratar requisições POST na rota '/api/auth/resend-verification-email'
 * 
 * Reenvia o e-mail de ativação de conta com um novo Token JWT de Verificação (24h).
 * Protege contra enumeração de usuários e contas já verificadas.
 *****************************************************************************/
exports.resendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    // Validação defensiva do input
    if (!email) {
        return res.status(400).json({ // HTTP 400 Bad Request
            success: false,
            messageEn: 'Please provide an email address.',
            messagePt: 'Por favor, forneça o endereço de e-mail.'
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    /*-----------------------------------------------------------------------*/
    try {
        // Busca o usuário no banco de dados
        const user = await userModel.getUserByEmail(normalizedEmail);

        // Se o usuário não existir, logamos internamente e respondemos com sucesso genérico
        // para mitigar ataques de enumeração de e-mails (OWASP A07)
        if (!user) {
            printConsoleWarning(
                'AUTH_WARN_RESEND_EMAIL_NOT_FOUND',
                `Tentativa de reenvio de e-mail de confirmação para e-mail não cadastrado: [${normalizedEmail}], IP: [${req.ip}]`
            );
            return res.status(200).json({ // HTTP 200 OK
                success: true,
                messageEn: 'If the email is unverified, a new link has been sent.',
                messagePt: 'Se o e-mail estiver pendente de ativação, um novo link de confirmação foi enviado.'
            });
        }

        // Se a conta já estiver verificada, avisa o usuário
        if (user.is_verified) {
            return res.status(400).json({ // HTTP 400 Bad Request
                success: false,
                messageEn: 'This account has already been verified. You can log in.',
                messagePt: 'Esta conta já foi ativada. Você já pode fazer login normalmente.'
            });
        }

        // Gera novo Token JWT de Verificação válido por 24 horas
        const verificationToken = jwt.sign(
            { 
                userId: user.id,
                userEmail: user.email 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // Constrói o link absoluto
        const protocol = req.protocol;
        const host = req.get('host');
        const verificationUrl = `${protocol}://${host}/verificar-conta?verificationToken=${verificationToken}`;
        const userName = `${user.first_name} ${user.last_name}`;

        // Envia o e-mail
        await sendNewUserVerificationEmail(user.email, userName, verificationUrl);

        // Sucesso!
        printSecurityAudit(
            'AUTH_AUDIT_VERIFY_EMAIL_RESENT', 
            `Reenvio de e-mail de ativação disparado para o usuário ID: [${user.id}], E-mail: [${user.email}], IP: [${req.ip}]`
        );
        return res.status(200).json({ // HTTP 200 OK
            success: true,
            messageEn: 'A new verification link has been sent to the registered email address.',
            messagePt: 'Um novo link de verificação foi enviado para o e-mail cadastrado.'
        });

    /*-----------------------------------------------------------------------*/
    } catch (error) {
        printConsoleError('AUTH_ERROR_RESEND_VERIFICATION_EMAIL', error);
        return res.status(500).json({ // HTTP 500 Internal Server Error 
            success: false,
            messageEn: 'Internal server error while resending verification email.',
            messagePt: 'Erro no servidor ao reenviar e-mail de confirmação. Tente novamente mais tarde.'
        });
    }
};


/******************************************************************************
 * Função auxiliar para verificar a complexidade da senha.
 * 
 * Essa verificação será feita no momento do registro e no momento de 
 * redefinição de senha.
 *****************************************************************************/
function isStrongPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.\-_])[A-Za-z\d@$!%*?&#.\-_]{8,}$/;
    return passwordRegex.test(password);
}