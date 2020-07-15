var EventEmitter = require('events');
var DateFormat = require('dateformat');
const winston = require('winston');
const { format, transports } = winston;
const datalogger = winston.loggers.get('data');
const logger = require('winston').loggers.get('log');

class Logger extends EventEmitter {
	constructor() {
		super();
		this.on('serverOut_clientIn', this._ondata.bind(this));
	}

	log(data) {
		try {
			datalogger.info(data);
		} catch {
			logger.debug('Logger: Can\'t write log.');
		}
	}

	_ondata(data) {
		try {
			var logData = this.format(data);
			if(logData) {
				this.log(logData);
			}
		} catch(error) {
			logger.debug('Logger: Can\'t format data.');
		}
	}

	format(data) {
		return data;
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
