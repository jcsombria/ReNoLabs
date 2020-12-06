// Application Configuration
var config = {
  WebServer: { // Web Server configuration
    ip: "0.0.0.0",
    port: 8080,
  },
  Session: {
    timeout: 60, // minutes
  },
  // Hardware specific configuration (C, TwinCAT-Quad)
  Hardware: require('../hardware/C'),
  Lab: require('./LabConfig'),
  //RIP: require('./RIPConfig'),
}

module.exports = config;
