const logger = require('winston').loggers.get('log');
const LabConfig = require('../../config/LabConfig');
var State = require('../State');
var spawn = require('child_process').spawn;
const zmq = require('zeromq');
const Adapter = require('../Adapter');

const CONTROLLER_PATH = "controllers/";

/**
 * Encapsulates the interaction with the C Server
 *
 * Provides an interface to control the hardware:
 * - start, play, pause, reset, end
 */
class PythonAdapter extends Adapter {
   constructor(options) {
     super();
     this.state = new PythonState();
//     this.toNotify = ['evolution'];
  }

  /**
   * Start the controller for user: 'username'.
   *   - If username is valid, then its controller is started.
   *   - If invalid or no username, the default controller is started.
   * @param {string} username The name of the user that request to start the controller.
   */
  start(username) {
    logger.debug(`User ${username} request to start Python controller`);
    if(this.connected) return;
    /* Start user or default controller */
    logger.info('Python Adapter: Starting default controller...');
    var filename = this._getControllerPath();
    logger.debug('python3 ' + filename);
    this.conn = spawn('sudo', ['python3', filename]);
    this.socket = zmq.socket('req');
    var endpoint = 'tcp://127.0.0.1:5555';
    this.socket.connect(endpoint);
    this.socket.on('message', this.ondata.bind(this));
    var endpointData = 'tcp://127.0.0.1:5556';
    this.datasocket = zmq.socket('sub');
    this.datasocket.connect(endpointData);
    this.datasocket.subscribe('evolution');
    this.datasocket.subscribe('config');
    this.datasocket.subscribe('reference');
    this.datasocket.on('message', this.ondata.bind(this));
  }

  _getControllerPath() {
    var name = this._getDefaultFolder('Python') + LabConfig.controller;
    if (!name.endsWith('.py')) {
      name += '.py';
    }
    return name;
  }

  _getDefaultFolder(language) {
    return `./${CONTROLLER_PATH}${language}/default/`;
  }

  /*
   * Format the data received from the controller and forward to the clients
   * @param {object} ev The event with the data received from the controller.
   */
  ondata(message) {
    var data = message.toString();
    this.state.update(data);
    for(var i=0; i<this.toNotify.length; i++) {
       var name = this.toNotify[i], value = this.state[name];
       var data = {'variable': name, 'value': value};
       this.notify('signals.get', data);
       logger.silly(`${name}->${value}`);
    }
  }

  /* Send a command to write the value of a variable in the C controller.
   * @param {string}   variable the name of the variable
   * @param {string}   value    the value of the variable
   * @param {function} callback Invoked after success
   */
  write(variable, value, callback) {
    try {
      this.socket.send(`${variable}:[${value}]`);
    } catch(e) {
      logger.error(`Python Adapter: Cannot write ${variable}. Ignore this message if appears immediately after disconnection.`)
    }
  }

  /* Compile the controller in userpath.
   * @param {string}   userpath the folder that contains the files that will be compiled
   * @param {function} callback Invoked with the result of the compilation
   */
  compile(userpath, callback) {
    logger.debug('Sorry, but Python is an interpreted language!');
  }
}

/* Encapsulate the state of the C controller */
class PythonState extends State {
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
      // let changed = ((!this._evolution && value) || Math.abs(this._evolution[0] - value[0])>1e-3);
      // if(this.config == 2 && changed) {
        this._evolution = value;
      // }
    } catch(e) {
      logger.warn('Python Adapter: Cannot set evolution');
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

module.exports.Adapter = PythonAdapter;
module.exports.State = PythonState;
module.exports.DefaultConfig = {};