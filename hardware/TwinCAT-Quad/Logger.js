const Logger = require('../Logger');

class TwinCATLogger extends Logger {
	constructor(stream) {
		super(stream);
	}

	log(data) {
		if(data.variable == 'evolution') {
			var message = data.value +  " ";
			var msg = message.replace(/,/g, " ");
			super.log(msg);
		}
	}
}

module.exports = TwinCATLogger;
