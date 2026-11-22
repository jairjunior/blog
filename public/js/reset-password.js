// SVG de Engrenagem Animada para o estado de Carregamento
const gearIcon = `
    <svg class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
`;

/****************************************************************************** 
* Função para realizar a alteração de senha do usuário.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const togglePasswordButtons = document.querySelectorAll('button.toggle-password');
    const resetToken = document.getElementById('resetToken').value;
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const submitBtn = document.getElementById('submitBtn');
    const inputs = [passwordInput, confirmPasswordInput];

    /******************************************************************************
    * Limpa feedbackMessage quando usuário começa a digitar em qualquer um dos inputs.
    *******************************************************************************/
    inputs.forEach( inputElement => {
        inputElement.addEventListener('input', () => {
            inputElement.setCustomValidity('');
            feedbackMessage.className = 'feedback-message';
            feedbackMessage.textContent = '';
        });
    });

    /******************************************************************************
    * Submissão do formulário.
    *******************************************************************************/
    resetPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedbackMessage.className = 'feedback-message';
        feedbackMessage.textContent = '';

        // Valida se os campos atendem às regras nativas do HTML5 (required, minlength, etc.)
        if (!resetPasswordForm.checkValidity()) {
            resetPasswordForm.reportValidity();
            return;
        }
        
        // Validação de confirmação de senha
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (password !== confirmPassword) {
            feedbackMessage.setAttribute('role', 'alert');
            feedbackMessage.className = 'feedback-message error';
            feedbackMessage.textContent = 'As senhas informadas não correspondem.';
            return;
        }

        // Validação da complexidade da senha via RegEx
        // Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.\-_])[A-Za-z\d@$!%*?&#.\-_]{8,}$/;
        if (!passwordRegex.test(password)) {
            feedbackMessage.setAttribute('role', 'alert');
            feedbackMessage.className = 'feedback-message error';
            feedbackMessage.textContent = 'A senha informada não atende aos requisitos mínimos estabelecidos.';
            return;
        }

        // Desabilita botão de submit e fica em estado de carregamento (Loading...)
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = `${gearIcon} <span>Salvando Nova Senha...</span>`;
        submitBtn.disabled = true;
        let requestSucceeded = false;

        /******************************************************************************
        * Realiza requisição HTTP
        ******************************************************************************/
        try {
            const responseHttpRequest = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, password, confirmPassword })
            });
            const responseData = await responseHttpRequest.json();

            // Sucesso!
            if (responseHttpRequest.ok) {
                requestSucceeded = true;
                // Limpa e desabilita os inputs de senha
                // Também desabilita os botões de mostrar/ocultar senha
                lockPasswordFields(inputs, togglePasswordButtons);

                // Apresenta mensagem de sucesso e volta o texto original do botão de submit
                feedbackMessage.setAttribute('role', 'status');
                feedbackMessage.className = 'feedback-message success';
                feedbackMessage.textContent = responseData.messagePt || 
                    'Senha alterada com sucesso! Você será redirecionado para a página inicial em alguns segundos.';
                submitBtn.innerHTML = originalBtnHtml;
                
                // Mostra contador regressivo para redirecionamento
                const countdownWrapper = document.getElementById('countdownWrapper');
                const countdownNumber = document.getElementById('countdownNumber');
                countdownWrapper.classList.remove('hidden');
                countdownWrapper.setAttribute('aria-hidden', 'false');
                let segundosRestantes = 10;
                const timer = setInterval(() => {
                    segundosRestantes--;
                    if (countdownNumber) {
                        countdownNumber.textContent = segundosRestantes;
                    }
                    if (segundosRestantes <= 0) {
                        clearInterval(timer);
                        window.location.href = '/';
                    }
                }, 1000);
            } else {
                throw new Error(responseData.messagePt);
            }
        // Em caso de erro, imprime mensagem de erro no console e apresenta mensagem ao usuário
        // O botão de submit volta ao normal, caso o usuário queria tentar novamente.
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

    /******************************************************************************
    * Função para mostrar/ocultar a senha.
    ******************************************************************************/
    const passwordGroups = document.querySelectorAll('div.password-wrapper');
    passwordGroups.forEach( passwordGroup => {
        const inputElement = passwordGroup.querySelector('input[type="password"], input[type="text"]');
        const toggleBtn = passwordGroup.querySelector('button.toggle-password');
        
        if (!inputElement || !toggleBtn) return;

        toggleBtn.addEventListener('click', () => {
            // Faz o toggle do tipo do botão (password/text)
            const isTypePassword = inputElement.type === 'password';
            inputElement.type = isTypePassword ? 'text' : 'password';
            
            // Cria o ícone SVG correspondente e coloca dentro do botão
            toggleBtn.innerHTML = createEyeIconSvg(isTypePassword ? 'open' : 'closed');
            
            // Alterna o label e title do botão
            const label = isTypePassword ? 'Ocultar senha' : 'Visualizar senha';
            toggleBtn.setAttribute('aria-label', label);
            toggleBtn.setAttribute('title', label);
        });
    });

});


/******************************************************************************
* Limpa o campo de senha e trava a interação tanto com o input como o botão
* de mostrar/ocultar a senha.
*******************************************************************************/
function lockPasswordFields(passwordInputs, toggleButtons) {
    passwordInputs.forEach(inputElement => {
        inputElement.value = '';
        inputElement.disabled = true;
    });
    toggleButtons.forEach(toggleBtn => {
        toggleBtn.remove();
    });
}


/******************************************************************************
* Função para retornar o SVG correto para o campo de senha do formulário.
* Como são dois campos de senha, é preciso criar componentes distintos 
* com ids separados para cada campo.
* Se type = 'open' (olho aberto), então essa função deve retornar o SVG 
* do olho fechado e vice-versa.
******************************************************************************/
function createEyeIconSvg(type) {
    const isOpen = type === 'open';

    const svgOpening = isOpen
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`;
    
    const pathAndAttrs = isOpen
        ? `<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`
        : `<path d="M20 9C20 9 19.6797 9.66735 19 10.5144M12 14C10.392 14 9.04786 13.5878 7.94861 13M12 14C13.608 14 14.9521 13.5878 16.0514 13M12 14V17.5M4 9C4 9 4.35367 9.73682 5.10628 10.6448M7.94861 13L5 16M7.94861 13C6.6892 12.3266 5.75124 11.4228 5.10628 10.6448M16.0514 13L18.5 16M16.0514 13C17.3818 12.2887 18.3535 11.3202 19 10.5144M5.10628 10.6448L2 12M19 10.5144L22 12"/></svg>`;

    return `${svgOpening}${pathAndAttrs}`;

}