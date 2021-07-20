var EventEmitter = require('events');
var DateFormat = require('dateformat');
const winston = require('winston');
const { format, transports } = winston;
const datalogger = winston.loggers.get('data');
const logger = require('winston').loggers.get('log');

class Logger extends EventEmitter {
	constructor() {
		super();
		this.on('signals.get', this._ondata.bind(this));
	}

	log(data) {
		logger.silly('Logging hardware data.');
		try {
			if (data) {
				datalogger.info(data);
			}
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
		var logfilename = this._getFolder() + this._getFilename(username);
		this.logfile = new transports.File({
			format: format.printf((info) => { return `${info.message}`; }),
			filename: logfilename,
			level: 'silly',
		});
		datalogger.clear().add(this.logfile);
	}

	end() {
		datalogger.remove(this.logfile);
	}

	_getFolder() {
		return 'data/';
	}

	_getFilename(name) {
		var date = DateFormat(new Date(), "yyyymmdd_HHMMss");
		return name + '_' + date + '.txt';
	}
}

module.exports = Logger;
