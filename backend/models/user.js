const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { urlRegExp } = require('../utils/utils');
const UnauthorizedError = require('../errors/UnauthorizedError');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Не заполнен e-mail'],
    minlength: [2, 'Длина email должна быть не менее 2х символов'],
    maxlength: [30, 'Длина email должна быть не более 30ти символов'],
    unique: [true, 'Пользователь с таким email уже есть'],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Не заполнен пароль'],
    select: false,
  },
  name: {
    type: String,
    minlength: [2, 'Длина имени пользователя должна быть не менее 2х символов'],
    maxlength: [30, 'Длина имени пользователя должна быть не более 30ти символов'],
    default: 'Жак-Ив Кусто',
    required: false,
    trim: true,
  },
  about: {
    type: String,
    minlength: [2, 'Длина имени пользователя должна быть не менее 2х символов'],
    maxlength: [30, 'Длина имени пользователя должна быть не более 30ти символов'],
    default: 'Исcледователь',
    required: false,
    trim: true,
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(val) {
        return urlRegExp.test(val);
      },
      message: 'url введен некорректно',
    },
    required: false,
    trim: true,
  },
});

userSchema.statics.findUserByCredentials = function (res, next, email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        const err = new UnauthorizedError('неправильные почта или пароль');
        return next(err);
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            const err = new UnauthorizedError('неправильные почта или пароль');
            return next(err);
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
