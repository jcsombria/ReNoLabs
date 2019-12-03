var EventEmitter = require('events');
var DateFormat = require('dateformat');
const winston = require('winston');
const { format, transports } = winston;
const datalogger = winston.loggers.get('data');

class Logger extends EventEmitter {
	constructor() {
		super();
		this.on('serverOut_clientIn', this._log);
	}

	log(data) {
		datalogger.info(data);
	}

	_log(data) {
		try {
			this.log(data);
		} catch(error) {
			logger.error('Logger: Can\'t write log.');
		}
	}

	start(username) {
		var logfile = this._getFolder() + this._getFilename(username);
		datalogger.clear()
			.add(new transports.File({
			format: format.printf((info) => { return `${info.message}`; }),
			filename: logfile,
			level: 'silly',
		}));
		datalogger.info('% User: ');
		datalogger.info('% Cols: time y0 y1 ...');
		datalogger.info('data = [');
	}

	_getFolder() {
		return 'data/';
	}

	_getFilename(name) {
		var date = DateFormat(new Date(), "yyyymmdd_HHMMss");
		return name + '_' + date + '.txt';
	}

	end() {
		datalogger.info(']');
	}
}

module.exports = Logger;
