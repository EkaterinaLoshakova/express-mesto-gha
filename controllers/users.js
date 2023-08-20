const { HTTP_STATUS_OK, HTTP_STATUS_CREATED } = require('http2').constants;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { notFoundStatus } = require('../utils/constants');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    // .catch(() =>
    //   res
    //     .status(serverErrorStatus)
    //     .send({ message: "На сервере произошла ошибка" })
    // );
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  // if (req.params.userId.length === 24) {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        res
          .status(notFoundStatus)
          .send({ message: 'Пользователь по указанному _id не найден.' });
        return;
      }
      res.send(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Некорректный _id пользователя'));
        // res
        //   .status(badRequestStatus)
        //   .send({ message: "Некорректный _id карточки" });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(
          new NotFoundError({
            message: 'Пользователь по указанному _id не найден.',
          }),
        );
        // res
        //   .status(serverErrorStatus)
        //   .send({ message: 'Пользователь по указанному _id не найден.' });
      } else {
        next(error);
      }
    });
  // } else {
  //   res.status(400).send({ message: "Некорректный _id" });
  // }
};

module.exports.addUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    // User.create({ name, about, avatar })
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
      .then((user) => res.status(HTTP_STATUS_CREATED).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        _id: user._id,
        email: user.email,
      }))
      .catch((error) => {
        // if (error instanceof mongoose.Error.ValidationError) {
        //   // res.status(badRequestStatus).send({ message: error.message });
        //   next(new BadRequestError(error.message));
        // } else {
        //   // res
        //   //   .status(serverErrorStatus)
        //   //   .send({ message: "На сервере произошла ошибка" });
        //   next(error);
        // }
        if (error.code === 11000) {
          next(
            new ConflictError(
              'Пользователь с таким email уже зарегистрирован',
            ),
          );
        } else if (error instanceof mongoose.Error.ValidationError) {
          next(new BadRequestError(error.message));
        } else {
          next(error);
        }
      }));
};

module.exports.editUserData = (req, res, next) => {
  const { name, about } = req.body;
  // if (req.user._id) {
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: 'true', runValidators: true },
  )
    .then((user) => res.send(user))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        // res.status(badRequestStatus).send({ message: error.message });
        next(new BadRequestError(error.message));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        // res
        //   .status(serverErrorStatus)
        //   .send({ message: "Пользователь по указанному _id не найден." });
        next(
          new NotFoundError({
            message: 'Пользователь по указанному _id не найден.',
          }),
        );
      } else {
        next(error);
      }
    });
  // } else {
  //   res.status(500).send({ message: "На сервере произошла ошибка" });
  // }
};

module.exports.editUserAvatar = (req, res, next) => {
  // if (req.user._id) {
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    { new: 'true', runValidators: true },
  )
    .then((user) => res.send(user))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        // res.status(badRequestStatus).send({ message: error.message });
        next(new BadRequestError(error.message));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        // res
        //   .status(serverErrorStatus)
        //   .send({ message: "Пользователь по указанному _id не найден." });
        next(
          new NotFoundError({
            message: 'Пользователь по указанному _id не найден.',
          }),
        );
      } else {
        next(error);
      }
    });
  // } else {
  //   res.status(500).send({ message: "На сервере произошла ошибка" });
  // }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.getMeUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch(next);
};
