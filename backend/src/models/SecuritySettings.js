const mongoose = require('mongoose');

const securitySettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    emailNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    passwordRenewalReminderDays: {
      type: Number,
      default: 90,
      min: 30,
      max: 365,
    },
    loginAlertsEnabled: {
      type: Boolean,
      default: true,
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: 60,
      min: 15,
      max: 1440,
    },
    requireTwoFactorForSensitiveActions: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SecuritySettings', securitySettingsSchema);
