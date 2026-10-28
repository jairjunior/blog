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

            try {
                const loginHttpResponse = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, redirectTo })
                });
                const loginResponseData = await loginHttpResponse.json();
                if (loginHttpResponse.ok) {
                    window.location.href = loginResponseData.redirectUrl;
                } else {
                    console.error('ERROR: ', loginResponseData.messageEn);
                    const messageField = document.getElementById('responseMessage');
                    messageField.textContent = loginResponseData.messagePt;
                }
                
            } catch (error) {
                console.error('Erro na requisição:\n', error);
            }
        });
    }
});