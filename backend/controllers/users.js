require('dotenv').config();
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const { handleValidationError } = require('../utils/utils');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new NotFoundError('пользователь не найден или удален'))
    .then((user) => res.send(user))
    .catch((err) => handleValidationError(err, next));
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new NotFoundError('пользователь не найден или удален'))
    .then((user) => res.send(user))
    .catch((err) => handleValidationError(err, next));
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        const err = new ConflictError(`Пользователь с таким email: ${email}, уже существует`);
        next(err);
        return;
      }
      bcrypt.hash(password, 10)
        .then((hash) => {
          User.create({
            name, about, avatar, email, password: hash,
          })
            .then((newuser) => res.status(201).send({
              name: newuser.name,
              about: newuser.about,
              avatar: newuser.avatar,
              email: newuser.email,
              _id: newuser._id,
            }))
            .catch((err) => handleValidationError(err, next));
        })
        .catch(next);
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => handleValidationError(err, next));
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => handleValidationError(err, next));
};

module.exports.login = (req, res, next) => {
  const { password } = req.body;
  if (!req.body.email || !req.body.password) {
    const error = new BadRequestError('не заполнены email или пароль');
    next(error);
    return;
  }
  const email = req.body.email.toLowerCase();
  if (!validator.isEmail(email)) {
    const error = new BadRequestError('email введен некорректно');
    next(error);
    return;
  }
  User.findUserByCredentials(res, next, email, password)
    .then((user) => {
      if (user) {
        const token = jwt.sign({ _id: user._id }, (NODE_ENV === 'production' ? JWT_SECRET : 'dev-code-solution'), { expiresIn: '7d' });
        res
          .cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true })
          .status(200).send({
            _id: user._id,
            name: user.name,
            about: user.about,
            avatar: user.avatar,
            email: user.email,
            token,
          });
      }
    })
    .catch(next);
};
