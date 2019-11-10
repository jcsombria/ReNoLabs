var C = require('./hardware/C');
var RIPConfig = require('./RIPConfig');

// Application Configuration
var config = {
  WebServer: { // Web Server configuration
    ip: "127.0.0.1",
    port: 8080,
  },
  Session: {
    timeout: 15, // minutes
  },
  // Hardware specific configuration
  Hardware: C,
  // Hardware: TwinCAT,
  RIP: RIPConfig,
  Lab: {
    GUI: 'motor_practice.ejs',
    GUI_JS: 'real.js',
  }
}
module.exports = config;
