const databasePool = require('../config/database');

/*****************************************************************************
/ Cria um comentário atrelado a um determinado post
/*****************************************************************************/
const createComment = async (postId, userId, commentContent) => {
    try {
        const query = `
            INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)
        `;
        const [rows] = await databasePool.query(query, [postId, userId, commentContent]);
        return rows[0];

    } catch(error) {
        console.error(`Error in postModel.createComment() when creating
            comment for post with ID [${postId}]:\n`, error);
        throw error;
    }
}


/*****************************************************************************
/ Cria um comentário atrelado a um determinado post
/*****************************************************************************/
const getComments = async (postId) => {
    try {
        const query = `
            SELECT 
                c.id,
                c.content,
                c.created_at,
                CONCAT(u.first_name, ' ', u.last_name) AS user_name
            FROM comments c
            INNER JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
            LIMIT 20;
        `;
        const [rows] = await databasePool.query(query, [postId]);
        return rows;

    } catch(error){
        console.error(`Error in postModel.getComments() when retrieving
            comment for post with ID [${postId}]:\n`, error);
        throw error;
    }
}


/*****************************************************************************
/ Busca o último comentário de um determinado usuário
/*****************************************************************************/
const getLastCommentTimeByUser = async (postId, userId) => {
    try {
        const query = `
            SELECT TIMESTAMPDIFF(SECOND, created_at, NOW()) AS seconds_elapsed 
            FROM comments 
            WHERE post_id = ? AND user_id = ? 
            ORDER BY created_at DESC LIMIT 1;
        `;
        const [rows] = await databasePool.query(query, [postId, userId]);
        return rows;

    } catch(error){
        console.error(`Error in postModel.getLastCommentByUser() when retrieving 
            last comment for post with ID [${postId}] and user with ID [${userId}]:\n`, error);
        throw error;
    }
}

/*****************************************************************************
/ Exporta as funções para serem utilizadas pela aplicação fora deste arquivo.
/*****************************************************************************/
module.exports = {
    createComment,
    getComments,
    getLastCommentTimeByUser
};