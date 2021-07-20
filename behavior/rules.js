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
                case 0: this.session.stop(); break;
                case 1: this.session.start(); break;
                case 2: this.session.play(); break;
                case 3: this.session.pause(); break;
                case 4: this.session.reset(); break;
            }
        }
    }, 
    'forward_to_hardware': {
        condition: event => { // Rule condition
            let isCommand = (event.variable == 'config');
            return !isCommand;
        },
        action: event => { // Rule action
            logger.debug('Forwarding message to hardware.');
            this.hardware.write(event.variable, event.value);
        }
    }
}