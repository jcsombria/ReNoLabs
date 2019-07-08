// TwinCAT Implementation
var TwinCAT = require('./hardware/TwinCAT-Quad');

// Application Configuration
var config = {
  WebServer: { // Web Server configuration
    ip: "127.0.0.1",
    port: 80,
  },
  Session: {
    timeout: 15, // minutes
  },
  Hardware: { // Hardware specific configuration
    Config: TwinCAT.Config,
    Adapter: TwinCAT.Adapter, // Implements the r/w API
    Logger: TwinCAT.Logger,
  }
}

module.exports = config;
