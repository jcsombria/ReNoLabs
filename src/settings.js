const path = require('path');
const BASE = process.env.BASE || path.normalize(__dirname + '/..');
const CODEBASE = process.env.CODEBASE || `${BASE}/src`;
const PUBLIC = `${BASE}/public`;
const SQLITE_DB_FILE = process.env.SQLITE_DB_FILE || `${BASE}/var/db/database.sqlite`;

module.exports = {
  DB_SERVER: 'sqlite',
  MARIADB_DATABASE: 'renolabs',
  MARIADB_USER: 'renolabs',
  MARIADB_PASSWORD: 'renolabs',
  SQLITE_DB_FILE: SQLITE_DB_FILE,
  CONFIG: `${CODEBASE}/config`,
  PUBLIC: PUBLIC,
  TEMPLATES: `${CODEBASE}/templates`,
  VIEWS_SERVE: `${PUBLIC}/views`,
  CONTROLLERS: `${BASE}/var/controllers`,
  VIEWS: `${BASE}/var/views`,
  DATA: `${BASE}/var/data`,
  LOG: `${BASE}/var/log`,
  ACCESS_TOKEN_SECRET: 'ede2c8ab1da771b825fac710038009a73844f42786ae035528ec04b289d4ae79d42c63f57245418f810cfa8478eaabdbf2ddccad3d7167ec1ad14789b2f7b676',
  REFRESH_TOKEN_SECRET: '8f4a8736d16c72ce1defb8fadcefb8618e2e206701192d938b36739de4bfec1420999ce94c490a1a3cc4453fd99f874ca2ab9231bf3bdfb782e49718c3151a1a'
};