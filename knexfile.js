module.exports = {
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING
    || {
    user: 'postgres',
    database: 'reading_from_gs'
  }
};
