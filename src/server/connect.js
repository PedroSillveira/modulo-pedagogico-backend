const { Pool } = require("pg");

const postgres = new Pool({
  database: "modulo-pedagogico",
  host: "localhost",
  user: "postgres",
  password: "password",
  port: 5432,
});

module.exports = { postgres: postgres };
