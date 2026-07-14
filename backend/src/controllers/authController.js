const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const SecuritySettings = require('../models/SecuritySettings');
const AppError = require('../utils/AppError');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../middlewares/authMiddleware');
const { createSecurityLog, getClientInfo } = require('../services/securityLogService');
const { sendWelcomeEmail, sendLoginAlert } = require('../services/emailService');

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError('Cet email est déjà utilisé', 409));
    }

    const user = await User.create({ email, password, firstName, lastName });

    await SecuritySettings.create({ userId: user._id });

    const clientInfo = getClientInfo(req);
    await createSecurityLog({
      userId: user._id,
      action: 'account-created',
      ...clientInfo,
      details: 'Inscription utilisateur',
    });

    sendWelcomeEmail(user).catch(() => {});

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

const login = async (req, res, next) => {
  try {
    const { email, password, otpToken } = req.body;
    const clientInfo = getClientInfo(req);

    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
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
      if (!otpToken) {
        return res.status(200).json({
          success: true,
          requires2FA: true,
          message: 'Code OTP requis',
        });
      }

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: otpToken,
        window: 1,
      });

      if (!isValid) {
        await createSecurityLog({
          userId: user._id,
          action: 'login-failed',
          ...clientInfo,
          success: false,
          details: 'Code 2FA invalide',
        });
        return next(new AppError('Code OTP invalide', 401));
      }
    }

    user.lastLogin = new Date();
    await user.save();

    const logEntry = await createSecurityLog({
      userId: user._id,
      action: 'login',
      ...clientInfo,
    });

    const settings = await SecuritySettings.findOne({ userId: user._id });
    if (settings?.loginAlertsEnabled) {
      sendLoginAlert(user, logEntry).catch(() => {});
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);
    user.password = undefined;
    user.twoFactorSecret = undefined;

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

const setup2FA = async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `CredenVault (${req.user.email})`,
      length: 32,
    });

    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      message: 'Scannez le QR code avec votre application d\'authentification',
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

const verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    if (!user.twoFactorSecret) {
      return next(new AppError('Configurez d\'abord la 2FA', 400));
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!isValid) {
      return next(new AppError('Code OTP invalide', 400));
    }

    user.twoFactorEnabled = true;
    await user.save();

    const clientInfo = getClientInfo(req);
    await createSecurityLog({
      userId: user._id,
      action: '2fa-enabled',
      ...clientInfo,
    });

    res.json({
      success: true,
      message: 'Authentification à deux facteurs activée',
    });
  } catch (error) {
    next(error);
  }
};

const disable2FA = async (req, res, next) => {
  try {
    const { password, token } = req.body;
    const user = await User.findById(req.user._id).select('+password +twoFactorSecret');

    if (!user.twoFactorEnabled) {
      return next(new AppError('Authentification à deux facteurs non activée', 400));
    }

    if (!(await user.comparePassword(password))) {
      return next(new AppError('Mot de passe incorrect', 401));
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!isValid) {
      return next(new AppError('Code OTP invalide', 401));
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
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

const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
};

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

module.exports = {
  register,
  login,
  setup2FA,
  verify2FA,
  disable2FA,
  getMe,
  logout,
};
