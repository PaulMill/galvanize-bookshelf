'use strict';

const bcrypt = ('bcrypt-as-promised');
const boom = require('boom');
const express = require('express');

const { camelizeKeys, decamelizeKeys } = require('humps');
const knex = require('../knex');

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/users', (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;

  if (!email || !email.trim()) {
    return next(boom.create(400, 'Email must not be blank'));
  }
  if (!password || password.length < 8) {
    return next(boom.create(400, 'Password must be at least 8 characters long'));
  }

  knex('users')
    .insert(insertUser, '*')
    .first()
    .then((user) => {
      if (user) {
        throw boom.create(400, 'Email already exists');
      }
      return bcrypt.hash(password, 12); // hashing password
    }
    .then((hashedPassword) => {
      const insertUser = { first_name, last_name, email, password };
      return knex('users').insert(insertUser, '*')
    })  const id = camelizeKeys(user[0].id);

      res.send(id);
    });
});

module.exports = router;
