const path = require('path');
const BASE = process.env.BASE || path.normalize(__dirname + '/..');
const CODEBASE = process.env.CODEBASE || `${BASE}/src`;
const PUBLIC = `${BASE}/public`;
const SQLITE_DB_FILE = process.env.SQLITE_DB_FILE || `${BASE}/var/db/database.sqlite`;

module.exports = {
  DB_SERVER: 'mariadb',
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
  ACCESS_TOKEN_SECRET: '',
  REFRESH_TOKEN_SECRET: '',
};
