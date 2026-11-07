/****************************************************************************** 
/ Função principal que é carregada quando o documento está pronto.
/ Configura evento do formulário e todo o comportamento de envio da mensagem
/ e de feedback para o usuário.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('contactForm');
    const modal = document.getElementById('contactFeedbackModal');
    const submitButton = document.getElementById('contactSubmitBtn');
    
    setModalEvents(modal);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!validateEmail()) { return; }

        const formData = {
            name: form.name.value,
            email: form.email.value,
            subject: form.subject.value,
            message: form.message.value
        };

        disableSubmitButton(submitButton);
        try {
            const responseHttpRequest = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const responseData = await responseHttpRequest.json();
            if (responseHttpRequest.ok && responseData.success) {
                openModal(modal, responseData.messagePt, true);
                form.reset();
            } else {
                openModal(modal, responseData.messagePt || 'Erro inesperado ao enviar a mensagem.', false);
            }
        } catch (error) {
            console.error('Erro na requisição:\n', error);
            openModal(modal, `Erro de conexão com o servidor. Tente novamente mais tarde.`, false);
        } finally {
            enableSubmitButton(submitButton);
        }
    });
});

/****************************************************************************** 
/ Função para abrir o modal de feedback com estilo e mensagem correspondentes.
******************************************************************************/
function openModal(modal, message, isSuccess) {
    const modalTitle = document.getElementById('modalTitle');
    const modalIcon = document.getElementById('modalIcon');
    const modalMessage = document.getElementById('modalMessage');
    const modalActionBtn = document.getElementById('modalActionBtn');
    modalMessage.textContent = message;

    if (isSuccess) {
        modalTitle.textContent = 'Sucesso';
        modalTitle.classList.remove('modal-color-red');
        modalTitle.classList.add('modal-color-green');
        modalIcon.innerHTML = '&#10004;'; // Ícone de check
        modalIcon.classList.remove('modal-color-red');
        modalIcon.classList.add('modal-color-green');
        modalActionBtn.classList.remove('modal-btn-error');
        modalActionBtn.classList.add('modal-btn-success');
    } else {
        modalTitle.textContent = 'Erro';
        modalTitle.classList.remove('modal-color-green');
        modalTitle.classList.add('modal-color-red');
        modalIcon.innerHTML = '&#10006;'; // Ícone de X
        modalIcon.classList.remove('modal-color-green');
        modalIcon.classList.add('modal-color-red');
        modalActionBtn.classList.remove('modal-btn-success');
        modalActionBtn.classList.add('modal-btn-error');
    }

    disableBackground();
    modalActionBtn.focus();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

/****************************************************************************** 
/ Função para fechar o modal.
******************************************************************************/
function closeModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    enableBackground();
    document.getElementById('topSearchButton').focus();
}

/****************************************************************************** 
/ Conjunto de funções para evitar que o usuário navegue pelo site usando
/ a tecla TAB quando o modal estiver aberto.
******************************************************************************/
function disableBackground() {
    const header = document.querySelector('header.site-header');
    const mainContent = document.querySelector('body main');
    const footer = document.querySelector('footer.site-footer');

    header.setAttribute('inert', '');
    mainContent.setAttribute('inert', '');
    footer.setAttribute('inert', '');
}
function enableBackground() {
    const header = document.querySelector('header.site-header');
    const mainContent = document.querySelector('body main');
    const footer = document.querySelector('footer.site-footer');

    header.removeAttribute('inert');
    mainContent.removeAttribute('inert');
    footer.removeAttribute('inert');
}

/****************************************************************************** 
/ Função que configura os eventos do modal.
******************************************************************************/
function setModalEvents(modal){

    // Fecha o modal apertando a tecla ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal(modal);
        }
    });
    
    // Fecha o modal clicando fora do card
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });

    // Fecha o modal clicando no botão de ação
    const modalActionBtn = document.getElementById('modalActionBtn');
    modalActionBtn.addEventListener('click', () => closeModal(modal));

}

/****************************************************************************** 
/ Função para validar o campo de e-mail usando regex.
******************************************************************************/
function validateEmail() {
    const emailInput = document.getElementById('contactEmail');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailInput.value)) {
        emailInput.setCustomValidity('Por favor, insira um e-mail válido no formato nome@dominio.com');
        emailInput.reportValidity();
        setTypingEvent(emailInput);
        return false;
    }
    return true;
}

/****************************************************************************** 
/ Função auxiliar que executa apenas uma vez quando o usuário começa a digitar
/ no campo de e-mail logo após receber uma validação negativa do e-mail
/ digitado.
/ Ela é acionada após o e-mail receber uma validação negativa por parte da
/ função validateEmail().
******************************************************************************/
function setTypingEvent(emailInput){
    emailInput.addEventListener('input', () => {
        emailInput.setCustomValidity('');
    }, { once: true });
}

/****************************************************************************** 
/ Função que desabilita o botão do formulário enquanto a mensagem está sendo
/ enviada.
******************************************************************************/
function disableSubmitButton(submitButton) {
    submitButton.innerHTML = `
        <svg class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- Ícone de Engrenagem (Gear/Cog) em SVG puro -->
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        Enviando...`;
    submitButton.disabled = true;
}

/****************************************************************************** 
/ Função para habilitar mensagem.
******************************************************************************/
function enableSubmitButton(submitButton) {
    submitButton.innerHTML = 'Enviar Mensagem';
    submitButton.disabled = false;
}