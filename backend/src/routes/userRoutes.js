const express = require('express');
const {
  getProfile,
  updateProfile,
  changePassword,
  getSecuritySettings,
  updateSecuritySettings,
  deleteAccount,
} = require('../controllers/userController');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/authMiddleware');
const {
  updateProfileSchema,
  changePasswordSchema,
  updateSecuritySettingsSchema,
} = require('../validators/userValidator');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.put('/password', validate(changePasswordSchema), changePassword);
router.get('/security-settings', getSecuritySettings);
router.put('/security-settings', validate(updateSecuritySettingsSchema), updateSecuritySettings);
router.delete('/account', deleteAccount);

module.exports = router;
