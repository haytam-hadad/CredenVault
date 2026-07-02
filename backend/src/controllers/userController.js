const User = require('../models/User');
const SecuritySettings = require('../models/SecuritySettings');
const AppError = require('../utils/AppError');
const { createSecurityLog, getClientInfo } = require('../services/securityLogService');

const getProfile = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;
    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return next(new AppError('Cet email est déjà utilisé', 409));
      }
      user.email = email;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    await user.save();

    const clientInfo = getClientInfo(req);
    await createSecurityLog({
      userId: user._id,
      action: 'profile-updated',
      ...clientInfo,
    });

    res.json({
      success: true,
      message: 'Profil mis à jour',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Mot de passe actuel incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    const clientInfo = getClientInfo(req);
    await createSecurityLog({
      userId: user._id,
      action: 'password-change',
      ...clientInfo,
    });

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });
  } catch (error) {
    next(error);
  }
};

const getSecuritySettings = async (req, res, next) => {
  try {
    let settings = await SecuritySettings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await SecuritySettings.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

const updateSecuritySettings = async (req, res, next) => {
  try {
    const settings = await SecuritySettings.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Paramètres de sécurité mis à jour',
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.isActive = false;
    await user.save();

    const clientInfo = getClientInfo(req);
    await createSecurityLog({
      userId: user._id,
      action: 'logout',
      ...clientInfo,
      details: 'Compte désactivé par l\'utilisateur',
    });

    res.json({
      success: true,
      message: 'Compte désactivé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getSecuritySettings,
  updateSecuritySettings,
  deleteAccount,
};
