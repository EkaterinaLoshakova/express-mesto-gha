const {
  badRequestStatus,
  notFoundStatus,
  serverErrorStatus,
} = require("../utils/constants");
const Card = require("../models/card");

const createCard = (req, res) => {
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
      if (error.name === "ValidationError") {
        res.status(badRequestStatus).send({
          message: error.message,
        });
      } else {
        res.status(serverErrorStatus).send({
          message: "Произошла ошибка на сервере.",
        });
      }
    });
};

const getCards = (req, res) => {
  Card.find({})
    .populate(["owner", "likes"])
    .then((cards) => {
      res.send(cards);
    })
    .catch(() => {
      res.status(serverErrorStatus).send({
        message: "Произошла ошибка на сервере.",
      });
    });
};

const deleteCard = (req, res) => {
  // if (req.params.cardId.length === 24) {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        res
          .status(notFoundStatus)
          .send({ message: "Карточка с таким _id не найдена" });
      } else {
        res.send({ message: "Карточка удалена" });
      }
    })
    .catch((error) => {
      if (error.name === "CastError") {
        res
          .status(badRequestStatus)
          .send({ message: "Некорректный _id карточки" });
      } else {
        res
          .status(serverErrorStatus)
          .send({ message: "Карточки с таким _id нет" });
      }
    });
  // } else {
  //   res.status(badRequestStatus).send({ message: "Невалидный _id карточки" });
  // }
};

const likeCard = (req, res) => {
  // if (req.params.cardId.length === 24) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .populate(["owner", "likes"])
    .then((card) => {
      if (!card) {
        res
          .status(notFoundStatus)
          .send({ message: "Карточка с таким _id не найдена" });
        return;
      }
      res.send(card);
    })
    .catch((error) => {
      if (error.name === "CastError") {
        res
          .status(badRequestStatus)
          .send({ message: "Некорректный _id карточки" });
      } else {
        res
          .status(serverErrorStatus)
          .send({ message: "Карточка с таким _id не найдена!!!!" });
      }
    });

  // } else {
  //   res.status(badRequestStatus).send({ message: "Невалидный _id карточки" });
  // }
};

const dislikeCard = (req, res) => {
  // if (req.params.cardId.length === 24) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .populate(["owner", "likes"])
    .then((card) => {
      if (!card) {
        res
          .status(notFoundStatus)
          .send({ message: "Карточка с таким _id не найдена" });
        return;
      }
      res.send(card);
    })
    .catch((error) => {
      if (error.name === "CastError") {
        res
          .status(badRequestStatus)
          .send({ message: "Некорректный _id карточки" });
      } else {
        res
          .status(serverErrorStatus)
          .send({ message: "Карточка с таким _id не найдена" });
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
