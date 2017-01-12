'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const boom = require('boom');
const knex = require('../knex');
const { camelizeKeys, decamelizeKeys } = require('humps');

router.get('/books', (_req, res, next) => {
  knex('books')
    .orderBy('title')
    .then((books) => {
      res.send(camelizeKeys(books));
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/books/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  if (!id || id < 0) {
    return next(boom.create(404, 'Not Found'));
  }

  knex('books')
    .where('id', id)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Not Found');
      }
      res.send(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/books', (req, res, next) => {
  const { title, author, genre, description, coverUrl } = req.body;

  if (!title || !title.trim()) {
    return next(boom.create(400, 'Title must not be blank'));
  }
  if (!author || !author.trim()) {
    return next(boom.create(400, 'Author must not be blank'));
  }
  if (!genre || !genre.trim()) {
    return next(boom.create(400, 'Genre must not be blank'));
  }
  if (!description || !description.trim()) {
    return next(boom.create(400, 'Description must not be blank'));
  }
  if (!coverUrl || !coverUrl.trim()) {
    return next(boom.create(400, 'Cover URL must not be blank'));
  }

  const insertBook = { title, author, genre, description, coverUrl };

  knex('books')
    .insert((decamelizeKeys(insertBook)), '*')
    .then((books) => {
      res.send(camelizeKeys(books[0]));
    })
    .catch((err) => {
      next(err);
    });
});

router.patch('/books/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  if (!id) {
    return next();
  }

  knex('books')
    .where('id', id)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Not Found');
      }

      const { title, author, genre, description, coverUrl } = req.body;
      const updateBook = {};

      if (title) {
        updateBook.title = title;
      }

      if (author) {
        updateBook.author = author;
      }

      if (genre) {
        updateBook.genre = genre;
      }

      if (description) {
        updateBook.description = description;
      }

      if (coverUrl) {
        updateBook.coverUrl = coverUrl;
      }

      return knex('books')
        .update(decamelizeKeys(updateBook), '*')
        .where('id', id);
    })
    .then((rows) => {
      const book = camelizeKeys(rows[0]);

      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/books/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  if (!id) {
    return next();
  }
  knex('books')
    .del('*')
    .where('id', id)
    .then((books) => {
      const book = books[0];

      if (!book) {
        return next();
      }
      delete book.id;
      res.send(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
