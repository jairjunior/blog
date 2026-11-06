/****************************************************************************** 
/ Função para enviar a solicitação de alteração de senha (recuperar senha).
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        const emailInput = document.getElementById('email');
        const feedbackMessage = document.getElementById('feedbackMessage');
        const submitBtn = document.getElementById('submitBtn');
        const gearIcon = `
            <svg class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
        `;

        // Limpa feedbackMessage quando usuário começa a digitar
        emailInput.addEventListener('input', () => {
            emailInput.setCustomValidity('');
            feedbackMessage.className = 'feedback-message';
            feedbackMessage.textContent = '';
        });

        forgotForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            feedbackMessage.className = 'feedback-message';
            feedbackMessage.textContent = '';
            
            // Faz verificação padrão do browser
            if (!forgotForm.checkValidity()) {
                forgotForm.reportValidity();
                return;
            }

            // Validação da complexidade da senha via RegEx
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(emailInput.value)) {
                emailInput.setCustomValidity('Insira um e-mail válido com o domínio completo.');
                emailInput.reportValidity();
                return;
            }

            // Altera botão de submit para usuário ter feedback visual
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = `${gearIcon} <span>Enviando...</span>`;
            submitBtn.disabled = true;

            // Realiza requisição HTTP
            try {
                const responseHttpRequest = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailInput.value.trim() })
                });
                const responseData = await responseHttpRequest.json();
                
                if (responseHttpRequest.status === 500 || !responseData.success) {
                    throw new Error(responseData.messagePt);
                }

                feedbackMessage.className = 'feedback-message success';
                feedbackMessage.textContent = responseData.messagePt || 'Se o e-mail estiver cadastrado, um link para redefinir sua senha foi enviado. Verifique também sua caixa de spam.';
                emailInput.value = '';

            } catch (error) {
                console.error('ERRO na requisição HTTP:/n', error);
                feedbackMessage.className = 'feedback-message error';
                feedbackMessage.textContent = error.message || 'Ocorreu um erro interno ao processar a solicitação.';
            } finally {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }
});