const Card = require('../models/card');
const { handleValidationError } = require('../utils/utils');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => handleValidationError(err, next));
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new NotFoundError('карточка не найдена или удалена'))
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        const err = new ForbiddenError('нельзя удалаять чужую карточку');
        next(err);
        return;
      }
      Card.findByIdAndRemove(req.params.cardId)
        .orFail(new NotFoundError('карточка не найдена или удалена'))
        .then((cardn) => res.send(cardn))
        .catch((err) => handleValidationError(err, next));
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new NotFoundError('карточка не найдена или удалена'))
    .then((card) => res.send(card))
    .catch((err) => handleValidationError(err, next));
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new NotFoundError('карточка не найдена или удалена'))
    .then((card) => res.status(200).send(card))
    .catch((err) => handleValidationError(err, next));
};
