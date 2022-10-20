/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('test_table', function (table) {
      table.increments('id');
      table.string('something_important').notNullable();
    })
};

/**\q
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTable('test_table')
};

