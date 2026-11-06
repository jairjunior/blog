/****************************************************************************** 
/ Função para realizar o login do usuário.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const redirectTo = document.getElementById('redirectTo').value;
            const feedbackMessage = document.getElementById('feedbackMessage');

            try {
                const loginHttpResponse = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, redirectTo })
                });
                const responseData = await loginHttpResponse.json();

                if (loginHttpResponse.ok) {
                    window.location.href = responseData.redirectUrl;
                } else {
                    throw new Error(responseData.messagePt);
                }
                
            } catch (error) {
                console.error('ERRO na requisição HTTP:/n', error);
                feedbackMessage.className = 'feedback-message error';
                feedbackMessage.textContent = error.message || 'Ocorreu um erro interno ao processar a solicitação.';
            }
        });
    }
});