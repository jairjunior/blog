/****************************************************************************** 
/ Função para realizar a alteração de senha do usuário.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        const token = document.getElementById('token').value;
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const feedbackMessage = document.getElementById('feedbackMessage');
        const inputs = [passwordInput, confirmPasswordInput];

        // Limpa feedbackMessage quando usuário começa a digitar
        inputs.forEach( inputElement => {
            inputElement.addEventListener('input', () => {
                inputElement.setCustomValidity('');
                feedbackMessage.className = 'feedback-message';
                feedbackMessage.textContent = '';
            });
        });

        resetPasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            feedbackMessage.className = 'feedback-message';
            feedbackMessage.textContent = '';
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

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

            // Realiza requisição HTTP
            try {
                const responseHttpRequest = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, password, confirmPassword })
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
                console.error('ERRO na requisição HTTP:/n', error);
                feedbackMessage.className = 'feedback-message error';
                feedbackMessage.textContent = error.message || 'Ocorreu um erro interno ao processar a solicitação.';
            }
        });
    }
});