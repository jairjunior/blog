const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    // Verifica se o cabeçalho de autorização está presente 
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ 
            success: false,
            message: 'Access denied. No token provided.' 
        });
    }
    
    // Extrai as partes do cabeçalho e verifica se o formato é válido (Bearer <token>)
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ 
            success: false,
            message: 'Access denied. Invalid token format.' 
        });
    }

    // Extrai o token do cabeçalho de autorização
    const token = tokenParts[1];
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Access denied. No token provided.' 
        });
    }

    // Decodifica e verifica o token JWT
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).json({ 
                success: false,
                message: 'Invalid or expired token.'
            });
        }
        // Inclui as informações do usuário autenticado na requisição para uso posterior
        req.authenticatedUser = decoded;
        next();
    });

};