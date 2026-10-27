const databasePool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/*****************************************************************************/
// Função para registrar um novo usuário
/*****************************************************************************/
exports.register = async (req, res) => {

    const { email, first_name, last_name, password } = req.body;
    if(!email || !first_name || !last_name || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Please, provide all required fields.'
        });
    }

    try {
        // Cria hash da senha e insere novo usuário no banco de dados
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)';
        await databasePool.query(query, [email, first_name, last_name, hashedPassword]);    
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully.'
        });

    } catch (error) {
        console.error('ERROR in authController.register():\n', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false, 
                message: 'Email already exists.' 
            });
        }
        return res.status(500).json({ 
            success: false,
            message: 'Database error. Contact the administrator.',
        });

    }
};


/*****************************************************************************/
// Função para fazer login e autenticar um usuário existente
/*****************************************************************************/
exports.login = async (req, res) => {
    
    const { email, password } = req.body;
    if(!email || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Please provide both email and password.' 
        });
    }

    try{
        // Busca no banco de dados o usuário pelo email fornecido
        const query = 'SELECT * FROM users WHERE email = ?';
        const [result] = await databasePool.query(query, [email]);
        if (result.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Compara a senha fornecida com a senha armazenada no banco de dados
        const [user] = result;
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Gera um token JWT para o usuário autenticado
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

        // Retorna o token JWT para o cliente
        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            success: true,
            message: 'Login successful.'
        });

    } catch (error) {
        console.error('ERROR in authController.login():\n', error);
        return res.status(500).json({ 
            success: false,
            message: 'Database error. Contact the administrator.',
        });

    }
};