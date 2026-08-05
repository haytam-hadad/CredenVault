// backend/src/controllers/authController.js  
const speakeasy = require('speakeasy');  
const QRCode = require('qrcode');  
const bcrypt = require('bcryptjs');  
const crypto = require('crypto');  
const User = require('../models/User');  
const SecuritySettings = require('../models/SecuritySettings');  
const AppError = require('../utils/AppError');  
const {  
  generateToken,  
  setTokenCookie,  
  clearTokenCookie,  
} = require('../middlewares/authMiddleware');  
  
const { encrypt, decrypt } = require('../services/encryptionService');  
  
const {  
  createSecurityLog,  
  getClientInfo,  
} = require('../services/securityLogService');  
  
const {  
  sendWelcomeEmail,  
  sendLoginAlert,  
  sendPasswordChangedEmail,  
  sendPasswordResetEmail,  
} = require('../services/emailService');  
  
const {  
  createNotification,  
} = require('../services/notificationService');  
  
// ==========================  
// 2FA HELPERS  
// ==========================  
  
// Store the TOTP secret encrypted at rest as "ciphertext:iv"  
const encryptSecret = (base32) => {  
  const { encrypted, iv } = encrypt(base32);  
  return `${encrypted}:${iv}`;  
};  
  
// Read it back to the raw base32 speakeasy expects.  
// Legacy fallback: secrets saved before this change have no ":" → returned as-is.  
const decryptSecret = (stored) => {  
  if (!stored) return stored;  
  if (!stored.includes(':')) return stored;  
  const [encrypted, iv] = stored.split(':');  
  return decrypt(encrypted, iv);  
};  
  
const RECOVERY_CODE_COUNT = 10;  
  
// Human-readable one-time codes, e.g. "A1B2C-D3E4F"  
const generateRecoveryCodes = (count = RECOVERY_CODE_COUNT) => {  
  const codes = [];  
  for (let i = 0; i < count; i += 1) {  
    const raw = crypto.randomBytes(5).toString('hex').toUpperCase(); // 10 hex chars  
    codes.push(`${raw.slice(0, 5)}-${raw.slice(5)}`);  
  }  
  return codes;  
};  
  
// Hash each code with bcrypt (never store plaintext)  
const hashRecoveryCodes = async (codes) =>  
  Promise.all(  
    codes.map(async (code) => ({  
      codeHash: await bcrypt.hash(code, 12),  
      usedAt: null,  
    }))  
  );  
  
// ==========================  
// REGISTER  
// ==========================  
const register = async (req, res, next) => {  
  try {  
    const { email, password, firstName, lastName } = req.body;  
  
    const existing = await User.findOne({ email });  
    if (existing) {  
      return next(new AppError('Cet email est déjà utilisé', 409));  
    }  
  
    const user = await User.create({  
      email,  
      password,  
      firstName,  
      lastName,  
    });  
  
    // In-app welcome notification (kept)  
    await createNotification({  
      userId: user._id,  
      type: 'system',  
      message: 'Bienvenue sur CredenVault ! Votre compte a été créé avec succès.',  
      metadata: { action: 'account-created' },  
    });  
  
    await SecuritySettings.create({ userId: user._id });  
  
    const clientInfo = getClientInfo(req);  
  
    await createSecurityLog({  
      userId: user._id,  
      action: 'account-created',  
      ...clientInfo,  
      details: 'Inscription utilisateur',  
    });  
  
    sendWelcomeEmail(user).catch((err) =>  
      console.error('[Email] welcome failed:', err)  
    );  
  
    const token = generateToken(user._id);  
    setTokenCookie(res, token);  
  
    res.status(201).json({  
      success: true,  
      message: 'Inscription réussie',  
      data: { user, token },  
    });  
  } catch (error) {  
    next(error);  
  }  
};  
  
// ==========================  
// LOGIN  
// ==========================  
const login = async (req, res, next) => {  
  try {  
    const { email, password, otpToken, recoveryCode } = req.body;  
  
    const clientInfo = getClientInfo(req);  
  
    const user = await User.findOne({ email })  
      .select('+password +twoFactorSecret +twoFactorRecoveryCodes');  
  
    if (!user || !(await user.comparePassword(password))) {  
      await createSecurityLog({  
        userId: user?._id,  
        action: 'login-failed',  
        ...clientInfo,  
        success: false,  
        details: `Tentative de connexion pour ${email}`,  
      });  
  
      return next(new AppError('Email ou mot de passe incorrect', 401));  
    }  
  
    if (user.twoFactorEnabled) {  
      // Neither an OTP nor a recovery code provided → ask the client for it  
      if (!otpToken && !recoveryCode) {  
        return res.status(200).json({  
          success: true,  
          requires2FA: true,  
          message: 'Code OTP requis',  
        });  
      }  
  
      let isValid = false;  
      let usedRecoveryCode = false;  
  
      if (otpToken) {  
        isValid = speakeasy.totp.verify({  
          secret: decryptSecret(user.twoFactorSecret),  
          encoding: 'base32',  
          token: otpToken,  
          window: 1,  
        });  
      } else if (recoveryCode) {  
        const normalized = recoveryCode.trim().toUpperCase();  
        for (const entry of user.twoFactorRecoveryCodes) {  
          if (entry.usedAt) continue;  
          // eslint-disable-next-line no-await-in-loop  
          if (await bcrypt.compare(normalized, entry.codeHash)) {  
            entry.usedAt = new Date();  
            isValid = true;  
            usedRecoveryCode = true;  
            break;  
          }  
        }  
      }  
  
      if (!isValid) {  
        await createSecurityLog({  
          userId: user._id,  
          action: 'login-failed',  
          ...clientInfo,  
          success: false,  
          details: recoveryCode  
            ? 'Code de récupération invalide'  
            : 'Code 2FA invalide',  
        });  
  
        return next(  
          new AppError(  
            recoveryCode ? 'Code de récupération invalide' : 'Code OTP invalide',  
            401  
          )  
        );  
      }  
  
      // Persist the consumed recovery code immediately  
      if (usedRecoveryCode) {  
        await user.save();  
      }  
    }  
  
    user.lastLogin = new Date();  
    await user.save();  
  
    const logEntry = await createSecurityLog({  
      userId: user._id,  
      action: 'login',  
      ...clientInfo,  
      details: recoveryCode ? 'Connexion via code de récupération' : undefined,  
    });  
  
    const settings = await SecuritySettings.findOne({ userId: user._id });  
  
    // Login alert email — respects the master email switch as well  
    if (settings?.emailNotificationsEnabled && settings?.loginAlertsEnabled) {  
      sendLoginAlert(user, logEntry)  
        .catch((err) => console.error('[Email] login alert failed:', err));  
    }  
  
    const token = generateToken(user._id);  
    setTokenCookie(res, token);  
  
    user.password = undefined;  
    user.twoFactorSecret = undefined;  
    user.twoFactorRecoveryCodes = undefined;  
  
    res.json({  
      success: true,  
      message: 'Connexion réussie',  
      data: { user, token },  
    });  
  } catch (error) {  
    next(error);  
  }  
};  
  
// ==========================  
// SETUP 2FA  
// ==========================  
const setup2FA = async (req, res, next) => {  
  try {  
    const secret = speakeasy.generateSecret({  
      name: `CredenVault (${req.user.email})`,  
      length: 32,  
    });  
  
    const user = await User.findById(req.user._id).select('+twoFactorSecret');  
  
    if (!user) {  
      return next(new AppError('Utilisateur introuvable', 404));  
    }  
  
    // Store encrypted at rest; QR still shows plaintext base32 to the client  
    user.twoFactorSecret = encryptSecret(secret.base32);  
    await user.save();  
  
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);  
  
    res.json({  
      success: true,  
      message: "Scannez le QR code avec votre application d'authentification",  
      data: {  
        secret: secret.base32,  
        qrCode: qrCodeUrl,  
        otpauthUrl: secret.otpauth_url,  
      },  
    });  
  } catch (error) {  
    next(error);  
  }  
};  
  
// ==========================  
// VERIFY 2FA (enable + issue recovery codes)  
// ==========================  
const verify2FA = async (req, res, next) => {  
  try {  
    const { token } = req.body;  
  
    const user = await User.findById(req.user._id).select('+twoFactorSecret');  
  
    if (!user) {  
      return next(new AppError('Utilisateur introuvable', 404));  
    }  
  
    if (!user.twoFactorSecret) {  
      return next(new AppError("Configurez d'abord la 2FA", 400));  
    }  
  
    const isValid = speakeasy.totp.verify({  
      secret: decryptSecret(user.twoFactorSecret),  
      encoding: 'base32',  
      token,  
      window: 1,  
    });  
  
    if (!isValid) {  
      return next(new AppError('Code OTP invalide', 400));  
    }  
  
    user.twoFactorEnabled = true;  
  
    // Generate one-time recovery codes, store hashes, return plaintext once  
    const recoveryCodes = generateRecoveryCodes();  
    user.twoFactorRecoveryCodes = await hashRecoveryCodes(recoveryCodes);  
  
    await user.save();  
  
    const clientInfo = getClientInfo(req);  
  
    await createSecurityLog({  
      userId: user._id,  
      action: '2fa-enabled',  
      ...clientInfo,  
    });  
  
    await createSecurityLog({  
      userId: user._id,  
      action: '2fa-recovery-codes-generated',  
      ...clientInfo,  
    });  
  
    res.json({  
      success: true,  
      message: 'Authentification à deux facteurs activée',  
      data: { recoveryCodes },  
    });  
  } catch (error) {  
    next(error);  
  }  
};  
  
// ==========================  
// REGENERATE RECOVERY CODES  
// ==========================  
const regenerateRecoveryCodes = async (req, res, next) => {  
  try {  
    const { password } = req.body;  
  
    const user = await User.findById(req.user._id).select('+password');  
  
    if (!user) {  
      return next(new AppError('Utilisateur introuvable', 404));  
    }  
  
    if (!user.twoFactorEnabled) {  
      return next(  
        new AppError('Authentification à deux facteurs non activée', 400)  
      );  
    }  
  
    if (!(await user.comparePassword(password))) {  
      return next(new AppError('Mot de passe incorrect', 401));  
    }  
  
    const recoveryCodes = generateRecoveryCodes();  
    user.twoFactorRecoveryCodes = await hashRecoveryCodes(recoveryCodes);  
    await user.save();  
  
    const clientInfo = getClientInfo(req);  
  
    await createSecurityLog({  
      userId: user._id,  
      action: '2fa-recovery-codes-generated',  
      ...clientInfo,  
    });  
  
    res.json({  
      success: true,  
      message: 'Nouveaux codes de récupération générés',  
      data: { recoveryCodes },  
    });  
  } catch (error) {  
    next(error);  
  }  
};  
  
// ==========================  
// DISABLE 2FA  
// ==========================  
const disable2FA = async (req, res, next) => {  
  try {  
    const { password, token, recoveryCode } = req.body;  
  
    const user = await User.findById(req.user._id)  
      .select('+password +twoFactorSecret +twoFactorRecoveryCodes');  
  
    if (!user) {  
      return next(new AppError('Utilisateur introuvable', 404));  
    }  
  
    if (!user.twoFactorEnabled) {  
      return next(  
        new AppError('Authentification à deux facteurs non activée', 400)  
      );  
    }  
  
    if (!(await user.comparePassword(password))) {  
      return next(new AppError('Mot de passe incorrect', 401));  
    }  
  
    if (!token && !recoveryCode) {  
      return next(  
        new AppError('Code OTP ou code de récupération requis', 400)  
      );  
    }  
  
    let isValid = false;  
  
    if (token) {  
      isValid = speakeasy.totp.verify({  
        secret: decryptSecret(user.twoFactorSecret),  
        encoding: 'base32',  
        token,  
        window: 1,  
      });  
    } else if (recoveryCode) {  
      const normalized = recoveryCode.trim().toUpperCase();  
      for (const entry of user.twoFactorRecoveryCodes) {  
        if (entry.usedAt) continue;  
        // eslint-disable-next-line no-await-in-loop  
        if (await bcrypt.compare(normalized, entry.codeHash)) {  
          isValid = true;  
          break;  
        }  
      }  
    }  
  
    if (!isValid) {  
      return next(  
        new AppError(  
          recoveryCode ? 'Code de récupération invalide' : 'Code OTP invalide',  
          401  
        )  
      );  
    }  
  
    user.twoFactorEnabled = false;  
    user.twoFactorSecret = undefined;  
    user.twoFactorRecoveryCodes = [];  
    await user.save();  
  
    const clientInfo = getClientInfo(req);  
  
    await createSecurityLog({  
      userId: user._id,  
      action: '2fa-disabled',  
      ...clientInfo,  
    });  
  
    res.json({  
      success: true,  
      message: 'Authentification à deux facteurs désactivée',  
    });  
  } catch (error) {  
    next(error);  
  }  
};  
  
// ==========================  
// GET ME  
// ==========================  
const getMe = async (req, res) => {  
  res.json({  
    success: true,  
    data: { user: req.user },  
  });  
};  
  
// ==========================  
// VERIFY PASSWORD (re-authentication)  
// ==========================  
const verifyPassword = async (req, res, next) => {  
  try {  
    const { password } = req.body;  
  
    const user = await User.findById(req.user._id).select('+password');  
  
    if (!user || !(await user.comparePassword(password))) {  
      return next(new AppError('Mot de passe incorrect', 401));  
    }  
  
    res.json({  
      success: true,  
      data: { verified: true },  
    });  
  } catch (error) {  
    next(error);  
  }  
};  
  
// ==========================  
// LOGOUT  
// ==========================  
const logout = async (req, res, next) => {  
  try {  
    const clientInfo = getClientInfo(req);  
  
    await createSecurityLog({  
      userId: req.user._id,  
      action: 'logout',  
      ...clientInfo,  
    });  
  
    clearTokenCookie(res);  
  
    res.json({  
      success: true,  
      message: 'Déconnexion réussie',  
    });  
  } catch (error) {  
    next(error);  
  }  
};  
  
// ==========================  
// FORGOT PASSWORD  
// ==========================  
const forgotPassword = async (req, res, next) => {  
  try {  
    const { email } = req.body;  
  
    const clientInfo = getClientInfo(req);  
  
    // Generic response prevents email enumeration  
    const genericResponse = () =>  
      res.json({  
        success: true,  
        message:  
          'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.',  
      });  
  
    const user = await User.findOne({ email });  
  
    if (!user) {  
      return genericResponse();  
    }  
  
    const rawToken = user.createPasswordResetToken();  
    await user.save();  
  
    await createSecurityLog({  
      userId: user._id,  
      action: 'password-change',  
      ...clientInfo,  
      details: 'Demande de réinitialisation du mot de passe',  
    });  
  
    sendPasswordResetEmail(user, rawToken).catch((err) =>  
      console.error('[Email] password reset failed:', err)  
    );  
  
    return genericResponse();  
  } catch (error) {  
    next(error);  
  }  
};  
  
// ==========================  
// RESET PASSWORD  
// ==========================  
const resetPassword = async (req, res, next) => {  
  try {  
    const { token, password } = req.body;  
  
    const hashedToken = crypto  
      .createHash('sha256')  
      .update(token)  
      .digest('hex');  
  
    const user = await User.findOne({  
      passwordResetToken: hashedToken,  
      passwordResetExpires: { $gt: Date.now() },  
    }).select('+password +passwordResetToken +passwordResetExpires');  
  
    if (!user) {  
      return next(new AppError('Token invalide ou expiré', 400));  
    }  
  
    user.password = password; // hashed by the pre('save') hook  
    user.passwordResetToken = undefined;  
    user.passwordResetExpires = undefined;  
    await user.save();  
  
    const clientInfo = getClientInfo(req);  
  
    await createSecurityLog({  
      userId: user._id,  
      action: 'password-change',  
      ...clientInfo,  
      details: 'Mot de passe réinitialisé via lien email',  
    });  
  
    const settings = await SecuritySettings.findOne({ userId: user._id });  
    if (settings?.emailNotificationsEnabled) {  
      sendPasswordChangedEmail(user, {  
        createdAt: new Date(),  
        ipAddress: clientInfo.ipAddress,  
      }).catch((err) =>  
        console.error('[Email] password changed failed:', err)  
      );  
    }  
  
    res.json({  
      success: true,  
      message: 'Mot de passe réinitialisé avec succès',  
    });  
  } catch (error) {  
    next(error);  
  }  
};  
  
module.exports = {  
  register,  
  login,  
  setup2FA,  
  verify2FA,  
  regenerateRecoveryCodes,  
  disable2FA,  
  getMe,  
  verifyPassword,  
  logout,  
  forgotPassword,  
  resetPassword,  
};