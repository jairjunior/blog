// SVG para campo de senha (olho aberto)
const openEyeIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-labelledby="openEyeIconTitle">
        <title id="openEyeIconTitle">Ocultar a senha</title>
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
`;

// SVG para campo de senha (olho fechado)
const closedEyeIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-labelledby="closedEyeIconTitle" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> 
        <title id="closedEyeIconTitle">Visualizar a senha</title> 
        <path d="M20 9C20 9 19.6797 9.66735 19 10.5144M12 14C10.392 14 9.04786 13.5878 7.94861 13M12 14C13.608 14 14.9521 13.5878 16.0514 13M12 14V17.5M4 9C4 9 4.35367 9.73682 5.10628 10.6448M7.94861 13L5 16M7.94861 13C6.6892 12.3266 5.75124 11.4228 5.10628 10.6448M16.0514 13L18.5 16M16.0514 13C17.3818 12.2887 18.3535 11.3202 19 10.5144M5.10628 10.6448L2 12M19 10.5144L22 12"/>
    </svg>
`;

/****************************************************************************** 
/ Função para realizar a alteração de senha do usuário.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const resetToken = document.getElementById('resetToken').value;
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const inputs = [passwordInput, confirmPasswordInput];

    // Limpa feedbackMessage quando usuário começa a digitar em qualquer um dos inputs
    inputs.forEach( inputElement => {
        inputElement.addEventListener('input', () => {
            inputElement.setCustomValidity('');
            feedbackMessage.className = 'feedback-message';
            feedbackMessage.textContent = '';
        });
    });

    // Submissão do formulário
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
            feedbackMessage.className = 'feedback-message error';
            feedbackMessage.textContent = 'As senhas informadas não correspondem.';
            return;
        }

        // Validação da complexidade da senha via RegEx
        // Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.\-_])[A-Za-z\d@$!%*?&#.\-_]{8,}$/;
        if (!passwordRegex.test(password)) {
            feedbackMessage.className = 'feedback-message error';
            feedbackMessage.textContent = 'A senha informada não atende aos requisitos mínimos estabelecidos.';
            return;
        }

        // Realiza requisição HTTP
        try {
            const responseHttpRequest = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, password, confirmPassword })
            });
            const responseData = await responseHttpRequest.json();

            if (responseHttpRequest.ok) {
                feedbackMessage.className = 'feedback-message success';
                feedbackMessage.textContent = responseData.messagePt || 'Senha alterada com sucesso! Redirecionando para página principal...';
                await new Promise(resolve => setTimeout(resolve, 5000));
                window.location.href = responseData.redirectUrl || '/';
            } else {
                throw new Error(responseData.messagePt);
            }
        } catch (error) {
            console.error('ERRO na requisição HTTP:\n', error);
            feedbackMessage.className = 'feedback-message error';
            feedbackMessage.textContent = error.message || 'Ocorreu um erro interno ao processar a solicitação.';
        }
    });

    // Função para mostrar/ocultar a senha.
    const passwordGroups = document.querySelectorAll('div.password-wrapper');
    passwordGroups.forEach(passwordGroup => {
        const passwordInput = passwordGroup.querySelector('input[type="password"]');
        const togglePasswordBtn = passwordGroup.querySelector('button.toggle-password');
        if (passwordInput && togglePasswordBtn) {
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

});