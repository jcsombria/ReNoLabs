// Application Configuration
module.exports = {
  WebServer: { // Web Server configuration
    ip: "127.0.0.1",
    port: 8080,
  },
  Session: {
    timeout: 60, // minutes
    disconnectTimeout: 60, // seconds
  },
  // Hardware specific configuration (C, TwinCAT-Quad)
  Hardware: require('../hardware/C'),
  Lab: require('./LabConfig'),
  //RIP: require('./RIPConfig'),
}
