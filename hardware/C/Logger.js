const Logger = require('../Logger');

class CLogger extends Logger {
	constructor(stream) {
		super(stream);
	}

	log(data) {
		if(data.variable == 'evolution') {
			var message = data.value +  " ";
			this.stream.write(message.replace(/,/g, " ") + "\n");
		}
	}
}

module.exports = CLogger;
