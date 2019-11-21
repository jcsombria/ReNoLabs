// System Events Logger
const winston = require('winston');
const { format, transports } = winston;
const errors = new transports.File({filename:'log/error.log', level:'error'});
const debug = new transports.File({filename:'log/combined.log', level:'info'});
const console = new transports.Console({format: format.simple()});
winston.level = 'debug';
winston.add(errors);
winston.add(debug);
winston.add(console);

// Application Configuration
var config = {
  WebServer: { // Web Server configuration
    ip: "127.0.0.1",
    port: 8080,
  },
  Session: {
    timeout: 15, // minutes
  },
  // Hardware specific configuration (C, TwinCAT-Quad)
  // Hardware: require('../hardware/TwinCAT-Quad'),
  Hardware: require('../hardware/C'),
  RIP: require('./RIPConfig'),
  Lab: require('./LabConfig'),
}

module.exports = config;
