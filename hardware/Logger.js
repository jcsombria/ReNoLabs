var EventEmitter = require('events');
var DateFormat = require('dateformat');
var fs = require('fs');

class Logger extends EventEmitter {
	constructor(stream) {
		super();
		this.start(stream);
		this.on('serverOut_clientIn', this._log);
	}

	log(data) {
		logger.debug(data);
		this.stream.write(data);
	}

	_log(data) {
		try {
			this.log(data);
		} catch(error) {
			console.error('Can\'t write log.');
		}
	}

	start(prefix) {
		var logfile = this._getFolder() + this._getFilename(prefix);
		this.stream = fs.createWriteStream(logfile);
	}

	_getFolder() {
		return 'data/';
	}

	_getFilename(name) {
		var d = new Date();
		var date = DateFormat(d, "yyyymmdd_HHMMss");
		return name + '_' + date + '.txt';
	}

	end() {
		this.stream.end();
	}
}

module.exports = Logger;
