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

const Settings = require('../settings');

class Logger extends EventEmitter {
	constructor() {
		super();
		this.on('signals.get', this._ondata.bind(this));
		this.started = DateFormat(new Date(), "yyyymmdd_HHMMss");
		this.datalogger = winston.loggers.get(this.started);
	}

	log(data) {
		logger.silly('Logging hardware data.');
		try {
			if (data) {
				this.datalogger.info(data);
				// this._toInfluxDB(data);
			}
		} catch(e) {
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
		this.logfile = new transports.File({
			format: format.printf((info) => { return `${info.message}`; }),
			filename: this._getFilename(username),
			level: 'silly',
		});
		this.datalogger.clear().add(this.logfile);
	}

	end() {
		this.datalogger.remove(this.logfile);
	}

	_getFilename(name) {
		var date = DateFormat(new Date(), "yyyymmdd_HHMMss");
		return `${Settings.DATA}/${name}_${date}.txt`;
	}


	get name() {
		return `${this.username}_${this.started}.txt`;
	}
}

module.exports = Logger;
