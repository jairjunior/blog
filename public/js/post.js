// Variável para salvar o comentário temporariamente caso o token
// do usuário expire e ele precise fazer login novamente.
var savedCommentDraft = "";


/****************************************************************************** 
/ Salva um novo comentário no post.
/
/ Se o servidor retornar 401, é sinal de que o token está expirado. 
/ Assim, o modal de login é aberto para o usuário logar novamente.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('commentForm');
    if(commentForm){
        commentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const commentContent = document.getElementById('commentTextArea').value;
            const pathName = window.location.pathname;

            try {
                const httpResponse = await postHttpRequest(`${pathName}/comments`, {commentContent});
                const responseData = await httpResponse.json();
                if (httpResponse.ok) { // Comentário postado com sucesso
                    location.reload();

                } else if (httpResponse.status === 401) { // Token expirado
                    console.error('ERROR: ', responseData.messageEn);
                    savedCommentDraft = commentContent;
                    openLoginModal();

                } else { // Outros erros
                    console.error('ERROR: ', responseData.messageEn);
                    document.getElementById('commentResponseMessage').innerHTML = `
                        <span class="comment-alert-icon">&#x26A0;</span> ${responseData.messagePt}
                    `;
                }

            } catch (error) {
                console.error('Erro na requisição ao postar comentário:\n', error);
            }
        });
    }
});


/****************************************************************************** 
/ Efetua login pelo modal.
/
/ Realiza o login e, em caso de sucesso, reenvia automaticamente o comentário
/ sem que o usuário precise digitá-lo novamente.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const loginModalForm = document.getElementById('loginModalForm')
    if(loginModalForm){
        loginModalForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('modalEmail').value;
            const password = document.getElementById('modalPassword').value;

            try{
                const loginHttpResponse = await postHttpRequest('/api/auth/login', {email, password});
                const loginResponseData = await loginHttpResponse.json();
                if (loginHttpResponse.ok) { // Login efetuado com sucesso
                    
                    const pathName = window.location.pathname;
                    const retryHttpResponse = await postHttpRequest(`${pathName}/comments`,{ commentContent: savedCommentDraft });
                    const retryResponseData = await retryHttpResponse.json();
                    if (retryHttpResponse.ok) { // Comentário postado com sucesso
                        closeLoginModal();
                        location.reload();
                    } else { // Autenticou corretamente, porém teve erro ao postar comentário
                        console.error('ERROR: ', retryResponseData.messageEn);
                        document.getElementById('commentResponseMessage').innerHTML = `
                            <span class="comment-alert-icon">&#x26A0;</span> ${retryResponseData.messagePt}
                        `;
                        closeLoginModal();
                    }

                } else { // Erro ao fazer login pelo modal
                    console.error('ERROR: ', loginResponseData.messageEn);
                    document.getElementById('loginResponseMessage').textContent = loginResponseData.messagePt;
                }
            } catch (error) {
                console.error('Erro na requisição:\n', error);
            }
        });
    }
});


/****************************************************************************** 
/ Faz requisição POST com fetch e registrar o comentário.
******************************************************************************/
async function postHttpRequest(url, content){
    return await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
    });
}


/****************************************************************************** 
/ Abre o modal de login.
******************************************************************************/
function openLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'flex';   
        const emailInput = document.getElementById('modalEmail');
        if (emailInput) {
            emailInput.focus();
        }
    }
}


/****************************************************************************** 
/ Fecha o modal de login.
******************************************************************************/
function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        document.getElementById('loginResponseMessage').textContent = '';
        loginModal.style.display = 'none';
    }
    
}


/****************************************************************************** 
/ Fecha o modal de login ao pressionar a tecla ESC.
******************************************************************************/
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeLoginModal();
    }
});


/****************************************************************************** 
/ Fecha o modal de login ao clicar fora da caixa (no fundo escuro).
******************************************************************************/
window.addEventListener('click', (event) => {
    const loginModal = document.getElementById('loginModal');
    if (event.target === loginModal) {
        closeLoginModal();
    }
});