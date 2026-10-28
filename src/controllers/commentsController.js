const commentModel = require('../models/commentModel');
const postModel = require('../models/postModel');


/*****************************************************************************
/ Função para tratar requisições POST no caminho 
/ '/posts/:categorySlug/:postSlug/comments'
/ 
/ Registra um novo comentário no post especificado na URL.
/ Verifica se o token está válido, senão, solicita novo login do usuário.
/*****************************************************************************/
const postComment = async (req, res) => {
    
    if(res.locals.tokenExpired === true){
        return res.status(401).json({
            success: false,
            messageEn: 'Expired token. Please log in again to submit your comment.',
            messagePt: 'Token expirado. Por favor, realize o login novamente para submeter seu comentário.'
        });
    }
    if(res.locals.isLoggedIn === false){
        return res.status(401).json({
            success: false,
            messageEn: 'You need to be logged in to comment.',
            messagePt: 'Você precisa estar logado para comentar.'
        });
    }

    const { commentContent } = req.body;
    if (!commentContent || commentContent.trim() === ''){
        return res.status(400).json({
            success: false,
            messageEn: 'Comments cannot be empty.',
            messagePt: 'Comentários não podem estar vazios.'
        });
    }

    try{
        const { categorySlug, postSlug } = req.params;
        const userId = res.locals.currentUser.id;

        const { id: postId } = await postModel.getPostIdBySlugs(categorySlug, postSlug);
        if(!postId){
            return res.status(404).json({ 
                success: false,
                messageEn: 'Post not found.',
                messagePt: 'Post não encontrado.'
            });
        }

        const { commentIsAllowed, remainingSeconds } = await validateCommentFrequency(postId, userId);
        if(!commentIsAllowed){
            return res.status(429).json({ // 429 = Too Many Requests
                success: false,
                messageEn: `Wait ${remainingSeconds} seconds to comment again.`,
                messagePt: `Aguarde ${remainingSeconds} segundos para comentar novamente.`
            });
        }

        await commentModel.createComment(postId, userId, commentContent);
        return res.status(201).json({
            success: true,
            messageEn: 'Comment successfully added.',
            messagePt: 'Comentário adicionado com sucesso.'
        });

    } catch(error) {
        console.error('ERROR in blogController.postComment():\n', error);
        res.status(500).json({ 
            success: false,
            messageEn: 'Internal server error. Contact the administrator.',
            messagePt: 'Erro no servidor. Entre em contato com o administrador.'
        });
    }
}


/*****************************************************************************
/ Função auxiliar para verificar quanto tempo desde o último comentário
/*****************************************************************************/
async function validateCommentFrequency(postId, userId){
    const queryResult = await commentModel.getLastCommentTimeByUser(postId, userId);
    if(queryResult.length === 0){
        return { commentIsAllowed: true };
    }

    const elapsedTimeInSeconds = queryResult[0].seconds_elapsed;
    const COOLDOWN_SECONDS = 60;
    if (elapsedTimeInSeconds < COOLDOWN_SECONDS) {
        const remainingSeconds = COOLDOWN_SECONDS - elapsedTimeInSeconds;
        return {
            commentIsAllowed: false,
            remainingSeconds
        };
    }
    return { commentIsAllowed: true };

}


/*****************************************************************************
/ Exporta as funções para serem utilizadas pela aplicação.
/*****************************************************************************/
module.exports = {
    postComment
};