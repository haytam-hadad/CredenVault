const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'login-failed',
        'logout',
        'password-change',
        'account-created',
        'account-updated',
        'account-deleted',
        '2fa-enabled',
        '2fa-disabled',
        '2fa-verified',
        'profile-updated',
        'data-exported',
        'data-imported',
      ],
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    success: {
      type: Boolean,
      default: true,
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

securityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
