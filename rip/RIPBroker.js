var EventEmitter = require('events');
var RIP = require('./RIPGeneric');
var RIPConfig = require('../RIPConfig');

class RIPBroker extends EventEmitter {
	constructor(config) {
		super();
		this.on('serverOut_clientIn', this.update);
		this.SSEperiod = 100;
		// this.sse = new SSE([]);
		this.config = (config != undefined) ? config : RIPConfig;
		var labIp = config.ip + ':' + config.port;
		this.labInfo = new RIP.LabInfo(labIp, [config.name]);
		this.expInfo = new RIP.ExperienceInfo(this.labInfo,
			  config.name, config.description, config.readables, config.writables);
	}

	addListener(channel) {
		this.listeners.push(channel);
	}

	_set_variable(req, res) {
		adapter.write(data.variable, data.value);
	}

	info(expId) {
	  if(expId == this.expInfo.metadata.info.name) {
	    return this.expInfo.metadata;
	  } else {
	    this.labInfo.metadata;
	  };
	}

	update(state) {
		this.state = state;
		var toSend = {'names':[], 'values':[]};
		for (var v in state) {
			toSend['names'].push(v);
			toSend['values'].push(state[v]);

			eventdata = {'result': [names, values]};
		  eventname = 'periodiclabdata';
		  // sse.send(eventdata, eventname);
		}
	}
}

module.exports = RIPBroker;
