// Variável para salvar o comentário temporariamente caso o token
// do usuário expire e ele precise fazer login novamente.
var savedCommentDraft = "";


/****************************************************************************** 
/ Salva um novo comentário no artigo.
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
                const feedbackMessage = document.getElementById('commentFeedbackMessage');
                if (httpResponse.ok) { // Comentário postado com sucesso
                    location.reload();
                } else if (httpResponse.status === 401) { // Token expirado
                    console.error('ERROR: ', responseData.messageEn);
                    savedCommentDraft = commentContent;
                    openReauthModal();
                } else if (httpResponse.status == 429) { // Too many requests
                    feedbackMessage.textContent = `⚠️ ${responseData.messagePt}`;
                    startCommentCountdown();
                } else { // Outros erros
                    console.error('ERROR: ', responseData.messageEn);
                    feedbackMessage.innerHTML = `⚠️ ${responseData.messagePt}`;
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
    const reauthModalForm = document.getElementById('reauthModalForm')
    if(reauthModalForm){
        reauthModalForm.addEventListener('submit', async (event) => {
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
                        closeReauthModal();
                        location.reload();
                    } else { // Autenticou corretamente, porém teve erro ao postar comentário
                        console.error('ERROR: ', retryResponseData.messageEn);
                        document.getElementById('commentFeedbackMessage').innerHTML = `⚠️ ${retryResponseData.messagePt}`;
                        closeReauthModal();
                    }

                } else { // Erro ao fazer login pelo modal
                    console.error('ERROR: ', loginResponseData.messageEn);
                    document.getElementById('modalLoginFeedbackMessage').textContent = loginResponseData.messagePt;
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
function openReauthModal() {
    const reauthModal = document.getElementById('reauthModal');
    if (reauthModal) {
        reauthModal.style.display = 'flex';
        disableBackground();
        document.body.classList.add('modal-open');
        const emailInput = document.getElementById('modalEmail');
        if (emailInput) {
            emailInput.focus();
        }
    }
}


/****************************************************************************** 
/ Fecha o modal de login.
******************************************************************************/
function closeReauthModal() {
    const reauthModal = document.getElementById('reauthModal');
    if (reauthModal) {
        document.getElementById('modalLoginFeedbackMessage').textContent = '';
        reauthModal.style.display = 'none';
        enableBackground();
        document.body.classList.remove('modal-open');
    }
    
}


/****************************************************************************** 
/ Fecha o modal de login ao pressionar a tecla ESC.
******************************************************************************/
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeReauthModal();
    }
});


/****************************************************************************** 
/ Fecha o modal de login ao clicar fora da caixa (no fundo escuro).
******************************************************************************/
window.addEventListener('click', (event) => {
    const reauthModal = document.getElementById('reauthModal');
    if (event.target === reauthModal) {
        closeReauthModal();
    }
});


/****************************************************************************** 
/ Faz countdown do tempo que falta para postar novo comentário.
******************************************************************************/
async function startCommentCountdown() {
    const feedbackElement = document.getElementById('commentFeedbackMessage');
    if (!feedbackElement) return;

    const originalText = feedbackElement.textContent;    
    const numbersFound = originalText.match(/\d+/);
    if (!numbersFound) return;

    let secondsRemaining = parseInt(numbersFound[0], 10);
    feedbackElement.classList.remove('fade-out');

    const commentBtn = document.getElementById('commentSubmitBtn');
    commentBtn.disabled = true;
    const interval = setInterval(() => {
        secondsRemaining--;
        if (secondsRemaining >= 0) {
            feedbackElement.textContent = `⚠️ Aguarde ${secondsRemaining} segundos para comentar novamente.`;
        } else {
            clearInterval(interval);
            feedbackElement.classList.add('fade-out');
            setTimeout(() => {
                feedbackElement.textContent = '';
            }, 500);
            commentBtn.disabled = false;
        }
    }, 1000);
}


/****************************************************************************** 
/ Conjunto de funções para evitar que o usuário navegue pelo site usando
/ a tecla TAB quando o modal estiver aberto.
******************************************************************************/
function disableBackground() {
    const header = document.querySelector('header.site-header');
    const mainContent = document.querySelector('body main');
    const footer = document.querySelector('footer.site-footer');

    header.setAttribute('inert', '');
    mainContent.setAttribute('inert', '');
    footer.setAttribute('inert', '');
}
function enableBackground() {
    const header = document.querySelector('header.site-header');
    const mainContent = document.querySelector('body main');
    const footer = document.querySelector('footer.site-footer');

    header.removeAttribute('inert');
    mainContent.removeAttribute('inert');
    footer.removeAttribute('inert');
}