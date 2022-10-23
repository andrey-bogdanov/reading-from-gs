/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("data_from_gs", function (table) {
    table.dropColumn("spreadsheetKey");
    table.string("spreadsheet_key", 1000);
    table.uuid("id").defaultTo(knex.raw('gen_random_uuid()'));
  })

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("data_from_gs", function (table) {
    table.dropColumn("spreadsheet_key");
    table.string("spreadsheetKey", 1000);
    table.dropColumn("id");
  })

};
