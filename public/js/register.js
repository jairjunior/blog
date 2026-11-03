document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const emailInput = document.getElementById('email');
    const responseMessage = document.getElementById('responseMessage');
    const submitBtn = document.getElementById('submitBtn');

    // SVG de Engrenagem Animada para o estado de Carregamento
    const gearSpinnerSvg = `
        <svg class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
    `;

    // Validação extra em tempo real ao digitar (limpa mensagens customizadas ao corrigir)
    emailInput.addEventListener('input', () => {
        emailInput.setCustomValidity('');
        responseMessage.textContent = '';
    });

    // Submissão do Formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        responseMessage.textContent = '';

        // 1. Valida se os campos atendem às regras nativas do HTML5 (required, minlength, etc.)
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // 2. Validação Explicita via RegEx do E-mail (Garante a terminação .com/.br/etc)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(emailInput.value)) {
            emailInput.setCustomValidity('Por favor, insira um e-mail válido com o domínio completo (ex: nome@dominio.com).');
            emailInput.reportValidity(); // Dispara a notificação nativa do HTML5
            return;
        } else {
            emailInput.setCustomValidity('');
        }

        // 3. Preparação dos dados para a API
        const payload = {
            firstName: form.firstName.value.trim(),
            lastName: form.lastName.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value
        };

        // Estado visual de Carregamento (Loading)
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = `${gearSpinnerSvg} <span>Cadastrando...</span>`;
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Redireciona em caso de sucesso
                window.location.href = result.redirectTo || '/login?registered=true';
            } else {
                responseMessage.textContent = result.messagePt || 'Erro ao realizar o cadastro. Tente novamente.';
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
            responseMessage.textContent = 'Erro de conexão com o servidor. Verifique sua rede.';
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});