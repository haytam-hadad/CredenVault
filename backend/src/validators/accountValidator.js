const { z } = require('zod');

const createAccountSchema = z.object({
  body: z.object({
    serviceName: z.string().trim().min(1, 'Nom du service requis'),
    username: z.string().trim().min(1, 'Identifiant requis'),
    password: z.string().min(1, 'Mot de passe requis'),
    url: z.string().url('URL invalide').optional().or(z.literal('')),
    category: z
      .enum(['email', 'social', 'finance', 'work', 'entertainment', 'other'])
      .optional(),
    notes: z.string().trim().optional(),
    isFavorite: z.boolean().optional(),
  }),
});

const updateAccountSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID invalide'),
  }),
  body: z.object({
    serviceName: z.string().trim().min(1).optional(),
    username: z.string().trim().min(1).optional(),
    password: z.string().min(1).optional(),
    url: z.string().url('URL invalide').optional().or(z.literal('')),
    category: z
      .enum(['email', 'social', 'finance', 'work', 'entertainment', 'other'])
      .optional(),
    notes: z.string().trim().optional(),
    isFavorite: z.boolean().optional(),
  }),
});

const accountIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID invalide'),
  }),
});

module.exports = {
  createAccountSchema,
  updateAccountSchema,
  accountIdSchema,
};
