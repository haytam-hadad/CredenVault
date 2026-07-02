const crypto = require('crypto');

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const STRENGTH_LABELS = ['very-weak', 'weak', 'fair', 'strong', 'very-strong'];

const getRandomChar = (charset) => charset[crypto.randomInt(0, charset.length)];

const shuffle = (str) => {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};

const generateSecurePassword = (options = {}) => {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  if (length < 8 || length > 128) {
    throw new Error('La longueur du mot de passe doit être entre 8 et 128');
  }

  let charset = '';
  const required = [];

  if (includeLowercase) {
    charset += LOWERCASE;
    required.push(getRandomChar(LOWERCASE));
  }
  if (includeUppercase) {
    charset += UPPERCASE;
    required.push(getRandomChar(UPPERCASE));
  }
  if (includeNumbers) {
    charset += NUMBERS;
    required.push(getRandomChar(NUMBERS));
  }
  if (includeSymbols) {
    charset += SYMBOLS;
    required.push(getRandomChar(SYMBOLS));
  }

  if (!charset) {
    throw new Error('Au moins un type de caractère doit être sélectionné');
  }

  let password = required.join('');
  for (let i = required.length; i < length; i++) {
    password += getRandomChar(charset);
  }

  return shuffle(password);
};

const evaluatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { score: 0, label: 'very-weak', feedback: ['Mot de passe invalide'] };
  }

  let score = 0;
  const feedback = [];

  if (password.length >= 8) score++;
  else feedback.push('Utilisez au moins 8 caractères');

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else feedback.push('Mélangez majuscules et minuscules');

  if (/\d/.test(password)) score++;
  else feedback.push('Ajoutez des chiffres');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Ajoutez des caractères spéciaux');

  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push('Évitez les caractères répétés');
  }

  if (/^(password|123456|qwerty|admin)/i.test(password)) {
    score = 0;
    feedback.push('Mot de passe trop commun');
  }

  const normalizedScore = Math.min(4, Math.floor(score * 4 / 5));

  return {
    score: normalizedScore,
    label: STRENGTH_LABELS[normalizedScore],
    feedback: feedback.length ? feedback : ['Mot de passe solide'],
  };
};

const isPasswordWeak = (strength) => strength.score <= 1;

module.exports = {
  generateSecurePassword,
  evaluatePasswordStrength,
  isPasswordWeak,
  STRENGTH_LABELS,
};
