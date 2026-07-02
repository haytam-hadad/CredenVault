const Account = require('../models/Account');
const Notification = require('../models/Notification');
const SecurityLog = require('../models/SecurityLog');
const SecuritySettings = require('../models/SecuritySettings');
const {
  generateSecurePassword,
  evaluatePasswordStrength,
  isPasswordWeak,
} = require('../services/passwordService');
const { sendPasswordRenewalReminder } = require('../services/emailService');

const checkPasswordStrength = async (req, res) => {
  const strength = evaluatePasswordStrength(req.body.password);

  res.json({
    success: true,
    data: { strength },
  });
};

const generatePassword = async (req, res, next) => {
  try {
    const password = generateSecurePassword(req.body);
    const strength = evaluatePasswordStrength(password);

    res.json({
      success: true,
      data: { password, strength },
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const accounts = await Account.find({ userId });

    const weakPasswords = accounts.filter((a) => isPasswordWeak(a.passwordStrength));
    const strongPasswords = accounts.filter((a) => a.passwordStrength.score >= 3);

    const settings = await SecuritySettings.findOne({ userId });
    const reminderDays = settings?.passwordRenewalReminderDays || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - reminderDays);

    const outdatedPasswords = accounts.filter(
      (a) => new Date(a.lastPasswordChange) < cutoffDate
    );

    const categoryBreakdown = accounts.reduce((acc, account) => {
      acc[account.category] = (acc[account.category] || 0) + 1;
      return acc;
    }, {});

    const unreadNotifications = await Notification.countDocuments({
      userId,
      status: 'unread',
    });

    const recentLogs = await SecurityLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const securityScore = accounts.length
      ? Math.round(
          ((strongPasswords.length / accounts.length) * 50 +
            (accounts.length - outdatedPasswords.length) / accounts.length * 30 +
            (req.user.twoFactorEnabled ? 20 : 0))
        )
      : req.user.twoFactorEnabled
        ? 20
        : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalAccounts: accounts.length,
          weakPasswords: weakPasswords.length,
          strongPasswords: strongPasswords.length,
          outdatedPasswords: outdatedPasswords.length,
          unreadNotifications,
          twoFactorEnabled: req.user.twoFactorEnabled,
          securityScore: Math.min(100, securityScore),
          categoryBreakdown,
        },
        recentActivity: recentLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notifications.length,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'read' },
      { new: true }
    );

    if (!notification) {
      const AppError = require('../utils/AppError');
      return next(new AppError('Notification introuvable', 404));
    }

    res.json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

const getSecurityLogs = async (req, res, next) => {
  try {
    const logs = await SecurityLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: logs.length,
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
};

const checkPasswordRenewals = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const settings = await SecuritySettings.findOne({ userId });

    if (!settings?.emailNotificationsEnabled) {
      return res.json({
        success: true,
        message: 'Notifications email désactivées',
        data: { remindersSent: 0 },
      });
    }

    const reminderDays = settings.passwordRenewalReminderDays;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - reminderDays);

    const outdatedAccounts = await Account.find({
      userId,
      lastPasswordChange: { $lt: cutoffDate },
    });

    if (outdatedAccounts.length === 0) {
      return res.json({
        success: true,
        message: 'Aucun mot de passe à renouveler',
        data: { remindersSent: 0 },
      });
    }

    await sendPasswordRenewalReminder(req.user, outdatedAccounts);

    const notifications = outdatedAccounts.map((account) => ({
      userId,
      message: `Le mot de passe de "${account.serviceName}" n'a pas été changé depuis ${reminderDays} jours`,
      type: 'password-renewal',
      relatedAccountId: account._id,
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `${outdatedAccounts.length} rappel(s) envoyé(s)`,
      data: { remindersSent: outdatedAccounts.length },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkPasswordStrength,
  generatePassword,
  getDashboardStats,
  getNotifications,
  markNotificationRead,
  getSecurityLogs,
  checkPasswordRenewals,
};
