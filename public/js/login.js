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

            try {
                const loginResponse = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (loginResponse.ok) {
                    window.location.href = '/';
                } else {
                    const responseData = await loginResponse.json();
                    console.error('Login error: ', responseData.message);
                    const messageField = document.getElementById('responseMessage')
                    messageField.textContent = 'Usuário e/ou senha inválidos.';
                }
                
            } catch (error) {
                console.error('Erro na requisição:\n', error);
            }
        });
    }
});