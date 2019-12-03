const EventEmitter = require('events');
const RIP = require('./RIPGeneric');
const RIPConfig = require('../config/RIPConfig');
const SSE = require('express-sse');
const logger = require('winston').loggers.get('log');
const SessionManager = require('../sessions').SessionManager;
const jsonrpc = require('../rip/jsonrpc')

class RIPBroker extends EventEmitter {
	constructor(config) {
		super();
		this.on('serverOut_clientIn', this.update);
		this.SSEperiod = 100;
		this.sse = new SSE([]);
		var labIp = RIPConfig.ip + ':' + RIPConfig.port;
		this.labInfo = new RIP.LabInfo(labIp, [RIPConfig.name]);
		var ef = new ExperienceFactory();
		this.experiences = ef.createExperiences(this.labInfo);
		this.experience = this.experiences[RIPConfig.name];
		this.rpc = new jsonrpc.Server();
		this.rpc.on('set', 3, this.set);
	}

	process(jsonrpc) {
		this.rpc.process(jsonrpc);
	}

	set(expId, variables, values) {
		var exp = this._getExperience(expId);
		if(exp) {
			logger.debug(`${expId} -- Set ${variables}=${values}`);
			exp.set(variables, values);
		}
	}

	get(expId, variables, values) {
		var exp = this._getExperience(expId);
		if (exp) {
			logger.debug(`${expId} -- Get ${variables}=${values}`);
			exp.get(variables, values);
		}
	}

	_getExperience(expId) {
		for (var e in this.experiences) {
			if (expId == e) {
				return this.experiences[e];
			}
		}
	}

	info(expId) {
		var exp = this._getExperience(expId);
	  if(exp) {
			return exp.metadata;
	  } else {
	    return this.labInfo.metadata;
	  };
	}

	update(state) {
		this.state = state;
		var eventdata = {'result': [[state['variable']], [state['value']]]};
		var eventname = 'periodiclabdata';
		if(this.sse != undefined) {
	 		this.sse.send(eventdata, eventname);
	 	}
	}

	connect(expId) {
		return (expId == RIPConfig.name);
	}

	disconnect() {
		logger.info('RIP Session disconnected');
		var event = 'CLOSE';
		this.sse.send(event);
	}

	handle(req, res) {
		this.sse.init(req, res);
	}
}

class Experience {
	constructor(expInfo) {
		this.expInfo = expInfo;
		this.rpcserver = new jsonrpc.Server();
	}

	get name () {
		return this.expInfo.metadata.info.name;
	}

	get metadata() {
		return this.expInfo.metadata;
	}

	set(variables, values) {
		SessionManager.hw.write(variables, values);
	}

	get(variables) {
		SessionManager.hw.read(variables);
	}
}

class ExperienceFactory {
	createExperiences(labInfo) {
		var experiences = {};
		experiences[RIPConfig.name] = new RIP.ExperienceInfo(labInfo,
			RIPConfig.name, RIPConfig.description, RIPConfig.readables, RIPConfig.writables);
		return experiences;
	}
}

module.exports = RIPBroker;
