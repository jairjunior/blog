const jwt = require('jsonwebtoken');

/******************************************************************************
 * Função utilitária para gerar o Token JWT de Autenticação e salvar o 
 * cookie HttpOnly no navegador do usuário.
 * 
 * A sessão do usuário irá expirar em 2 horas. Da mesma forma, o cookie será 
 * destruído no lado do cliente também em 2 horas para amnter o sincronismo.
 *****************************************************************************/
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
        { expiresIn: '2h' } // Token expira em 2 horas
    );

    // Cria e injeta o cookie HttpOnly no objeto de resposta do Express (res)
    res.cookie('authToken', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2 * 60 * 60 * 1000 // Cookie também expira em 2 horas
    });

};


/******************************************************************************
 * Exporta as funções para serem utilizadas pela aplicação.
 *****************************************************************************/
module.exports = {
    setAuthCookie 
};