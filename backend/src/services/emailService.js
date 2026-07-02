const nodemailer = require('nodemailer');
const { smtp } = require('../config/env');

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
    secure: smtp.port === 465,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

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

  if (!transport) {
    console.log('[Email simulé]', { to, subject });
    return { simulated: true };
  }

  return transport.sendMail(mailOptions);
};

const sendPasswordRenewalReminder = async (user, accounts) => {
  const accountList = accounts
    .map((a) => `<li><strong>${a.serviceName}</strong> — dernier changement : ${new Date(a.lastPasswordChange).toLocaleDateString('fr-FR')}</li>`)
    .join('');

  const html = `
    <h2>Rappel de renouvellement — CredenVault</h2>
    <p>Bonjour ${user.firstName || user.email},</p>
    <p>Les mots de passe suivants n'ont pas été mis à jour depuis un moment :</p>
    <ul>${accountList}</ul>
    <p>Pour votre sécurité, nous vous recommandons de les renouveler.</p>
    <p>— L'équipe CredenVault</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'CredenVault — Rappel de renouvellement de mots de passe',
    html,
  });
};

const sendLoginAlert = async (user, logEntry) => {
  const html = `
    <h2>Nouvelle connexion détectée — CredenVault</h2>
    <p>Bonjour ${user.firstName || user.email},</p>
    <p>Une connexion à votre compte a été effectuée :</p>
    <ul>
      <li>Date : ${new Date(logEntry.createdAt).toLocaleString('fr-FR')}</li>
      <li>IP : ${logEntry.ipAddress || 'Inconnue'}</li>
    </ul>
    <p>Si ce n'était pas vous, changez immédiatement votre mot de passe.</p>
    <p>— L'équipe CredenVault</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'CredenVault — Alerte de connexion',
    html,
  });
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <h2>Bienvenue sur CredenVault !</h2>
    <p>Bonjour ${user.firstName || user.email},</p>
    <p>Votre compte a été créé avec succès. Vous pouvez maintenant centraliser et sécuriser vos identifiants.</p>
    <p>— L'équipe CredenVault</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Bienvenue sur CredenVault',
    html,
  });
};

module.exports = {
  sendEmail,
  sendPasswordRenewalReminder,
  sendLoginAlert,
  sendWelcomeEmail,
};
