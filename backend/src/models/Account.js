const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    serviceName: {
      type: String,
      required: [true, 'Nom du service requis'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Identifiant requis'],
      trim: true,
    },
    encryptedPassword: {
      type: String,
      required: [true, 'Mot de passe chiffré requis'],
    },
    iv: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['email', 'social', 'finance', 'work', 'entertainment', 'other'],
      default: 'other',
    },
    passwordStrength: {
      score: { type: Number, min: 0, max: 4, default: 0 },
      label: {
        type: String,
        enum: ['very-weak', 'weak', 'fair', 'strong', 'very-strong'],
        default: 'very-weak',
      },
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.encryptedPassword;
        delete ret.iv;
        delete ret.__v;
        return ret;
      },
    },
  }
);

accountSchema.index({ userId: 1, serviceName: 1 });
accountSchema.index({ userId: 1, category: 1 });
accountSchema.index({ userId: 1, isFavorite: 1 });

module.exports = mongoose.model('Account', accountSchema);
