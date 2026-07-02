const AppError = require('../utils/AppError');

const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const messages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return next(new AppError(messages.join(', '), 400));
  }

  const { body, query, params } = result.data;
  if (body) req.body = body;
  if (query) req.query = query;
  if (params) req.params = params;

  next();
};

module.exports = validate;
