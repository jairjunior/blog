const databasePool = require('../config/database');


/*****************************************************************************
/ Buscar todos os posts de uma categoria específica
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
        console.error(`Error in postModel.getLatestPosts() when retrieving latest posts.\n`, error);
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
        console.error(`Error in postModel.getPostsByCategory() when retrieving posts from category [${categorySlug}]:\n`, error);
        throw error;
    }
};


/*****************************************************************************
/ Busca post individual por Categoria + Slug
/*****************************************************************************/
const getPostByCategoryAndSlug = async (categorySlug, postSlug) => {
    try {
        const query = `
            SELECT 
                p.title, p.slug, p.summary, p.content, p.cover_image, p.published_at,
                c.name AS category_name, c.slug AS category_slug,
                CONCAT(u.first_name, ' ', u.last_name) AS author_name
            FROM posts p
            INNER JOIN categories c ON p.category_id = c.id
            INNER JOIN users u ON p.author_id = u.id
            WHERE c.slug = ? AND p.slug = ? AND p.status = 'published'
            LIMIT 1;
        `;
        const [rows] = await databasePool.query(query, [categorySlug, postSlug]);
        return rows[0];

    } catch(error) {
        console.error(`Error in postModel.getPostByCategoryAndSlug() when retrieving the post [${categorySlug}/${postSlug}]:\n`, error);
        throw error;
    }
};


/*****************************************************************************
/ Exporta as funções para serem utilizadas pela aplicação fora deste arquivo.
/*****************************************************************************/
module.exports = {
    getLatestPosts,
    getPostByCategoryAndSlug,
    getPostsByCategory
};