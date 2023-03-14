const logger = require('winston').loggers.get('log');
var State = require('../State');
const zmq = require('zeromq');
const Adapter = require('../Adapter');

/**
 * Encapsulates the interaction with a remote agent
 *
 * Provides an interface to control the hardware:
 * - start, play, pause, reset, end
 */
class Agent extends Adapter {
   constructor(controller) {
     super(controller);
     this.state = new AgentState();
  }

  /**
   * Start the controller for user: 'username'.
   *   - If username is valid, then its controller is started.
   *   - If invalid or no username, the default controller is started.
   * @param {string} username The name of the user that request to start the controller.
   */
  start(username) {
    logger.debug(`User ${username} request to start Agent`);
    logger.info('Starting default Agent...');
    this.config = JSON.parse(this.controller.config);
    this.control = zmq.socket('req');
    this.control.connect(`tcp://${this.config.url}:5555`);
    this.data = zmq.socket('sub');
    this.data.connect(`tcp://${this.config.url}:5556`);
    this.data.subscribe('evolution');
    this.data.subscribe('config');
    this.data.subscribe('reference');
    this.data.on('message', this.ondata.bind(this));
  }

  stop() {
    super.stop();
    this.control.close();
    this.data.close();
  }

  /*
   * Format the data received from the controller and forward to the clients
   * @param {object} ev The event with the data received from the controller.
   */
  ondata(topic, message) {
    try {
      var data = JSON.parse(message.toString());
      if(this.config.target != data.source) { return; }
      if (topic == 'evolution') {
        for (var value of data.payload) {
          this.notify('signals.get', { 'variable': 'evolution', 'value': value });
          logger.silly(`evolution->${value}`);
        }
      }
      if (topic == 'reference') {
        this.notify('signals.get', { 'variable': 'reference', 'value': data.payload });
        logger.silly(`reference->${data.payload}`);
      }
    } catch(e) {
      logger.debug(e);
    }
  }

  /* Send a command to write the value of a variable in the controller.
   * @param {string}   variable the name of the variable
   * @param {string}   value    the value of the variable
   * @param {function} callback Invoked after success
   */
  write(variable, value, callback) {
    try {
      this.control.send(JSON.stringify({ 'target': this.config.target, 'variable': variable, 'value': value }));
    } catch(e) {
      logger.error(`Agent: Cannot write ${variable}. Ignore this message if appears immediately after disconnection.`)
    }
  }

  /* Compile the controller in userpath.
   * @param {string}   userpath the folder that contains the files that will be compiled
   * @param {function} callback Invoked with the result of the compilation
   */
  compile(userpath, callback) {
    logger.debug('Sorry, but we still cannot compile remotely!');
  }
}

/* Encapsulate the state of the controller */
class AgentState extends State {
  constructor() {
    super();
  }

  set config(value) {
    this._config = value;
    this.notify(['config:' + value]);
  }

  get config() {
    return this._config;
  }

  set reference(value) {
    this._reference = value;
    this.notify(['reference:' + value]);
  }

  get reference() {
    return this._reference;
  }

  set evolution(value) {
    try {
      this._evolution = value;
    } catch(e) {
      logger.warn('Agent: Cannot set evolution');
    }
  }

  get evolution() {
    return this._evolution;
  }

  set controller(value) {
    this._controller = value;
    this.notify(['controller:' + value]);
  }

  get controller() {
    return this._controller;
  }
}

module.exports.Adapter = Agent;
module.exports.State = AgentState;
module.exports.DefaultConfig = {};
