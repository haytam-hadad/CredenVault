const express = require('express');  
const {  
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
} = require('../controllers/authController');  
const validate = require('../middlewares/validate');  
const { protect } = require('../middlewares/authMiddleware');  
const {  
  registerSchema,  
  loginSchema,  
  verify2FASchema,  
  disable2FASchema,  
  verifyPasswordSchema,  
  forgotPasswordSchema,  
  resetPasswordSchema,  
} = require('../validators/authValidator');  
  
const router = express.Router();  
  
router.post('/register', validate(registerSchema), register);  
router.post('/login', validate(loginSchema), login);  
router.post('/logout', protect, logout);  
router.get('/me', protect, getMe);  
router.post('/2fa/setup', protect, setup2FA);  
router.post('/2fa/verify', protect, validate(verify2FASchema), verify2FA);  
router.post(  
  '/2fa/recovery-codes/regenerate',  
  protect,  
  validate(verifyPasswordSchema),  
  regenerateRecoveryCodes  
);  
router.post('/2fa/disable', protect, validate(disable2FASchema), disable2FA);  
router.post('/verify-password', protect, validate(verifyPasswordSchema), verifyPassword);  
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);  
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);  
  
module.exports = router;