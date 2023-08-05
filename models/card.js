const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Имя карточки должно быть заполнено'],
      minlength: [2, 'Минимальная длина имени карточки - 2'],
      maxlength: [30, 'Максимальная длина имени карточки - 30'],
    },
    link: {
      type: String,
      required: [true, 'Поле url должно быть заполнено'],
      validate: {
        validator(url) {
          return /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(
            url,
          );
        },
        message: 'Введите URL',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model('card', cardSchema);
