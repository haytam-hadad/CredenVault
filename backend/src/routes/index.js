const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const accountRoutes = require('./accountRoutes');
const securityRoutes = require('./securityRoutes');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'CredenVault API opérationnelle' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/accounts', accountRoutes);
router.use('/security', securityRoutes);

module.exports = router;
