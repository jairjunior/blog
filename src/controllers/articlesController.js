/******************************************************************************
 * Função para tratar requisições POST no caminho '/api/articles'
 * Cria um novo artigo para o site.
 *****************************************************************************/
exports.createArticle = async (req, res) => {

    return res.status(200).json({
        success: true,
        message: 'Article created successfully!'
    });

}