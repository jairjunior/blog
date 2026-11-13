// SVG de Engrenagem Animada para o estado de Carregamento
const gearIcon = `
    <svg class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1 z"/>
    </svg>
`;

document.addEventListener('DOMContentLoaded', () => {
    const resendBtn = document.getElementById('resendBtn');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const emailDisplay = document.getElementById('userEmailDisplay');
    const verificationCard = document.getElementById('verificationCard');

    if (!resendBtn || !emailDisplay) return;

    const userEmail = emailDisplay.dataset.email?.trim();
    const emailFailed = verificationCard?.dataset.emailFailed === 'true';

    // Inicia um temporizador de bloqueio (cooldown) para evitar múltiplos cliques seguidos
    const startCooldown = (seconds) => {
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

    // Se o e-mail falhou no envio inicial do cadastro, NÃO aplica o cooldown 
    // e deixa o botão pronto para o usuário tentar imediatamente.
    if (emailFailed) {
        resendBtn.disabled = false;
    } else {
        // Caso contrário, inicia com 30s de espera pois o e-mail acabou de ser enviado com sucesso
        startCooldown(30);
    }

    resendBtn.addEventListener('click', async () => {
        if (!userEmail) return;

        feedbackMessage.className = 'feedback-message';
        feedbackMessage.textContent = '';

        resendBtn.innerHTML = `${gearIcon} <span>Reenviando...</span>`;
        resendBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            });

            const responseData = await response.json();

            if (response.ok) {
                feedbackMessage.className = 'feedback-message success';
                feedbackMessage.textContent = responseData.messagePt || 'Um novo link de confirmação foi enviado para o seu e-mail!';
                startCooldown(60); // Cooldown maior após um reenvio manual
            } else {
                throw new Error(responseData.messagePt || 'Não foi possível reenviar o e-mail.');
            }
        } catch (error) {
            console.error('ERRO ao reenviar e-mail de verificação:\n', error);
            feedbackMessage.className = 'feedback-message error';
            feedbackMessage.textContent = error.message || 'Ocorreu um erro interno ao processar a solicitação.';
            
            resendBtn.disabled = false;
            resendBtn.innerHTML = `<span class="btn-text">Reenviar e-mail de confirmação</span>`;
        }
    });
});