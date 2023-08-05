const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, // имя — это строка
      required: [true, 'Поле обязательно для заполнения'], // оно должно быть у каждого пользователя, так что имя — обязательное поле
      minlength: [2, 'Минимальная длина имени 2 символа'], // минимальная длина имени — 2 символа
      maxlength: [30, 'Максимальная длина имени 30 символов'], // а максимальная — 30 символов
    },
    about: {
      type: String, // поле о себе — это строка
      required: [true, 'Поле обязательно для заполнения'], // оно должно быть у каждого пользователя, так что "о себе" — обязательное поле
      minlength: [2, 'Минимальная длина поля "о себе" 2 символа'], // минимальная длина  — 2 символа
      maxlength: [30, 'Максимальная длина поля "о себе" 30 символов'], // а максимальная — 30 символов
    },

    avatar: {
      type: String, // поле аватар — это строка
      validate: {
        validator(url) {
          return /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(
            url,
          );
        },
        message: 'Невалидный URL',
      },
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model('user', userSchema);
