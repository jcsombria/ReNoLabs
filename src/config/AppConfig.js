// Application Configuration
module.exports = {
  WebServer: { // Web Server configuration
    sip: "127.0.0.1",
    port: 80,
  },
  Lab: require('./LabConfig'),
  RIP: require('./RIPConfig'),
}
