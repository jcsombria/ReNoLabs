const logger = require('winston').loggers.get('log');

module.exports = {
    'process_command': {
        condition: event => { // Rule condition
            let isCommand = (event.variable == 'config');
            return isCommand;
        },
        action: function(event) { // Rule action
            let action = Number(event.value);
            logger.debug(`Command ${action} received.`);
            switch(action) {
                case 0: this.stop(); break;
                case 1: this.start(); break;
                case 2: this.play(); break;
                case 3: this.pause(); break;
                case 4: this.reset(); break;
            }
        }
    }, 
    'forward_to_hardware': {
        condition: event => { // Rule condition
            let isCommand = (event.variable == 'config');
            return !isCommand;
        },
        action: function(event) { // Rule action
            logger.debug('Forwarding message to hardware.');
            this.hardware.write(event.variable, event.value);
        }
    }
}