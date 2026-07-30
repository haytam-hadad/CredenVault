export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);  
  
export const validatePassword = (password) => {  
  const errors = [];  
  if (!password || password.length < 8) errors.push('Au moins 8 caractères');  
  if (!/[A-Z]/.test(password)) errors.push('Une majuscule');  
  if (!/[a-z]/.test(password)) errors.push('Une minuscule');  
  if (!/\d/.test(password)) errors.push('Un chiffre');  
  return errors;  
};  
  
// Label-keyed background chips (PasswordStrength bar)  
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
  
// Label-keyed badge styles (PasswordGenerator result panel)  
export const STRENGTH_BADGE_STYLES = {  
  'very-weak': 'text-red-500 bg-red-600/5 border-red-500/30',  
  weak: 'text-red-400 bg-red-600/5 border-red-500/30',  
  fair: 'text-yellow-400 bg-yellow-600/5 border-yellow-500/30',  
  strong: 'text-blue-400 bg-blue-600/5 border-blue-500/30',  
  'very-strong': 'text-emerald-400 bg-emerald-600/5 border-emerald-500/30',  
};  
  
// Score-based colors (AccountCard)  
export const getStrengthTextColor = (score) => {  
  if (score <= 1) return 'text-red-500';  
  if (score <= 2) return 'text-orange-500';  
  if (score <= 3) return 'text-yellow-500';  
  return 'text-emerald-500';  
};  
  
export const getStrengthBgColor = (score) => {  
  if (score <= 1) return 'bg-red-600/10';  
  if (score <= 2) return 'bg-orange-600/10';  
  if (score <= 3) return 'bg-yellow-600/10';  
  return 'bg-emerald-600/20';  
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