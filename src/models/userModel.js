const databasePool = require('../config/database');


/*****************************************************************************
/ Buscar usuário pelo id
/*****************************************************************************/
const getUserById = async (userId) => {
    try {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await databasePool.query(query, [userId]);
        return rows[0];

    } catch (error) {
        console.error(`\n❌ ERROR in userModel.getUserById() when retrieving user by id: [${userId}].`);
        throw error;
    }
}


/*****************************************************************************
/ Buscar usuário por e-mail
/*****************************************************************************/
const getUserByEmail = async (email) => {
    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await databasePool.query(query, [email]);
        return rows[0];

    } catch (error) {
        console.error(`\n❌ ERROR in userModel.getUserByEmail() when retrieving user by email [${email}].`);
        throw error;
    }
}


/*****************************************************************************
/ Atualizar senha do usuário pelo id
/*****************************************************************************/
const updatePasswordById = async (userId, hashedPassword) => {
    try {
        const query = 'UPDATE users SET password = ? WHERE id = ?';
        const [result] = await databasePool.query(query, [hashedPassword, userId]);
        return result;

    } catch (error) {
        console.error(`\n❌ ERROR in userModel.updatePasswordById() when updating password for user with id: [${userId}].`);
        throw error;
    }
}


/*****************************************************************************
/ Exporta as funções para serem utilizadas pela aplicação fora deste arquivo.
/*****************************************************************************/
module.exports = {
    getUserById,
    getUserByEmail,
    updatePasswordById
};