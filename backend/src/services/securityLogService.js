const SecurityLog = require('../models/SecurityLog');

const createSecurityLog = async ({
  userId,
  action,
  ipAddress = '',
  userAgent = '',
  success = true,
  details = '',
}) => {
  return SecurityLog.create({
    userId,
    action,
    ipAddress,
    userAgent,
    success,
    details,
  });
};

const getClientInfo = (req) => ({
  ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
  userAgent: req.headers['user-agent'] || '',
});

module.exports = { createSecurityLog, getClientInfo };
