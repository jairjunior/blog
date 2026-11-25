const databasePool = require('../config/database');

/* O campo "status" da tabela post pode assumir os seguintes valores:
 * "published": O post está finalizado, aprovado e liberado para o público
 * "draft": O artigo ainda está sendo escrito ou revisado pelo autor.
 * "archived": Para articles antigos que você não quer mais exibir publicamente,
 *             mas também não quer deletar do banco de dados.
 * "scheduled": Para articles que vão ao ar automaticamente em uma data futura
 *              (trabalhando em conjunto com o campo published_at) - Opcional.
*/

/*****************************************************************************
/ Buscar todos os últimos articles publicados
/*****************************************************************************/
const getLatestArticles = async (numberOfArticles) => {

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
        const [rows] = await databasePool.query(query, [numberOfArticles]);
        return rows;

    } catch (error) {
        console.error(`Error in postModel.getLatestArticles() when retrieving latest articles.`);
        throw error;
    }

}


/*****************************************************************************
/ Buscar todos os artigos de uma categoria específica
/*****************************************************************************/
const getArticlesByCategory = async (categorySlug) => {
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
        console.error(`Error in postModel.getArticlesByCategory() when retrieving articles from category [${categorySlug}].`);
        throw error;
    }
};


/*****************************************************************************
/ Busca post individual pelas suas slugs (Categoria + Título).
/*****************************************************************************/
const getArticleBySlugs = async (categorySlug, articleSlug) => {
    try {
        const query = `
            SELECT 
                p.id, p.title, p.slug, p.summary, p.content, p.cover_image, p.published_at,
                c.name          AS category_name,
                c.slug          AS category_slug,
                a.display_name  AS author_name, 
                a.bio           AS author_bio,
                a.created_at    AS author_created_at,
                u.avatar_url    AS author_avatar
            FROM posts p
            INNER JOIN categories c ON p.category_id = c.id
            INNER JOIN authors a ON p.author_id = a.user_id
            INNER JOIN users u ON u.id = a.user_id
            WHERE c.slug = ? 
                AND p.slug = ? 
                AND p.status = 'published'
            LIMIT 1;
        `;
        const [rows] = await databasePool.query(query, [categorySlug, articleSlug]);
        return rows[0];

    } catch(error) {
        console.error(`Error in postModel.getArticleBySlugs() when retrieving the post [${categorySlug}/${articleSlug}].`);
        throw error;
    }
};


/*****************************************************************************
/ Busca apenas o ID de um post pelas suas slugs (Categoria + Título).
/*****************************************************************************/
const getArticleIdBySlugs = async (categorySlug, articleSlug) => {
    try {
        const query = `
            SELECT 
                p.id
            FROM posts p
            INNER JOIN categories c ON p.category_id = c.id
            WHERE c.slug = ? AND p.slug = ? 
            LIMIT 1;
        `;
        const [rows] = await databasePool.query(query, [categorySlug, articleSlug]);
        return rows[0];

    } catch(error) {
        console.error(`Error in postModel.getArticleIdBySlugs() when retrieving ID of the post [${categorySlug}/${articleSlug}].`);
        throw error;
    }

}


/*****************************************************************************
/ Exporta as funções para serem utilizadas pela aplicação fora deste arquivo.
/*****************************************************************************/
module.exports = {
    getLatestArticles,
    getArticlesByCategory,
    getArticleBySlugs,
    getArticleIdBySlugs
};