module.exports = {
  client: 'pg',
  connection: {
    user: 'postgres',
    database: 'reading_from_gs'
  },
  searchPath: ['knex', 'public']
};
