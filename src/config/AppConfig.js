// Application Configuration
module.exports = {
  WebServer: { // Web Server configuration
    ip: "127.0.0.1",
    port: 8080,
  },
  Lab: require('./LabConfig'),
  RIP: require('./RIPConfig'),
}
