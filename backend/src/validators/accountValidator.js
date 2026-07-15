const { z } = require('zod');

// Base schemas for reuse
const createAccountBodySchema = z.object({
  serviceName: z.string().trim().min(1, 'Nom du service requis').max(255, 'Nom du service trop long'),
  username: z.string().trim().min(1, 'Identifiant requis').max(255, 'Identifiant trop long'),
  password: z.string().min(1, 'Mot de passe requis').max(512, 'Mot de passe trop long'),
  url: z.string().url('URL invalide').max(2048, 'URL trop long').optional().or(z.literal('')),
  category: z
    .enum(['email', 'social', 'finance', 'work', 'entertainment', 'other'])
    .optional(),
  notes: z.string().trim().max(5000, 'Notes trop longues').optional(),
  isFavorite: z.boolean().optional(),
});

const updateAccountBodySchema = z.object({
  serviceName: z.string().trim().min(1).max(255, 'Nom du service trop long').optional(),
  username: z.string().trim().min(1).max(255, 'Identifiant trop long').optional(),
  password: z.string().min(1).max(512, 'Mot de passe trop long').optional(),
  url: z.string().url('URL invalide').max(2048, 'URL trop long').optional().or(z.literal('')),
  category: z
    .enum(['email', 'social', 'finance', 'work', 'entertainment', 'other'])
    .optional(),
  notes: z.string().trim().max(5000, 'Notes trop longues').optional(),
  isFavorite: z.boolean().optional(),
});

const idParamsSchema = z.object({
  id: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'ID invalide'),
});

const createAccountSchema = z.object({
  body: createAccountBodySchema,
});

const updateAccountSchema = z.object({
  params: idParamsSchema,
  body: updateAccountBodySchema,
});

const accountIdSchema = z.object({
  params: idParamsSchema,
});

module.exports = {
  createAccountSchema,
  updateAccountSchema,
  accountIdSchema,
};
