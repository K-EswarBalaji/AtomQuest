require('dotenv').config();

module.exports = {
  development: {
    // Use SQLite for local development (no external database needed)
    database: process.env.DB_STORAGE || './database.sqlite',
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false
  },
  test: {
    username: 'goalquest_test',
    password: 'test_password',
    database: 'goalquest_test_db',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    ssl: true
  }
};
