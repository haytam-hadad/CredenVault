const express = require('express');
const {
  checkPasswordStrength,
  generatePassword,
  getDashboardStats,
  getNotifications,
  markNotificationRead,
  getSecurityLogs,
  checkPasswordRenewals,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  generateReminderNotifications,
} = require('../controllers/securityController');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/authMiddleware');
const {
  checkStrengthSchema,
  generatePasswordSchema,
  notificationIdSchema,
} = require('../validators/securityValidator');

const router = express.Router();

router.use(protect);

router.post('/password/check-strength', validate(checkStrengthSchema), checkPasswordStrength);
router.post('/password/generate', validate(generatePasswordSchema), generatePassword);
router.get('/dashboard', getDashboardStats);
router.get('/notifications', getNotifications);
router.get('/notifications/unread-count', getUnreadNotificationCount);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.post('/notifications/generate', generateReminderNotifications);
router.patch('/notifications/:id/read', validate(notificationIdSchema), markNotificationRead);
router.get('/logs', getSecurityLogs);
router.post('/password-renewals/check', checkPasswordRenewals);

module.exports = router;