const { z } = require('zod');  
  
const updateProfileSchema = z.object({  
  body: z.object({  
    firstName: z.string().trim().optional(),  
    lastName: z.string().trim().optional(),  
    email: z.string().email('Email invalide').optional(),  
  }),  
});  
  
const changePasswordSchema = z.object({  
  body: z.object({  
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),  
    newPassword: z  
      .string()  
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')  
      .max(128),  
  }),  
});  
  
const updateSecuritySettingsSchema = z.object({  
  body: z.object({  
    emailNotificationsEnabled: z.boolean().optional(),  
    passwordRenewalReminderDays: z.number().min(30).max(365).optional(),  
    loginAlertsEnabled: z.boolean().optional(),  
  }),  
});  
  
module.exports = {  
  updateProfileSchema,  
  changePasswordSchema,  
  updateSecuritySettingsSchema,  
};