'use strict';

const jwt = require('jsonwebtoken');
const boom = require('boom');
const express = require('express');
const knex = require('../knex');
const { camelizeKeys, decamelizeKeys } = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

// eslint-disable-next-line newline-after-var
const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }
    req.claim = payload;
    next();
  });
};
router.get('/favorites', authorize, (req, res, next) => {
  knex('favorites')
  .innerJoin('books', 'books.id', 'favorites.book_id')
  .where('favorites.user_id', req.claim.userId)
  .orderBy('books.title', 'ASC')
  .then((rows) => {
    const favorites = camelizeKeys(rows);

    res.send(favorites);
  })
  .catch((err) => {
    next(err);
  });
});

// assingment for GET /favorites/check?bookId=1 or 2
router.get('/favorites/check', authorize, (req, res, next) => {
  const bookId = Number.parseInt(req.query.bookId);

  if (!bookId) {
    return next(boom.create(400, 'Book ID must be an integer'));
  }
  knex('books')
    .innerJoin('favorites', 'favorites.book_id', 'book_id')
    .where({
      'favorites.book_id': bookId,
      'favorites.user_id': req.claim.userId
    })
    .first()
    .then((row) => {
      if (row) {
        return res.send(true);
      }
      res.send(false);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/favorites', authorize, (req, res, next) => {
  const bookId = Number.parseInt(req.body.bookId);

  if (!bookId) {
    return next(boom.create(400, 'Book ID must be an integer'));
  }
  knex('books')
    .where('id', bookId)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Book not found');
      }
      const insFav = { bookId, userId: req.claim.userId };

      return knex('favorites')
        .insert(decamelizeKeys(insFav), '*');
    })
    .then((rows) => {
      const fav = camelizeKeys(rows[0]);

      res.send(fav);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/favorites', authorize, (req, res, next) => {
  const bookId = Number.parseInt(req.body.bookId);

  if (!bookId) {
    return next(boom.create(400, 'Book ID must be an integer'));
  }

  let favItem;

  knex('favorites')

// eslint-disable-next-line camelcase
    .where({ book_id: bookId, user_id: req.claim.userId })
    .first()
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Favorite not found');
      }
      favItem = camelizeKeys(row);

      return knex('favorites')
        .del()
        .where('id', favItem.id);
    })
    .then(() => {
      delete favItem.id;

      res.send(favItem);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
