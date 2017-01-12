'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('favorites', (table) => {
    table.increments();
    table.integer('book_id')
      .references('books.id')
      .inTable('books')
      .notNullable()
      .onDelete('CASCADE')
      .index();
    table.integer('user_id')
      .references('users.id')
      .inTable('users')
      .notNullable()
      .onDelete('CASCADE')
      .index();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('favorites');
};
