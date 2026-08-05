// backend/src/models/User.js  
const mongoose = require('mongoose');  
const bcrypt = require('bcryptjs');  
const crypto = require('crypto');  
  
const userSchema = new mongoose.Schema(  
  {  
    email: {  
      type: String,  
      required: [true, 'Email requis'],  
      unique: true,  
      lowercase: true,  
      trim: true,  
    },  
    password: {  
      type: String,  
      required: [true, 'Mot de passe requis'],  
      minlength: 8,  
      select: false,  
    },  
    firstName: {  
      type: String,  
      trim: true,  
      default: '',  
    },  
    lastName: {  
      type: String,  
      trim: true,  
      default: '',  
    },  
    twoFactorEnabled: {  
      type: Boolean,  
      default: false,  
    },  
    twoFactorSecret: {  
      type: String,  
      select: false,  
    },  
    pendingTwoFactorSecret: {  
      type: String,  
      select: false,  
    },  
    // Backup recovery codes (hashed, single-use)  
    twoFactorRecoveryCodes: {  
      type: [  
        {  
          codeHash: { type: String, required: true },  
          usedAt: { type: Date, default: null },  
        },  
      ],  
      default: [],  
      select: false,  
    },  
    // Password reset (hashed token + expiry)  
    passwordResetToken: {  
      type: String,  
      select: false,  
    },  
    passwordResetExpires: {  
      type: Date,  
      select: false,  
    },  
    isActive: {  
      type: Boolean,  
      default: true,  
    },  
    lastLogin: {  
      type: Date,  
    },  
  },  
  {  
    timestamps: true,  
    toJSON: {  
      transform(_doc, ret) {  
        delete ret.password;  
        delete ret.twoFactorSecret;  
        delete ret.pendingTwoFactorSecret;  
        delete ret.twoFactorRecoveryCodes;  
        delete ret.passwordResetToken;  
        delete ret.passwordResetExpires;  
        delete ret.__v;  
        return ret;  
      },  
    },  
  }  
);  
  
userSchema.pre('save', async function hashPassword(next) {  
  if (!this.isModified('password')) return next();  
  this.password = await bcrypt.hash(this.password, 12);  
  next();  
});  
  
userSchema.methods.comparePassword = async function comparePassword(candidate) {  
  return bcrypt.compare(candidate, this.password);  
};  
  
// Generate a password reset token: store the SHA-256 hash, return the raw token  
userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {  
  const rawToken = crypto.randomBytes(32).toString('hex');  
  
  this.passwordResetToken = crypto  
    .createHash('sha256')  
    .update(rawToken)  
    .digest('hex');  
  
  // Valid for 1 hour  
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;  
  
  return rawToken;  
};  
  
module.exports = mongoose.model('User', userSchema);  