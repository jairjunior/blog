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
/ Função responsável por disparar o e-mail de recuperar a senha
/*****************************************************************************/
async function sendResetPasswordEmail(email, userName, resetUrl) {
    const mailOptions = {
        from: `"jjOutOfBounds" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Redefinição de Senha - jjOutOfBounds',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
                <h2 style="color: #2563eb;">Solicitação de Redefinição de Senha</h2>
                <p>Olá, prezado(a) ${userName || 'leitor(a)'}!</p>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no blog <a href="https://blog.jairjr.com.br"><strong>jjOutOfBounds</strong></a>.</p>
                <p>Para escolher uma nova senha, clique no botão abaixo:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Redefinir Minha Senha</a>
                </p>
                <p style="font-size: 0.85rem; color: #4b5563;">
                    Ou copie e cole o seguinte link no seu navegador:<br>
                    <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
                </p>
                <p style="font-size: 0.85rem; color: #dc2626; margin-top: 20px;">
                    ⚠️ <strong>Este link expira em 15 minutos.</strong> Se você não solicitou a alteração de senha, ignore este e-mail.
                </p>
            </div>
        `
    };
    return await transporter.sendMail(mailOptions);

}

/******************************************************************************
/ Exporta as funções para serem utilizadas pela aplicação.
/*****************************************************************************/
module.exports = {
    sendContactEmail,
    sendResetPasswordEmail
};