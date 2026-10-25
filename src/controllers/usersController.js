const databasePool = require('../config/database');

/*****************************************************************************
/ Função para tratar requisições GET no caminho /api/users
/ Obtém os dados de todos os usuários cadastrados.
/ Apenas um Admin. autenticado tem permissão para executar essa função.
/*****************************************************************************/
exports.getAllUsers = async (req, res) => {

    // Confere se o usuário que fez a requisição é um Admin
    if (!isAdmin(req)) {
        console.log(`usersController.getAllUsers(): Access denied for user ${req.authenticatedUser.email} with role '${req.authenticatedUser.role}'.`);
        return res.status(403).json({ 
            success: false,
            message: 'Access denied. Admins only.' 
        });
    }

    try {
        const [users] = await databasePool.query('SELECT * FROM users');
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully.',
            data: users
        });

    } catch (error) {
        console.error('ERROR in usersController.getAllUsers():\n', error);
        res.status(500).json({ 
            success: false, 
            message: 'Database error. Contact the administrator.'
        });
    }

}


/*****************************************************************************
/ Função para tratar requisições GET no caminho /api/users/profile
/ Busca o perfil do usuário autenticado no sistema.
/*****************************************************************************/
exports.getProfile = async (req, res) => {
    
    const userId = req.authenticatedUser.id;

    try {
        const query = 'SELECT id, first_name, last_name, email, role, created_at, modified_at FROM users WHERE id = ?';
        const [user] = await databasePool.query(query, [userId]);
        res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully.',
            data: user
        });

    } catch (error) {
        console.error('ERROR in usersController.getProfile():\n', error);
        res.status(500).json({ 
            success: false,
            message: 'Database error. Contact the administrator.'
        });

    }

}


/*****************************************************************************
/ Função para tratar requisições GET no caminho /api/users/:id
/ Busca os dados de um usuário pelo id.
/*****************************************************************************/
exports.getUserById = async (req, res) => {

    const userId = req.params.id;

    // Confere se o usuário que fez a requisição é o mesmo que está sendo buscado ou se é um Admin
    if (req.authenticatedUser.id !== parseInt(userId) && !isAdmin(req)) {
        console.log(`usersController.getUserById(): Access denied for user ${req.authenticatedUser.email} with role '${req.authenticatedUser.role}' trying to get user with ID ${userId}.`);
        return res.status(403).json({ 
            success: false,
            message: 'Access denied. You can only view your own profile, or you must be an administrator.' 
        });
    }


    try {
        

    } catch (error) {
        console.error('ERROR in usersController.getUserById():\n', error);
        res.status(500).json({ 
            success: false,
            message: 'Database error. Contact the administrator.'
        });
    }

}


/*****************************************************************************
/ Função para tratar requisições PUT no caminho /api/users/:id
/ Atualiza os dados do usuário informado pelo id.
/ Apenas o próprio usuário (se autenticado) ou um Admin. poderão alterar os 
/ dados.
/*****************************************************************************/
exports.updateUser = async (req, res) => {

    const userId = req.params.id;

    // Confere se o usuário que fez a requisição é o mesmo que está sendo atualizado ou se é um Admin
    if (req.authenticatedUser.id !== parseInt(userId) && !isAdmin(req)) {
        console.log(`usersController.updateUser(): Access denied for user ${req.authenticatedUser.email} with role '${req.authenticatedUser.role}' trying to update user ID ${userId}.`);
        return res.status(403).json({ 
            success: false,
            message: 'Access denied. You can only update your own profile, or you must be an administrator.' 
        });
    }

    const { first_name, last_name, email } = req.body;

    try {
        const query = 'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?';
        await databasePool.query(query, [first_name, last_name, email, userId]);
        res.status(200).json({
            success: true,
            message: 'User updated successfully.'
        });

    } catch (error) {
        console.error('ERROR in usersController.updateUser():\n', error);
        res.status(500).json({ 
            success: false,
            message: 'Database error. Contact the administrator.'
        });
    }

}




/*****************************************************************************
/ Função auxiliar para dizer se o usuário autenticado é um Admin.
/*****************************************************************************/
function isAdmin(req) {
    if (req.authenticatedUser.role === 'admin'){
        return true;
    } else {
        return false;
    }
}