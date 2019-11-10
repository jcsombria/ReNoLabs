var RIP = require('./rip/RIPGeneric');

// Application Configuration
var config = {
  'ip': '127.0.0.1',
  'port': 8080,
  'name': 'ReNoLabs',
  'description': 'RIP-ReNoLabs implementation',
  'readables': [
    new RIP.Variable('config'),
    new RIP.Variable('evolution'),
    new RIP.Variable('reference'),
    new RIP.Variable('controller'),
  ],
  'writables': [
		new RIP.Variable('config'),
    new RIP.Variable('evolution'),
    new RIP.Variable('reference'),
    new RIP.Variable('controller'),
  ]
};

module.exports = config;
