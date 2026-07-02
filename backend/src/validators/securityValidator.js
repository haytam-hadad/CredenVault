const { z } = require('zod');

const checkStrengthSchema = z.object({
  body: z.object({
    password: z.string().min(1, 'Mot de passe requis'),
  }),
});

const generatePasswordSchema = z.object({
  body: z.object({
    length: z.number().min(8).max(128).optional(),
    includeUppercase: z.boolean().optional(),
    includeLowercase: z.boolean().optional(),
    includeNumbers: z.boolean().optional(),
    includeSymbols: z.boolean().optional(),
  }),
});

const notificationIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID invalide'),
  }),
});

module.exports = {
  checkStrengthSchema,
  generatePasswordSchema,
  notificationIdSchema,
};
