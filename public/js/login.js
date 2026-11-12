const openEyeIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-labelledby="openEyeIconTitle">
        <title id="openEyeIconTitle">Ocultar a senha</title>
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
`;

const closedEyeIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-labelledby="closedEyeIconTitle" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> 
        <title id="closedEyeIconTitle">Visualizar a senha</title> 
        <path d="M20 9C20 9 19.6797 9.66735 19 10.5144M12 14C10.392 14 9.04786 13.5878 7.94861 13M12 14C13.608 14 14.9521 13.5878 16.0514 13M12 14V17.5M4 9C4 9 4.35367 9.73682 5.10628 10.6448M7.94861 13L5 16M7.94861 13C6.6892 12.3266 5.75124 11.4228 5.10628 10.6448M16.0514 13L18.5 16M16.0514 13C17.3818 12.2887 18.3535 11.3202 19 10.5144M5.10628 10.6448L2 12M19 10.5144L22 12"/>
    </svg>
`;

/*****************************************************************************/
// Função executada ao carregar a página.
//
// Adiciona um Event Listener para o botão de submit do formulário e outro para
// o ícone de mostrar/ocultar senha.
/*****************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    
    // Função para enviar dados do formulário e realizar o login do usuário.
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
                console.error('ERRO na requisição HTTP:\n', error);
                feedbackMessage.className = 'feedback-message error';
                feedbackMessage.textContent = error.message || 'Ocorreu um erro interno ao processar a solicitação.';
            }
        });
    }


    // Função para mostrar/ocultar a senha.
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    if(passwordInput && togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePasswordBtn.innerHTML = isPassword ? openEyeIcon : closedEyeIcon;
            togglePasswordBtn.setAttribute(
                'aria-label', 
                isPassword ? 'Ocultar senha' : 'Visualizar senha'
            );
        });
    }

});