const nodemailer = require('nodemailer');
const { smtp } = require('../config/env');

console.log('[EmailService] SMTP config loaded:', {
  host: smtp.host,
  port: smtp.port,
  user: smtp.user,
  from: smtp.from,
  hasPassword: !!smtp.pass,
});


// =======================================
// CredenVault Email Template
// =======================================
const emailTemplate = ({ title, content }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>

<body style="
margin:0;
padding:0;
background:#020617;
font-family:Arial, Helvetica, sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="
background:#0f172a;
border-radius:16px;
overflow:hidden;
border:1px solid #1e293b;
">

<!-- Header -->
<tr>
<td style="
background:#111827;
padding:30px;
text-align:center;
">

<h1 style="
margin:0;
color:#ffffff;
font-size:28px;
font-weight:700;
">
🔐 CredenVault
</h1>

<p style="
margin:10px 0 0;
color:#94a3b8;
font-size:14px;
">
Secure Account & Password Management
</p>

</td>
</tr>


<!-- Content -->
<tr>
<td style="
padding:35px;
color:#e2e8f0;
">

${content}

</td>
</tr>


<!-- Footer -->
<tr>
<td style="
background:#020617;
padding:20px;
text-align:center;
color:#64748b;
font-size:12px;
">

© 2026 CredenVault · Your security matters 🔒

</td>
</tr>


</table>

</td>
</tr>
</table>

</body>
</html>
`;



let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!smtp.host || !smtp.user) {
    console.warn('Configuration SMTP incomplète — les emails seront simulés en console');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: false,
    requireTLS: true,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  console.log('[EmailService] Transporter created');

  return transporter;
};



const sendEmail = async ({ to, subject, html, text }) => {
  const transport = getTransporter();

  const mailOptions = {
    from: smtp.from,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  };

  console.log('[EmailService] Preparing email:', {
    to,
    subject,
    from: smtp.from,
  });

  if (!transport) {
    console.log('[Email simulé]', { to, subject });
    return { simulated: true };
  }

  try {
    const result = await transport.sendMail(mailOptions);

    console.log('[EmailService] Email sent successfully:', {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
    });

    return result;

  } catch (error) {
    console.error('[EmailService] Email sending failed:', error);
    throw error;
  }
};



const sendPasswordRenewalReminder = async (user, accounts) => {

  const accountList = accounts
    .map((a) => `
      <li style="
      margin-bottom:10px;
      color:#cbd5e1;
      ">
      <strong>${a.serviceName}</strong>
      —
      ${new Date(a.lastPasswordChange).toLocaleDateString('fr-FR')}
      </li>
    `)
    .join('');


  const html = emailTemplate({
    title: 'Password Renewal Reminder',

    content: `

    <h2 style="color:#ffffff;">
    🔑 Rappel de renouvellement
    </h2>

    <p>
    Bonjour <strong>${user.firstName || user.email}</strong>,
    </p>

    <p style="color:#94a3b8;">
    Certains mots de passe enregistrés dans votre coffre-fort
    nécessitent une mise à jour.
    </p>


    <div style="
    background:#1e293b;
    padding:20px;
    border-radius:12px;
    margin:25px 0;
    ">

    <ul>
    ${accountList}
    </ul>

    </div>


    <p style="color:#fbbf24;">
    ⚠️ Pour votre sécurité, nous recommandons de renouveler ces mots de passe.
    </p>


    <p>
    — L'équipe CredenVault
    </p>

    `
  });


  return sendEmail({
    to: user.email,
    subject: 'CredenVault — Rappel de renouvellement de mots de passe',
    html,
  });
};



const sendLoginAlert = async (user, logEntry) => {

  console.log('[EmailService] sendLoginAlert called:', {
    user: user.email,
    logEntry,
  });


  const html = emailTemplate({
    title: 'Login Alert',

    content: `

    <h2 style="color:#ffffff;">
    🚨 Nouvelle connexion détectée
    </h2>


    <p>
    Bonjour <strong>${user.firstName || user.email}</strong>,
    </p>


    <p style="color:#94a3b8;">
    Une connexion à votre compte CredenVault a été effectuée.
    </p>


    <div style="
    background:#1e293b;
    border-radius:12px;
    padding:20px;
    margin:25px 0;
    border-left:4px solid #22c55e;
    ">


    <p>
    📅 <strong>Date :</strong>
    ${new Date(logEntry.createdAt).toLocaleString('fr-FR')}
    </p>


    <p>
    🌐 <strong>IP :</strong>
    ${logEntry.ipAddress || 'Inconnue'}
    </p>


    </div>


    <div style="
    background:#451a03;
    color:#fdba74;
    padding:15px;
    border-radius:10px;
    ">

    ⚠️ Si cette connexion n'était pas vous,
    changez immédiatement votre mot de passe.

    </div>


    <p style="margin-top:30px;">
    — L'équipe CredenVault
    </p>

    `
  });


  return sendEmail({
    to: user.email,
    subject: 'CredenVault — Alerte de connexion',
    html,
  });
};



const sendWelcomeEmail = async (user) => {

  console.log('[EmailService] sendWelcomeEmail called:', {
    user: user.email,
  });


  const html = emailTemplate({

    title: 'Welcome to CredenVault',

    content: `

    <h2 style="color:#ffffff;">
    🎉 Bienvenue sur CredenVault !
    </h2>


    <p>
    Bonjour <strong>${user.firstName || user.email}</strong>,
    </p>


    <p style="color:#94a3b8;">
    Votre compte a été créé avec succès.
    </p>


    <div style="
    background:#1e293b;
    padding:20px;
    border-radius:12px;
    margin:25px 0;
    ">

    <p>
    🔐 Chiffrement AES-256
    </p>

    <p>
    🛡️ Stockage sécurisé des identifiants
    </p>

    <p>
    🔑 Gestion des mots de passe
    </p>

    </div>


    <p>
    — L'équipe CredenVault
    </p>

    `
  });


  return sendEmail({
    to: user.email,
    subject: 'Bienvenue sur CredenVault',
    html,
  });
};



console.log('[EmailService] Exports:', {
  sendEmail: typeof sendEmail,
  sendPasswordRenewalReminder: typeof sendPasswordRenewalReminder,
  sendLoginAlert: typeof sendLoginAlert,
  sendWelcomeEmail: typeof sendWelcomeEmail,
});


module.exports = {
  sendEmail,
  sendPasswordRenewalReminder,
  sendLoginAlert,
  sendWelcomeEmail,
};