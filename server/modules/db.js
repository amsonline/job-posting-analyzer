const config = require('./config');
const pgp = require('pg-promise')();
const db = pgp(
    `postgresql://${config.DB_USER}@${config.DB_HOST}:5432/${config.DB_NAME}`
);

db.none(`SET search_path TO ${config.DB_SCHEMA}`);

module.exports = db;
