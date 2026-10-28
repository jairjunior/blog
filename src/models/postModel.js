const databasePool = require('../config/database');

/* O campo "status" da tabela post pode assumir os seguintes valores:
 * "published": O post está finalizado, aprovado e liberado para o público
 * "draft": O artigo ainda está sendo escrito ou revisado pelo autor.
 * "archived": Para posts antigos que você não quer mais exibir publicamente,
 *             mas também não quer deletar do banco de dados.
 * "scheduled": Para posts que vão ao ar automaticamente em uma data futura
 *              (trabalhando em conjunto com o campo published_at) - Opcional.
*/

/*****************************************************************************
/ Buscar todos os últimos posts publicados
/*****************************************************************************/
const getLatestPosts = async (numberOfPosts) => {

    try {
        const query = `
            SELECT 
                p.title, p.slug, p.summary, p.cover_image, p.published_at,
                c.name AS category_name, c.slug AS category_slug,
                CONCAT(u.first_name, ' ', u.last_name) AS author_name
            FROM posts p
            INNER JOIN categories c ON p.category_id = c.id
            INNER JOIN users u ON p.author_id = u.id
            WHERE p.status = 'published'
            ORDER BY p.published_at DESC
            LIMIT ?`;
        const [rows] = await databasePool.query(query, [numberOfPosts]);
        return rows;

    } catch (error) {
        console.error(`Error in postModel.getLatestPosts() when retrieving latest posts.`);
        throw error;
    }

}


/*****************************************************************************
/ Buscar todos os posts de uma categoria específica
/*****************************************************************************/
const getPostsByCategory = async (categorySlug) => {
    try {
        const query = `
            SELECT 
                p.title, p.slug, p.summary, p.cover_image, p.published_at,
                c.name AS category_name, c.slug AS category_slug,
                CONCAT(u.first_name, ' ', u.last_name) AS author_name
            FROM posts p
            INNER JOIN categories c ON p.category_id = c.id
            INNER JOIN users u ON p.author_id = u.id
            WHERE c.slug = ? AND p.status = 'published'
            ORDER BY p.published_at DESC;
        `;
        const [rows] = await databasePool.query(query, [categorySlug]);
        return rows;

    } catch(error) {
        console.error(`Error in postModel.getPostsByCategory() when retrieving posts from category [${categorySlug}].`);
        throw error;
    }
};


/*****************************************************************************
/ Busca post individual pelas suas slugs (Categoria + Título).
/*****************************************************************************/
const getPostBySlugs = async (categorySlug, postSlug) => {
    try {
        const query = `
            SELECT 
                p.id, p.title, p.slug, p.summary, p.content, p.cover_image, p.published_at,
                c.name          AS category_name,
                c.slug          AS category_slug,
                a.display_name  AS author_name, 
                a.bio           AS author_bio,
                a.created_at    AS author_created_at,
                u.avatar        AS author_avatar
            FROM posts p
            INNER JOIN categories c ON p.category_id = c.id
            INNER JOIN authors a ON p.author_id = a.user_id
            INNER JOIN users u ON u.id = a.user_id
            WHERE c.slug = ? 
                AND p.slug = ? 
                AND p.status = 'published'
            LIMIT 1;
        `;
        const [rows] = await databasePool.query(query, [categorySlug, postSlug]);
        return rows[0];

    } catch(error) {
        console.error(`Error in postModel.getPostBySlugs() when retrieving the post [${categorySlug}/${postSlug}].`);
        throw error;
    }
};


/*****************************************************************************
/ Busca apenas o ID de um post pelas suas slugs (Categoria + Título).
/*****************************************************************************/
const getPostIdBySlugs = async (categorySlug, postSlug) => {
    try {
        const query = `
            SELECT 
                p.id
            FROM posts p
            INNER JOIN categories c ON p.category_id = c.id
            WHERE c.slug = ? AND p.slug = ? 
            LIMIT 1;
        `;
        const [rows] = await databasePool.query(query, [categorySlug, postSlug]);
        return rows[0];

    } catch(error) {
        console.error(`Error in postModel.getPostIdBySlugs() when retrieving ID of the post [${categorySlug}/${postSlug}].`);
        throw error;
    }

}


/*****************************************************************************
/ Exporta as funções para serem utilizadas pela aplicação fora deste arquivo.
/*****************************************************************************/
module.exports = {
    getLatestPosts,
    getPostsByCategory,
    getPostBySlugs,
    getPostIdBySlugs
};