const databasePool = require('../config/database');


/*****************************************************************************
/ Função para tratar requisições POST no caminho '/posts'
/ Cria um novo post para o blog
/*****************************************************************************/
exports.createPost = async (req, res) => {

    res.status(200).json({
        success: true,
        message: 'Post created successfully!'
    });

}