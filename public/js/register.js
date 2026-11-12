// SVG de Engrenagem Animada para o estado de Carregamento
const gearIcon = `
    <svg class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
`;

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
/ Função executada ao carregar a página.
/
/ Adiciona um Event Listener para o botão de submit do formulário e outro para
/ o ícone de mostrar/ocultar senha.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const firstNameInput = document.getElementById('firstNameInput');
    const lastNameInput = document.getElementById('lastNameInput');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const submitBtn = document.getElementById('submitBtn');
    const inputs = [firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput];

    // Limpa feedbackMessage quando usuário começa a digitar em qualquer um dos inputs do formulário
    inputs.forEach( inputElement => {
        inputElement.addEventListener('input', () => {
            inputElement.setCustomValidity('');
            feedbackMessage.className = 'feedback-message';
            feedbackMessage.textContent = '';
        });
    });

    // Submissão do Formulário
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedbackMessage.className = 'feedback-message';
        feedbackMessage.textContent = '';
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Valida se os campos atendem às regras nativas do HTML5 (required, minlength, etc.)
        if (!registerForm.checkValidity()) {
            registerForm.reportValidity();
            return;
        }

        // Validação Explicita via RegEx do E-mail
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(emailInput.value)) {
            emailInput.setCustomValidity('Por favor, insira um e-mail válido (ex: nome@dominio.com).');
            emailInput.reportValidity();
            return;
        } else {
            emailInput.setCustomValidity('');
        }

        // Validação de confirmação de senha
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

        // Preparação dos dados para a API
        const payload = {
            first_name: registerForm.firstName.value.trim(),
            last_name: registerForm.lastName.value.trim(),
            email: registerForm.email.value.trim(),
            password: registerForm.password.value
        };

        // Botão com visual de Carregamento (Loading)
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = `${gearIcon} <span>Cadastrando...</span>`;
        submitBtn.disabled = true;

        try {
            const responseHttpRequest = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const responseData = await responseHttpRequest.json();

            if (responseHttpRequest.ok) {
                window.location.href = responseData.redirectUrl || '/?registered=true';
            } else {
                throw new Error(responseData.messagePt);
            }
        } catch (error) {
            console.error('ERRO na requisição HTTP:\n', error);
            feedbackMessage.className = 'feedback-message error';
            feedbackMessage.textContent = error.message || 'Ocorreu um erro interno ao processar a solicitação.';
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
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