const jwt = require('jsonwebtoken');
require('dotenv').config();
const UnauthorizedError = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;
const jwtCode = NODE_ENV === 'production' ? JWT_SECRET : 'dev-code-solution';

module.exports = (req, res, next) => {
  const { cookies } = req;
  if (!cookies) {
    const err = new UnauthorizedError('необходимо залогиниться');
    next(err);
    return;
  }
  const token = cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, jwtCode);
  } catch (err) {
    const error = new UnauthorizedError('необходимо залогиниться');
    next(error);
    return;
  }
  req.user = payload;
  req.credentials = 'include';
  next();
};
