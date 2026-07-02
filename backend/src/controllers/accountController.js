const Account = require('../models/Account');
const AppError = require('../utils/AppError');
const { encrypt, decrypt } = require('../services/encryptionService');
const { evaluatePasswordStrength } = require('../services/passwordService');
const { createSecurityLog, getClientInfo } = require('../services/securityLogService');

const getAccounts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = { userId: req.user._id };

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const accounts = await Account.find(filter).sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: accounts.length,
      data: { accounts },
    });
  } catch (error) {
    next(error);
  }
};

const getAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!account) {
      return next(new AppError('Compte introuvable', 404));
    }

    const password = decrypt(account.encryptedPassword, account.iv);

    res.json({
      success: true,
      data: {
        account: {
          ...account.toJSON(),
          password,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const { serviceName, username, password, url, category, notes, isFavorite } = req.body;

    const strength = evaluatePasswordStrength(password);
    const { encrypted, iv } = encrypt(password);

    const account = await Account.create({
      userId: req.user._id,
      serviceName,
      username,
      encryptedPassword: encrypted,
      iv,
      url: url || '',
      category,
      notes,
      isFavorite,
      passwordStrength: { score: strength.score, label: strength.label },
      lastPasswordChange: new Date(),
    });

    const clientInfo = getClientInfo(req);
    await createSecurityLog({
      userId: req.user._id,
      action: 'account-created',
      ...clientInfo,
      details: `Compte créé : ${serviceName}`,
    });

    res.status(201).json({
      success: true,
      message: 'Compte ajouté avec succès',
      data: { account },
    });
  } catch (error) {
    next(error);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!account) {
      return next(new AppError('Compte introuvable', 404));
    }

    const { serviceName, username, password, url, category, notes, isFavorite } = req.body;

    if (serviceName) account.serviceName = serviceName;
    if (username) account.username = username;
    if (url !== undefined) account.url = url;
    if (category) account.category = category;
    if (notes !== undefined) account.notes = notes;
    if (isFavorite !== undefined) account.isFavorite = isFavorite;

    if (password) {
      const strength = evaluatePasswordStrength(password);
      const { encrypted, iv } = encrypt(password);
      account.encryptedPassword = encrypted;
      account.iv = iv;
      account.passwordStrength = { score: strength.score, label: strength.label };
      account.lastPasswordChange = new Date();
    }

    await account.save();

    const clientInfo = getClientInfo(req);
    await createSecurityLog({
      userId: req.user._id,
      action: 'account-updated',
      ...clientInfo,
      details: `Compte modifié : ${account.serviceName}`,
    });

    res.json({
      success: true,
      message: 'Compte mis à jour',
      data: { account },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!account) {
      return next(new AppError('Compte introuvable', 404));
    }

    const clientInfo = getClientInfo(req);
    await createSecurityLog({
      userId: req.user._id,
      action: 'account-deleted',
      ...clientInfo,
      details: `Compte supprimé : ${account.serviceName}`,
    });

    res.json({
      success: true,
      message: 'Compte supprimé',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
};
