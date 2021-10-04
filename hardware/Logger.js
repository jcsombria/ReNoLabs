var EventEmitter = require('events');
var DateFormat = require('dateformat');
const winston = require('winston');
const { format, transports } = winston;
const datalogger = winston.loggers.get('data');
const logger = require('winston').loggers.get('log');
const { InfluxDB, Point, HttpError } = require('@influxdata/influxdb-client')
const { url, token, org, bucket } = require('./env')
const { hostname } = require('os')
const writeApi = new InfluxDB({url, token}).getWriteApi(org, bucket, 'ns')
writeApi.useDefaultTags({location: hostname()})

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
				this._toInfluxDB(data);
			}
		} catch {
			logger.debug('Logger: Can\'t write log.');
		}
	}

	_toInfluxDB(data) {
		const point = new Point('evolution')
		.tag('user', this.username)
		.floatField('value', 10 + Math.round(100 * Math.random()) / 10)
		.timestamp(new Date());
		writeApi.writePoint(point);
		// console.log(` ${point.toLineProtocol(writeApi)}`)
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
		this.username = username;
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
