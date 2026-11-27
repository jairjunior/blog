// SVG de Engrenagem Animada para o estado de Carregamento
const gearIcon = `
    <svg class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
`;

// SVG para campo de senha (olho aberto)
const openEyeIcon = `
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        aria-hidden="true" 
        focusable="false"
    >
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
`;

// SVG para campo de senha (olho fechado)
const closedEyeIcon = `
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        aria-hidden="true" 
        focusable="false"
    >
        <path d="M20 9C20 9 19.6797 9.66735 19 10.5144M12 14C10.392 14 9.04786 13.5878 7.94861 13M12 14C13.608 14 14.9521 13.5878 16.0514 13M12 14V17.5M4 9C4 9 4.35367 9.73682 5.10628 10.6448M7.94861 13L5 16M7.94861 13C6.6892 12.3266 5.75124 11.4228 5.10628 10.6448M16.0514 13L18.5 16M16.0514 13C17.3818 12.2887 18.3535 11.3202 19 10.5144M5.10628 10.6448L2 12M19 10.5144L22 12"/>
    </svg>
`;

/*****************************************************************************
* Função executada ao carregar a página.
*
* Adiciona um Event Listener para o botão de submit do formulário e outro para
* o ícone de mostrar/ocultar senha.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const submitBtn = document.getElementById('submitBtn');
    const inputs = [emailInput, passwordInput];
    
    /*****************************************************************************
    * Limpa feedbackMessage quando usuário começa a digitar em qualquer um dos inputs do formulário
    ******************************************************************************/
    inputs.forEach( inputElement => {
        inputElement.addEventListener('input', () => {
            inputElement.setCustomValidity('');
            feedbackMessage.className = 'feedback-message';
            feedbackMessage.textContent = '';
        });
    });

    /*****************************************************************************
    * Submissão do formulário.
    ******************************************************************************/
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedbackMessage.className = 'feedback-message';
        feedbackMessage.textContent = '';

        // Valida se os campos atendem às regras nativas do HTML5 (required, minlength, etc.)
        if (!loginForm.checkValidity()) {
            loginForm.reportValidity();
            return;
        }

        // Pega valores para enviar ao backend
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const redirectTo = document.getElementById('redirectTo').value;

        // Desabilita botão de submit e fica em estado de carregamento (Loading...)
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = `${gearIcon} <span>Realizando Login...</span>`;
        submitBtn.disabled = true;
        let requestSucceeded = false;

        /*****************************************************************************
        * Realiza requisição HTTP
        ******************************************************************************/
        try {
            const responseHttpRequest = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, redirectTo })
            });
            const responseData = await responseHttpRequest.json();

            if (responseHttpRequest.ok) {
                requestSucceeded = true;
                window.location.href = responseData.redirectUrl || '/';
            } else {
                throw new Error(responseData.messagePt);
            }
        } catch (error) {
            console.error('ERRO na requisição HTTP:\n', error);
            feedbackMessage.setAttribute('role', 'alert');
            feedbackMessage.className = 'feedback-message error';
            feedbackMessage.textContent =
                error instanceof Error && error.message
                    ? error.message
                    : 'Ocorreu um erro interno ao processar a solicitação.';
        } finally {
            if (!requestSucceeded) {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        }
    });


    /*****************************************************************************
    * Função para mostrar/ocultar a senha.
    ******************************************************************************/
    const togglePasswordBtn = document.getElementById('togglePassword');
    togglePasswordBtn.addEventListener('click', () => {
        // Faz o toggle do tipo do botão (password/text)
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        
        // Cria o ícone SVG correspondente e coloca dentro do botão
        togglePasswordBtn.innerHTML = isPassword ? openEyeIcon : closedEyeIcon;
        
        // Alterna o label e title do botão
        const label = isPassword ? 'Ocultar senha' : 'Visualizar senha';
        togglePasswordBtn.setAttribute('aria-label', label);
        togglePasswordBtn.setAttribute('title', label);
    });

});