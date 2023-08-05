const Card = require('../models/card');

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      Card.findById(card._id)
        .populate('owner')
        .then((data) => res.status(201).send(data))
        .catch(() => res.status(404).send('Карточка с таким _id не найдена'));
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(400).send({
          message: error.message,
        });
      } else {
        res.status(500).send({
          message: 'Произошла ошибка на сервере.',
        });
      }
    });
};

const getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => {
      res.send(cards);
    })
    .catch(() => {
      res.status(500).send({
        message: 'Произошла ошибка на сервере.',
      });
    });
};

const deleteCard = (req, res) => {
  if (req.params.cardId.length === 24) {
    Card.findByIdAndRemove(req.params.cardId)
      .then((card) => {
        if (!card) {
          res.status(404).send({ message: 'Карточка с таким _id не найдена' });
        } else {
          res.send({ message: 'Карточка удалена' });
        }
      })
      .catch(() => {
        res.status(404).send({ message: 'Карточки с таким _id нет' });
      });
  } else {
    res.status(400).send({ message: 'Невалидный _id карточки' });
  }
};

const likeCard = (req, res) => {
  if (req.params.cardId.length === 24) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
      .populate(['owner', 'likes'])
      .then((card) => {
        if (!card) {
          res.status(404).send({ message: 'Карточка с таким _id не найдена' });
          return;
        }
        res.send(card);
      })
      .catch(() => res.status(404).send({ message: 'Карточка с таким _id не найдена!!!!' }));
  } else {
    res.status(400).send({ message: 'Невалидный _id карточки' });
  }
};

const dislikeCard = (req, res) => {
  if (req.params.cardId.length === 24) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
      .populate(['owner', 'likes'])
      .then((card) => {
        if (!card) {
          res.status(404).send({ message: 'Карточка с таким _id не найдена' });
          return;
        }
        res.send(card);
      })
      .catch(
        res.status(404).send({ message: 'Карточка с таким _id не найдена' }),
      );
  } else {
    res.status(400).send({ message: 'Невалидный _id карточки' });
  }
};

module.exports = {
  createCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
};
