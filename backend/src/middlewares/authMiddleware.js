const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwt: jwtConfig, nodeEnv } = require('../config/env');
const AppError = require('../utils/AppError');

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const generateToken = (userId) =>
  jwt.sign({ id: userId }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
};

const clearTokenCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: nodeEnv === 'production',
    sameSite: 'lax',
  });
};

const extractToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
};

const protect = async (req, _res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next(new AppError('Accès non autorisé — token manquant', 401));
    }

    const decoded = jwt.verify(token, jwtConfig.secret);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new AppError('Utilisateur introuvable ou désactivé', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Token invalide ou expiré', 401));
    }
    next(error);
  }
};

module.exports = { protect, generateToken, setTokenCookie, clearTokenCookie };
