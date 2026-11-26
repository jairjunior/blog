// SVG de Engrenagem Animada para o estado de Carregamento
const gearIcon = `
    <svg class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1 z"/>
    </svg>
`;

/****************************************************************************** 
* Função para contorlar o reenvio do e-mail de verificação.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const resendBtn = document.getElementById('resendBtn');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const emailDisplay = document.getElementById('userEmailDisplay');
    const verificationCard = document.getElementById('verificationCard');
    
    if (!resendBtn || !emailDisplay) return;

    const userEmail = emailDisplay.dataset.email.trim();
    const emailFailed = verificationCard?.dataset.emailFailed === 'true';
    const isFirstVisit = verificationCard?.dataset.firstVisit === 'true';

    // Escalonamento progressivo após cada clique bem-sucedido: 180s -> 180s -> 300s (fixo)
    const cooldownSteps = [120, 180, 300];
    let resendAttempts = 0;

    // Apenas no primeiro acesso pós-cadastro e sem falha no envio do e-mail, 
    // o botão inicia bloqueado por 60s.
    // Em retornos posteriores ou em caso de falha no envio inicial, já começa habilitado.
    if (isFirstVisit && !emailFailed) {
        startCooldown(60, resendBtn);
    } else {
        resendBtn.disabled = false;
    }

    /******************************************************************************
    * Click no botão de reenvio do e-mail de verificação.
    *******************************************************************************/
    resendBtn.addEventListener('click', async () => {
        if (!userEmail) return;
        feedbackMessage.className = 'feedback-message hidden';
        feedbackMessage.textContent = '';

        // Desabilita botão de submit e fica em estado de carregamento (Loading...)
        const originalBtnHtml = resendBtn.innerHTML;
        resendBtn.innerHTML = `${gearIcon} <span>Reenviando...</span>`;
        resendBtn.disabled = true;
        let resendSucceeded = false;

        /******************************************************************************
        * Realiza requisição HTTP
        ******************************************************************************/
        try {
            const response = await fetch('/api/auth/resend-verification-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            });
            const responseData = await response.json();

            // Sucesso!
            if (response.ok) {
                resendSucceeded = true;
                feedbackMessage.setAttribute('role', 'status');
                feedbackMessage.className = 'feedback-message success';
                feedbackMessage.textContent = responseData.messagePt || 
                    'Um novo link de confirmação foi enviado para o seu e-mail.';
                
                const stepIndex = Math.min(resendAttempts, cooldownSteps.length - 1);
                const nextCooldown = cooldownSteps[stepIndex];
                resendAttempts += 1;

                startCooldown(nextCooldown, resendBtn);
            } else {
                throw new Error(responseData.messagePt || 'Não foi possível reenviar o e-mail.');
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
            if (!resendSucceeded) {
                resendBtn.innerHTML = originalBtnHtml;
                resendBtn.disabled = false;
            }
        }
    });
});

/******************************************************************************
* Inicia um temporizador de bloqueio (cooldown) para evitar múltiplos
* cliques seguidos no botão.
******************************************************************************/
function startCooldown (seconds, resendBtn) {
    let remaining = seconds;
    resendBtn.disabled = true;
    resendBtn.innerHTML = `<span>Aguarde ${remaining}s para reenviar</span>`;

    const interval = setInterval(() => {
        remaining -= 1;
        if (remaining > 0) {
            resendBtn.innerHTML = `<span>Aguarde ${remaining}s para reenviar</span>`;
        } else {
            clearInterval(interval);
            resendBtn.disabled = false;
            resendBtn.innerHTML = `<span class="btn-text">Reenviar e-mail de confirmação</span>`;
        }
    }, 1000);
};