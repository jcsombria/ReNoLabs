// Application Configuration
module.exports = {
  WebServer: { // Web Server configuration
    ip: "147.96.71.95",
    //ip: "127.0.0.1",
    port: 80,
  },
  Session: {
    timeout: 30, // minutes
    disconnectTimeout: 25, // seconds
  },
  // Hardware specific configuration (C, TwinCAT-Quad)
  Hardware: require('../hardware/C'),
  Lab: require('./LabConfig'),
  RIP: require('./RIPConfig'),
}
