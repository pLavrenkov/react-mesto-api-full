const jwt = require('jsonwebtoken');
require('dotenv').config();
const UnauthorizedError = require('../errors/UnauthorizedError');

const { JWT_SECRET } = require('../utils/utils');

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
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const error = new UnauthorizedError('необходимо залогиниться');
    next(error);
    return;
  }
  req.user = payload;
  next();
};
