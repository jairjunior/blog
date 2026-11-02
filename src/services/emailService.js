const nodemailer = require('nodemailer');

/******************************************************************************
/ Cria o transportador com as credenciais do servidor SMTP
/*****************************************************************************/
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


/******************************************************************************
/ Função responsável por disparar o e-mail de contato
/*****************************************************************************/
async function sendContactEmail({ name, email, subject, message }) {
    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: `[jjOutOfBounds] Formulário: ${subject}`,
        text: `Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`,
        html: `
            <h3>Nova mensagem recebida em jjOutOfBounds</h3>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>E-mail:</strong> ${email}</p>
            <p><strong>Assunto:</strong> ${subject}</p>
            <hr />
            <p><strong>Mensagem:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
        `
    };
    return await transporter.sendMail(mailOptions);
}


/******************************************************************************
/ Exporta as funções para serem utilizadas pela aplicação.
/*****************************************************************************/
module.exports = {
    sendContactEmail
};