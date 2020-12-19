// Application Configuration
module.exports = {
  WebServer: { // Web Server configuration
    ip: "147.96.67.49",
    port: 80,
  },
  Session: {
    timeout: 60, // minutes
    disconnectTimeout: 20, // seconds
  },
  // Hardware specific configuration (C, TwinCAT-Quad)
  Hardware: require('../hardware/C'),
  Lab: require('./LabConfig'),
  //RIP: require('./RIPConfig'),
}
