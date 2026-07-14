require('dotenv').config();

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'ENCRYPTION_KEY'];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Variable d'environnement manquante : ${key}`);
  }
}

if (process.env.ENCRYPTION_KEY.length !== 64 || !/^[0-9a-f]{64}$/i.test(process.env.ENCRYPTION_KEY)) {
  throw new Error('ENCRYPTION_KEY doit être une clé hexadécimale valide de 64 caractères (32 bytes)');
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  encryptionKey: process.env.ENCRYPTION_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'CredenVault <noreply@credenvault.com>',
  },
};
