const nodemailer = require('nodemailer');

/******************************************************************************
/ Cria o transportador com as credenciais do servidor SMTP.
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
/ Função responsável por disparar o e-mail do formulário de contato do site.
/*****************************************************************************/
async function sendContactEmail({ name, email, subject, message }) {
    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: `[outOfBounds] Formulário: ${subject}`,
        text: `Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`,
        html: `
            <h3>Nova mensagem recebida em outOfBounds</h3>
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
/ Função responsável por disparar o e-mail de confirmação de cadastro de 
/ novo usuario.
/*****************************************************************************/
async function sendNewUserVerificationEmail(email, userName, verificationUrl){
    const mailOptions = {
        from: `"outOfBounds" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Confirmação de Cadastro - outOfBounds',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
                <h2 style="color: #2563eb;">Bem-vindo(a) ao outOfBounds!</h2>
                <p>Olá, prezado(a) ${userName || 'leitor(a)'}!</p>
                <p>Recebemos o seu cadastro no site <a href="https://www.outofbounds.com.br"><strong>outOfBounds</strong></a>. Para ativar a sua conta e liberar o acesso completo aos recursos, por favor confirme o seu e-mail clicando no botão abaixo:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Confirmar Meu E-mail</a>
                </p>
                <p style="font-size: 0.85rem; color: #4b5563;">
                    Ou copie e cole o seguinte link no seu navegador:<br>
                    <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
                </p>
                <p style="font-size: 0.85rem; color: #dc2626; margin-top: 20px;">
                    ⚠️ <strong>Este link expira em 24 horas.</strong> Se você não realizou este cadastro, por favor ignore este e-mail.
                </p>
            </div>
        `
    };
    return await transporter.sendMail(mailOptions);
}


/******************************************************************************
/ Função responsável por disparar o e-mail de recuperar a senha do usuário.
/*****************************************************************************/
async function sendResetPasswordEmail(email, userName, resetUrl) {
    const mailOptions = {
        from: `"outOfBounds" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Redefinição de Senha - outOfBounds',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
                <h2 style="color: #2563eb;">Solicitação de Redefinição de Senha</h2>
                <p>Olá, prezado(a) ${userName || 'leitor(a)'}!</p>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no site <a href="https://www.outofbounds.com.br"><strong>outOfBounds</strong></a>.</p>
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
    sendNewUserVerificationEmail,
    sendResetPasswordEmail
};