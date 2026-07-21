export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 
export const validatePassword = (password) => {
  const errors = [];
  if (!password || password.length < 8) errors.push('Au moins 8 caractères');
  if (!/[A-Z]/.test(password)) errors.push('Une majuscule');
  if (!/[a-z]/.test(password)) errors.push('Une minuscule');
  if (!/\d/.test(password)) errors.push('Un chiffre');
  return errors;
};
 
export const STRENGTH_COLORS = {
  'very-weak': 'bg-red-500',
  weak: 'bg-orange-500',
  fair: 'bg-yellow-500',
  strong: 'bg-lime-500',
  'very-strong': 'bg-emerald-500',
};
 
export const STRENGTH_LABELS = {
  'very-weak': 'Très faible',
  weak: 'Faible',
  fair: 'Moyen',
  strong: 'Fort',
  'very-strong': 'Très fort',
};
 
export const CATEGORY_LABELS = {
  email: 'Email',
  social: 'Réseaux sociaux',
  finance: 'Finance',
  work: 'Travail',
  entertainment: 'Divertissement',
  other: 'Autre',
};
 
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });