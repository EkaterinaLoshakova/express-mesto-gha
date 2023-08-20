const mongoose = require('mongoose');
// const validator = require("validator");
const bcrypt = require('bcryptjs');
const UnauthorizedError = require('../errors/UnauthorizedError');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, // имя — это строка
      default: 'Жак-Ив Кусто',
      minlength: [2, 'Минимальная длина имени 2 символа'], // минимальная длина имени — 2 символа
      maxlength: [30, 'Максимальная длина имени 30 символов'], // а максимальная — 30 символов
    },
    about: {
      type: String, // поле о себе — это строка
      default: 'Исследователь',
      minlength: [2, 'Минимальная длина поля "о себе" 2 символа'], // минимальная длина  — 2 символа
      maxlength: [30, 'Максимальная длина поля "о себе" 30 символов'], // а максимальная — 30 символов
    },

    avatar: {
      type: String, // поле аватар — это строка
      // required: [true, 'Поле аватар должно быть заполнено'],
      default:
        'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
      validate: {
        validator(url) {
          return /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(
            url,
          );
        },
        message: 'Невалидный URL',
      },
    },

    email: {
      type: String,
      required: [true, 'Поле обязательно для заполнения'],
      unique: true,
      validate: {
        validator(email) {
          // validator.isEmail(email);
          return /^\S+@\S+\.\S+$/.test(email);
        },
        message: 'Введите верный email',
      },
    },

    password: {
      type: String,
      required: [true, 'Поле обязательно для заполнения'],
      select: false,
    },
  },
  { versionKey: false },
);

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password,
) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new UnauthorizedError('Неправильные почта или пароль');
        }

        return user; // теперь user доступен
      });
    });
};

module.exports = mongoose.model('user', userSchema);
