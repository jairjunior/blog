/****************************************************************************** 
/ Função principal que é carregada quando o documento está pronto.
/ Configura evento do formulário e todo o comportamento de envio da mensagem
/ e de feedback para o usuário.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const modal = document.getElementById('contactFeedbackModal');
    
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

        disableSubmitButton();
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
            enableSubmitButton();
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

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

/****************************************************************************** 
/ Função para fechar o modal.
******************************************************************************/
function closeModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.getElementById('topSearchButton').focus();
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
function disableSubmitButton() {
    const submitButton = document.getElementById('contactSubmitBtn');
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;
}

/****************************************************************************** 
/ Função para habilitar mensagem.
******************************************************************************/
function enableSubmitButton() {
    const submitButton = document.getElementById('contactSubmitBtn');
    submitButton.textContent = 'Enviar Mensagem';
    submitButton.disabled = false;
}
