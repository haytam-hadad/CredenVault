const express = require('express');
const {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
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
router.get('/:id', validate(accountIdSchema), getAccount);
router.post('/', validate(createAccountSchema), createAccount);
router.put('/:id', validate(updateAccountSchema), updateAccount);
router.delete('/:id', validate(accountIdSchema), deleteAccount);

module.exports = router;
