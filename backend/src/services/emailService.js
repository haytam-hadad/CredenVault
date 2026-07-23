const nodemailer = require('nodemailer');  
const { smtp, corsOrigin } = require('../config/env');  
  
console.log('[EmailService] SMTP config loaded:', {  
  host: smtp.host,  
  port: smtp.port,  
  user: smtp.user,  
  from: smtp.from,  
  hasPassword: !!smtp.pass,  
});  
  
// Frontend URL used for CTA links (falls back to CORS origin, then localhost)  
const FRONTEND_URL = process.env.FRONTEND_URL || corsOrigin || 'http://localhost:3000';  
  
// =======================================  
// Brand palette (matches frontend/tailwind.config.js)  
// =======================================  
const BRAND = {  
  brand400: '#8ba0f2',  
  brand500: '#637bed',  
  brand600: '#455ee3',  
  brand700: '#3549cc',  
  bg: '#020617',        // slate-950  
  surface: '#0f172a',   // slate-900  
  surfaceAlt: '#1e293b', // slate-800  
  border: '#1e293b',  
  text: '#e2e8f0',      // slate-200  
  textMuted: '#94a3b8', // slate-400  
  textFaint: '#64748b', // slate-500  
};  
  
// Safe date formatter — avoids rendering "Invalid Date"  
const formatDate = (value, withTime = false) => {  
  const date = value ? new Date(value) : new Date();  
  if (Number.isNaN(date.getTime())) {  
    return withTime ? new Date().toLocaleString('fr-FR') : new Date().toLocaleDateString('fr-FR');  
  }  
  return withTime  
    ? date.toLocaleString('fr-FR')  
    : date.toLocaleDateString('fr-FR');  
};  
  
// Reusable branded CTA button (mirrors .btn-primary)  
const button = (label, url) => `  
<a href="${url}" style="  
display:inline-block;  
padding:12px 28px;  
background:${BRAND.brand600};  
color:#f1f5f9;  
font-size:15px;  
font-weight:600;  
text-decoration:none;  
border-radius:12px;  
box-shadow:0 10px 20px rgba(69,94,227,0.25);  
">  
${label}  
</a>  
`;  
  
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
background:${BRAND.bg};  
font-family:Arial, Helvetica, sans-serif;  
">  
  
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:${BRAND.bg};">  
<tr>  
<td align="center">  
  
<table width="600" cellpadding="0" cellspacing="0" style="  
background:${BRAND.surface};  
border-radius:16px;  
overflow:hidden;  
border:1px solid ${BRAND.border};  
">  
  
<!-- Header -->  
<tr>  
<td style="  
background:linear-gradient(135deg, ${BRAND.brand600} 0%, ${BRAND.brand700} 100%);  
padding:34px 30px;  
text-align:center;  
">  
  
<h1 style="  
margin:0;  
color:#ffffff;  
font-size:28px;  
font-weight:700;  
letter-spacing:0.5px;  
">  
🔐 CredenVault  
</h1>  
  
<p style="  
margin:10px 0 0;  
color:#dbe2fb;  
font-size:14px;  
">  
Secure Account &amp; Password Management  
</p>  
  
</td>  
</tr>  
  
<!-- Content -->  
<tr>  
<td style="  
padding:35px;  
color:${BRAND.text};  
line-height:1.6;  
">  
  
${content}  
  
</td>  
</tr>  
  
<!-- Footer -->  
<tr>  
<td style="  
background:${BRAND.bg};  
padding:20px;  
text-align:center;  
color:${BRAND.textFaint};  
font-size:12px;  
border-top:1px solid ${BRAND.border};  
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
      ${formatDate(a.lastPasswordChange)}  
      </li>  
    `)  
    .join('');  
  
  const html = emailTemplate({  
    title: 'Password Renewal Reminder',  
    content: `  
  
    <h2 style="color:#ffffff;margin-top:0;">  
    🔑 Rappel de renouvellement  
    </h2>  
  
    <p>  
    Bonjour <strong>${user.firstName || user.email}</strong>,  
    </p>  
  
    <p style="color:${BRAND.textMuted};">  
    Certains mots de passe enregistrés dans votre coffre-fort  
    nécessitent une mise à jour.  
    </p>  
  
    <div style="  
    background:${BRAND.surfaceAlt};  
    padding:20px;  
    border-radius:12px;  
    margin:25px 0;  
    border-left:4px solid ${BRAND.brand500};  
    ">  
  
    <ul style="margin:0;padding-left:18px;">  
    ${accountList}  
    </ul>  
  
    </div>  
  
    <p style="color:#fbbf24;">  
    ⚠️ Pour votre sécurité, nous recommandons de renouveler ces mots de passe.  
    </p>  
  
    <p style="margin-top:30px;">  
    — L'équipe CredenVault  
    </p>  
  
    `,  
  });  
  
  return sendEmail({  
    to: user.email,  
    subject: 'CredenVault — Rappel de renouvellement de mots de passe',  
    html,  
  });  
};  
  
const sendLoginAlert = async (user, logEntry = {}) => {  
  console.log('[EmailService] sendLoginAlert called:', {  
    user: user.email,  
    logEntry,  
  });  
  
  const html = emailTemplate({  
    title: 'Login Alert',  
    content: `  
  
    <h2 style="color:#ffffff;margin-top:0;">  
    🚨 Nouvelle connexion détectée  
    </h2>  
  
    <p>  
    Bonjour <strong>${user.firstName || user.email}</strong>,  
    </p>  
  
    <p style="color:${BRAND.textMuted};">  
    Une connexion à votre compte CredenVault a été effectuée.  
    </p>  
  
    <div style="  
    background:${BRAND.surfaceAlt};  
    border-radius:12px;  
    padding:20px;  
    margin:25px 0;  
    border-left:4px solid #22c55e;  
    ">  
  
    <p style="margin:0 0 8px;">  
    📅 <strong>Date :</strong>  
    ${formatDate(logEntry.createdAt, true)}  
    </p>  
  
    <p style="margin:0;">  
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
  
    `,  
  });  
  
  return sendEmail({  
    to: user.email,  
    subject: 'CredenVault — Alerte de connexion',  
    html,  
  });  
};  
  
const sendPasswordChangedEmail = async (user, logEntry = {}) => {  
  console.log('[EmailService] sendPasswordChangedEmail called:', {  
    user: user.email,  
    logEntry,  
  });  
  
  const html = emailTemplate({  
    title: 'Password Changed',  
    content: `  
  
    <h2 style="color:#ffffff;margin-top:0;">  
    🔒 Mot de passe modifié  
    </h2>  
  
    <p>  
    Bonjour <strong>${user.firstName || user.email}</strong>,  
    </p>  
  
    <p style="color:${BRAND.textMuted};">  
    Le mot de passe de votre compte CredenVault vient d'être modifié.  
    </p>  
  
    <div style="  
    background:${BRAND.surfaceAlt};  
    border-radius:12px;  
    padding:20px;  
    margin:25px 0;  
    border-left:4px solid ${BRAND.brand500};  
    ">  
  
    <p style="margin:0 0 8px;">  
    📅 <strong>Date :</strong>  
    ${formatDate(logEntry.createdAt, true)}  
    </p>  
  
    <p style="margin:0;">  
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
  
    ⚠️ Si vous n'êtes pas à l'origine de ce changement,  
    contactez immédiatement le support et sécurisez votre compte.  
  
    </div>  
  
    <p style="margin-top:30px;">  
    — L'équipe CredenVault  
    </p>  
  
    `,  
  });  
  
  return sendEmail({  
    to: user.email,  
    subject: 'CredenVault — Votre mot de passe a été modifié',  
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
  
    <h2 style="color:#ffffff;margin-top:0;">  
    🎉 Bienvenue sur CredenVault !  
    </h2>  
  
    <p>  
    Bonjour <strong>${user.firstName || user.email}</strong>,  
    </p>  
  
    <p style="color:${BRAND.textMuted};">  
    Votre compte a été créé avec succès.  
    </p>  
  
    <div style="  
    background:${BRAND.surfaceAlt};  
    padding:20px;  
    border-radius:12px;  
    margin:25px 0;  
    border-left:4px solid ${BRAND.brand500};  
    ">  
  
    <p style="margin:0 0 8px;">🔐 Chiffrement AES-256</p>  
    <p style="margin:0 0 8px;">🛡️ Stockage sécurisé des identifiants</p>  
    <p style="margin:0;">🔑 Gestion des mots de passe</p>  
  
    </div>  
  
    <div style="text-align:center;margin:30px 0;">  
    ${button('Accéder à mon coffre-fort', `${FRONTEND_URL}/login`)}  
    </div>  
  
    <p>  
    — L'équipe CredenVault  
    </p>  
  
    `,  
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
  sendPasswordChangedEmail: typeof sendPasswordChangedEmail,  
});  
  
module.exports = {  
  sendEmail,  
  sendPasswordRenewalReminder,  
  sendLoginAlert,  
  sendWelcomeEmail,  
  sendPasswordChangedEmail,  
};