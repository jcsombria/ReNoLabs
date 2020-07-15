const Logger = require('../Logger');

class CLogger extends Logger {
	constructor(stream) {
		super();
	}

	format(data) {
		if(data.variable == 'evolution') {
			var message = data.value +  " ";
			var toLog = message.replace(/,/g, " ");
			return toLog;
		}
	}
}

module.exports = CLogger;
