const { sendContactEmail } = require('../services/emailService');


/*****************************************************************************
/ Função para tratar requisições POST no caminho /api/contact
/ 
/ Recebe os dados do formulário de contato enviados pelo usuário, valida os
/ campos obrigatórios e envia um e-mail para o administrador do site
/ utilizando o serviço de e-mail configurado com o Nodemailer.
/*****************************************************************************/
const sendContactMessage = async (req, res) => {
    
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
            success: false,
            messageEn: 'Please fill in all required fields.',
            messagePt: 'Por favor, preencha todos os campos obrigatórios.' 
        });
    }

    try {
        await sendContactEmail({ name, email, subject, message });
        return res.status(200).json({
            success: true,
            messageEn: 'Your message has been sent successfully! I will contact you soon.',
            messagePt: 'Sua mensagem foi enviada com sucesso! Em breve entrarei em contato.',
        });

    } catch (error) {
        console.error('ERROR in contactController.sendContactMessage():\n', error);
        return res.status(500).json({
            success: false,
            messageEn: 'An error occurred while trying to send your message. Please try again later.',
            messagePt: 'Ocorreu um erro ao tentar enviar sua mensagem. Tente novamente mais tarde.' 
        });
    }
}


/*****************************************************************************
/ Exporta as funções para serem utilizadas pela aplicação.
/*****************************************************************************/
module.exports = {
    sendContactMessage
};