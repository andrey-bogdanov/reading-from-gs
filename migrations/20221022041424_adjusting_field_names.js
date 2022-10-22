/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("data_from_gs", function (table) {
    table.dropColumn("file_uri");
    table.string("spreadsheet_id");
    table.dropColumn("data");
    table.json("fields");
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("data_from_gs"), function (table) {
    table.dropColumn("spreadsheet_id");
    table.string("file_uri");
    table.dropColumn("fields");
    table.json("data")
  }

};
