/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('data_from_gs', function (table) {
    table.uuid('id');
    table.string('file_uri').notNullable();
    table.string('page').notNullable();
    table.timestamp('time').notNullable();
    table.json('data').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('data_from_gs');
};
