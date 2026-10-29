const databasePool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/*****************************************************************************/
// Função para registrar um novo usuário.
/*****************************************************************************/
exports.register = async (req, res) => {

    const { email, first_name, last_name, password } = req.body;
    if(!email || !first_name || !last_name || !password) {
        return res.status(400).json({ 
            success: false,
            messageEn: 'Please, provide all required fields.',
            messagePt: 'Por favor, providencie todos os campos exigidos.'
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)';
        await databasePool.query(query, [email, first_name, last_name, hashedPassword]);    
        
        res.status(201).json({
            success: true,
            messageEn: 'User registered successfully.',
            messagePt: 'Usuário registrado com sucesso.'
        });

    } catch (error) {
        console.error('ERROR in authController.register():\n', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false, 
                messageEn: 'Email already exists.',
                messagePt: 'O e-mail informado já está cadastrado.'
            });
        }
        return res.status(500).json({ 
            success: false,
            messageEn: 'Internal server error. Contact the administrator.',
            messagePt: 'Erro no servidor. Entre em contato com o administrador.'
        });

    }
};


/*****************************************************************************/
// Função para fazer login e autenticar um usuário existente.
/*****************************************************************************/
exports.login = async (req, res) => {
    
    const { email, password, redirectTo } = req.body;
    if(!email || !password) {
        return res.status(400).json({ 
            success: false,
            messageEn: 'Please provide both email and password.',
            messagePt: 'Por favor, providencie o e-mail e a senha para realizar o login.'
        });
    }

    try{
        const query = 'SELECT * FROM users WHERE email = ?';
        const [result] = await databasePool.query(query, [email]);
        if (result.length === 0) {
            return res.status(401).json({ 
                success: false,
                messageEn: 'Invalid email or password.',
                messagePt: 'E-mail e/ou senha inválidos.'
            });
        }

        const [user] = result;
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ 
                success: false,
                messageEn: 'Invalid email or password.',
                messagePt: 'E-mail e/ou senha inválidos.'
            });
        }

        const jwtToken = jwt.sign({ 
                id: user.id, 
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });
        
        const safeRedirect = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/';
        return res.status(200).json({
            success: true,
            messageEn: 'Login successful.',
            messagePt: 'Login realizado com sucesso.',
            redirectUrl: safeRedirect
        });

    } catch (error) {
        console.error('ERROR in authController.login():\n', error);
        return res.status(500).json({ 
            success: false,
            messageEn: 'Internal server error. Contact the administrator.',
            messagePt: 'Erro no servidor. Entre em contato com o administrador.'
        });

    }
};


/*****************************************************************************/
// Função para fazer logout da aplicação.
/*****************************************************************************/
exports.logout = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true em produção (HTTPS)
        sameSite: 'strict'
    });
    const redirectTo = req.get('referer') || '/';
    return res.redirect(redirectTo);
}