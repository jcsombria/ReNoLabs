const logger = require('winston').loggers.get('log');
var spawn = require('child_process').spawn;
const zmq = require('zeromq');

const Adapter = require('../Adapter');

/**
 * Encapsulates the interaction with the Dobot Server
 */
class DobotAdapter extends Adapter {
   constructor(controller, options) {
    super(controller, options);
    this.toNotify = ['config', 'evolution'];
  }

  /**
   * Start the controller for user: 'username'.
   *   - If username is valid, then its controller is started.
   *   - If invalid or no username, the default controller is started.
   * @param {string} username The name of the user that request to start the controller.
   */
  start(username) {
    logger.debug(`User ${username} request to start Dobot controller`);
    if(this.connected) return;
    /* Start user or default controller */
    logger.info('Dobot Adapter: Starting default controller...');
    this.conn = spawn('sudo',['python3', `../var/controllers/${this.controller.id}/${this.controller.path}`]);
    this.conn.on('error', function(error) { console.log(error); });
    this.commandSocket = zmq.socket('req');
    //this.commandSocket.on('message', this.ondata.bind(this));
    var endpoint = 'tcp://127.0.0.1:5555';
    this.commandSocket.connect(endpoint);
    var endpointData = 'tcp://127.0.0.1:5556';
    this.dataSocket = zmq.socket('sub');
    this.dataSocket.connect(endpointData);
    this.dataSocket.subscribe('evolution');
    this.dataSocket.on('message', this.ondata.bind(this));
  }

  /*
   * Format the data received from the controller and forward to the clients
   * @param {object} ev The event with the data received from the controller.
   */
  ondata(message) {
    this.state.update(message.toString());
    this.toNotify.forEach(v => {
      this.notify('signals.get', {
        'variable': v,
        'value': this.state[v]
      });
      logger.silly(`${v}->${this.state[v]}`);
    });
  }

  /* Send a command to write the value of a variable in the controller.
   * @patam {string}   variable the name of the variable
   * @patam {string}   value    the value of the variable
   * @patam {function} callback Invoked after success
   */
  write(variable, value, callback) {
    try {
      this.state[variable] = value;
      console.log(`${variable}:[${value}]`);
      this.commandSocket.send(`${variable}:[${value}]`);
    } catch(e) {
      logger.error(`0mq Adapter: Cannot write ${variable}. Ignore this message if appears immediately after disconnection.`)
    }
  }
}

module.exports.Adapter = DobotAdapter;