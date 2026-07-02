const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128);

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    password: passwordSchema,
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
    otpToken: z.string().length(6).optional(),
  }),
});

const verify2FASchema = z.object({
  body: z.object({
    token: z.string().length(6, 'Le code OTP doit contenir 6 chiffres'),
  }),
});

const disable2FASchema = z.object({
  body: z.object({
    password: z.string().min(1, 'Mot de passe requis'),
    token: z.string().length(6, 'Le code OTP doit contenir 6 chiffres'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  verify2FASchema,
  disable2FASchema,
};
