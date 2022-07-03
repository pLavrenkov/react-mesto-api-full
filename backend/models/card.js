const mongoose = require('mongoose');
const { urlRegExp } = require('../utils/utils');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Не заполнено название карточки'],
    minlength: [2, 'Длина имени пользователя должна быть не менее 2х символов'],
    maxlength: [30, 'Длина имени пользователя должна быть не более 30ти символов'],
    trim: true,
  },
  link: {
    type: String,
    required: [true, 'Не заполнен url карточки'],
    validate: {
      validator(val) {
        return urlRegExp.test(val);
      },
      message: 'url введен некорректно',
    },
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Отсутствует ID создателя карточки'],
  },
  likes: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    }],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('card', cardSchema);
