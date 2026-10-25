const databasePool = require('../config/database');


/*****************************************************************************
/ Busca as informações de uma categoria por meio da slug.
/*****************************************************************************/
const getCategoryBySlug = async (categorySlug) => {
    try {
        const query = `SELECT * FROM categories WHERE slug = ?`;
        const [rows] = await databasePool.query(query, [categorySlug]);
        return rows[0];

    } catch(error) {
        console.error(`Error in categoryModel.getCategoryBySlug() when retrieving category [${categorySlug}]:\n`, error);
        throw error;
    }
};


module.exports = {
    getCategoryBySlug
};