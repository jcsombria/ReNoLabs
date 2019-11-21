const EventEmitter = require('events');
const RIP = require('./RIPGeneric');
const RIPConfig = require('../config/RIPConfig');
const SSE = require('express-sse');
const logger = require('winston');
const SessionManager = require('../sessions').SessionManager;

class RIPBroker extends EventEmitter {
	constructor(config) {
		super();
		this.on('serverOut_clientIn', this.update);
		this.SSEperiod = 100;
		this.sse = new SSE([]);
		this.config = (config != undefined) ? config : RIPConfig;
		var labIp = config.ip + ':' + config.port;
		this.labInfo = new RIP.LabInfo(labIp, [config.name]);
		this.expInfo = new RIP.ExperienceInfo(this.labInfo,
			config.name, config.description, config.readables, config.writables);
	}

	_set_variable(req, res) {
		adapter.write(data.variable, data.value);
	}

	info(expId) {
	  if(expId == this.expInfo.metadata.info.name) {
	    return this.expInfo.metadata;
	  } else {
	    return this.labInfo.metadata;
	  };
	}

	update(state) {
		this.state = state;
		var toSend = {'names':[], 'values':[]};
		for (var v in state) {
			toSend['names'].push(v);
			toSend['values'].push(state[v]);
			var eventdata = {'result': [toSend['names'], toSend['values']]};
			var eventname = 'periodiclabdata';
			if(this.sse != undefined) {
				this.sse.send(eventdata, eventname);
			}
		}
	}

	connect(expId) {
		return (expId == RIPConfig.name);
	}

	handle(req, res) {
		this.sse.init(req, res);
	}
}

// Handler
module.exports = RIPBroker;
