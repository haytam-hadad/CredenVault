const express = require('express');
const {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  exportAccounts,
  importAccounts,
  getAccountStats,
} = require('../controllers/accountController');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/authMiddleware');
const {
  createAccountSchema,
  updateAccountSchema,
  accountIdSchema,
} = require('../validators/accountValidator');

const router = express.Router();

router.use(protect);

router.get('/', getAccounts);
router.post('/', validate(createAccountSchema), createAccount);

// Special routes - must be before :id
router.get('/stats', getAccountStats);
router.get('/export/all', exportAccounts);
router.post('/import/bulk', importAccounts);

// ID-based routes - must be after special routes
router.get('/:id', validate(accountIdSchema), getAccount);
router.put('/:id', validate(updateAccountSchema), updateAccount);
router.delete('/:id', validate(accountIdSchema), deleteAccount);

module.exports = router;
