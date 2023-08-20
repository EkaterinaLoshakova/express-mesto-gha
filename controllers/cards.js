const { HTTP_STATUS_OK } = require('http2').constants;
const { mongoose } = require('mongoose');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');
const { notFoundStatus } = require('../utils/constants');
const Card = require('../models/card');

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(201).send(card);
      // Card.findById(card._id)
      //   .populate("owner")
      //   .then((data) => res.status(201).send(data))
      //   .catch(() =>
      //     res.status(notFoundStatus).send("Карточка с таким _id не найдена")
      //   );
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        // res.status(badRequestStatus).send({
        //   message: error.message,
        // });
        next(new BadRequestError(error.message));
      } else {
        // res.status(serverErrorStatus).send({
        //   message: 'Произошла ошибка на сервере.',
        // });
        next(error);
      }
    });
};

const getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => {
      res.send(cards);
    })
    .catch(next);
  // .catch(() => {
  //   res.status(serverErrorStatus).send({
  //     message: "Произошла ошибка на сервере.",
  //   });
  // });
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Карточка другого пользовател');
      }
      Card.deleteOne(card)
        .orFail()
        .then(() => {
          res.status(HTTP_STATUS_OK).send({ message: 'Карточка удалена' });
        })
        .catch((error) => {
          if (error instanceof mongoose.Error.DocumentNotFoundError) {
            next(
              new NotFoundError(
                `Карточка с _id: ${req.params.cardId} не найдена.`,
              ),
            );
          } else if (error instanceof mongoose.Error.CastError) {
            next(
              new BadRequestError(
                `Некорректный _id карточки: ${req.params.cardId}`,
              ),
            );
          } else {
            next(error);
          }
        });
    })
    .catch((error) => {
      if (error.name === 'TypeError') {
        next(
          new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена.`),
        );
      } else {
        next(error);
      }
    });
  // Card.findByIdAndRemove(req.params.cardId)
  //   .then((card) => {
  //     if (!card) {
  //       res
  //         .status(notFoundStatus)
  //         .send({ message: "Карточка с таким _id не найдена" });
  //     } else {
  //       res.send({ message: "Карточка удалена" });
  //     }
  //   })
  //   .catch((error, next) => {
  //     if (error instanceof mongoose.Error.DocumentNotFoundError) {
  //       next(new NotFoundError(`Карточка с таким  _id не найдена`));
  //     } else if (error instanceof mongoose.Error.CastError) {
  //       next(new BadRequestError(`Некорректный _id`));
  //     } else {
  //       next(error);
  //     }
  //   });
};

const likeCard = (req, res, next) => {
  // if (req.params.cardId.length === 24) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        res
          .status(notFoundStatus)
          .send({ message: 'Карточка с таким _id не найдена' });
        return;
      }
      res.send(card);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        // res
        //   .status(badRequestStatus)
        //   .send({ message: "Некорректный _id карточки" });
        next(new NotFoundError('Карточка с таким  _id не найдена'));
      } else if (error instanceof mongoose.Error.CastError) {
        // res
        //   .status(serverErrorStatus)
        //   .send({ message: "Карточка с таким _id не найдена!!!!" });
        next(new BadRequestError('Некорректный _id'));
      } else {
        next(error);
      }
    });

  // } else {
  //   res.status(badRequestStatus).send({ message: "Невалидный _id карточки" });
  // }
};

const dislikeCard = (req, res, next) => {
  // if (req.params.cardId.length === 24) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        res
          .status(notFoundStatus)
          .send({ message: 'Карточка с таким _id не найдена' });
        return;
      }
      res.send(card);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        // res
        //   .status(badRequestStatus)
        //   .send({ message: "Некорректный _id карточки" });
        next(new NotFoundError('Карточка с таким  _id не найдена'));
      } else if (error instanceof mongoose.Error.CastError) {
        // .status(serverErrorStatus)
        // .send({ message: "Карточка с таким _id не найдена" });
        next(new BadRequestError('Некорректный _id'));
      } else {
        next(error);
      }
    });
  // } else {
  //   res.status(badRequestStatus).send({ message: "Невалидный _id карточки" });
  // }
};

module.exports = {
  createCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
};
