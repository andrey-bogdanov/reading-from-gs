/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('data_from_gs', function (table) {
    table.string('spreadsheetKey', 1000);
    table.integer('timeout');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('data_from_gs', function (table) {
    table.dropColumn('spreadsheetKey');
    table.dropColumn('timeout');
  });
};