const cardRouter = require('express').Router();
const {
  createCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

cardRouter.get('/', getCards);
cardRouter.delete('/:cardId', deleteCard);
cardRouter.post('/', createCard);
cardRouter.put('/:cardId/likes', likeCard);
cardRouter.delete('/:cardId/likes', dislikeCard);

// cardRouter.put("/cards/:cardId/likes", likeCard);
// cardRouter.delete("/cards/:cardId/likes", dislikeCard);

module.exports = cardRouter;
