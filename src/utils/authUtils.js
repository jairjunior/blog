const jwt = require('jsonwebtoken');

/******************************************************************************
/ Função utilitária para gerar o Token JWT de Autenticação e salvar o 
/ cookie HttpOnly no navegador do usuário.
/*****************************************************************************/
const setAuthCookie = (res, user) => {
    // Cria Token JWT de Autenticação
    const authToken = jwt.sign(
        { 
            id: user.id, 
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: user.avatar_url,
            role: user.role,
            isVerified: Boolean(user.is_verified)
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '2h' } // 2h
    );

    // Cria e injeta o cookie HttpOnly no objeto de resposta do Express (res)
    res.cookie('authToken', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

};

module.exports = {
    setAuthCookie 
};