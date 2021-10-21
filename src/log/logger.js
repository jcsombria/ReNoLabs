const winston = require('winston');
const Settings = require('../settings');
const { format, transports } = winston;

const consoleformat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

const fileformat = format.combine(
  format.timestamp(),
  format.json()
);

const errors = new transports.File({
  format: fileformat,
  filename: Settings.LOG + '/error.log', level: 'error',
});

const console_ = new transports.Console({
  format: consoleformat,
});

// System Events Logger
winston.loggers.add('log', {
  transports: [errors, console_]
});

const logger = require('winston').loggers.get('log');
logger.level = 'debug';

module.exports = winston;