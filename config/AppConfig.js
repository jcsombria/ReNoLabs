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
  Hardware: require('../hardware/TwinCAT-Quad'),
  // Hardware: require('../hardware/C'),
  RIP: require('./RIPConfig'),
  Lab: require('./LabConfig'),
}

module.exports = config;
