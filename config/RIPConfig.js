var RIP = require('../rip/RIPGeneric');

// Application Configuration
var config = {
  'ip': '127.0.0.1',
  'port': 8080,
  'name': 'ReNoLabs',
  'description': 'RIP-ReNoLabs implementation',
  'readables': [
    new RIP.Variable('config', 'config', 'array'),
    new RIP.Variable('evolution', 'evolution', 'array'),
    new RIP.Variable('reference', 'reference', 'array'),
    new RIP.Variable('controller', 'controller', 'array'),
  ],
  'writables': [
    new RIP.Variable('config', 'config', 'array'),
    new RIP.Variable('evolution', 'evolution', 'array'),
    new RIP.Variable('reference', 'reference','array'),
    new RIP.Variable('controller', 'controller','array'),
  ]
};

module.exports = config;
