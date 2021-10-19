const logger = require('winston').loggers.get('log');
const HWConfig = require('./Config');
const LabConfig = require('../../config/LabConfig');
var State = require('../State');
var spawn = require('child_process').spawn;
const zmq = require('zeromq');
const Adapter = require('../Adapter');


/**
 * Encapsulates the interaction with the C Server
 *
 * Provides an interface to control the hardware:
 * - start, play, pause, reset, end
 */
class DobotAdapter extends Adapter {
   constructor(options) {
    super(options);
    this.state = new DobotState();
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
    var filename = this._getDefaultFolder('Dobot') + LabConfig.controller;
    this.conn = spawn('sudo',['python3', filename]);
    this.conn.on('error', function(error) {
      console.log(error);
    });
    this.socket = zmq.socket('req');
    //this.socket.on('message', this.ondata.bind(this));
    var endpoint = 'tcp://127.0.0.1:5555';
    this.socket.connect(endpoint);

    var endpointData = 'tcp://127.0.0.1:5556';
    this.datasocket = zmq.socket('sub');
    this.datasocket.connect(endpointData);
    this.datasocket.subscribe('pose');
    this.datasocket.on('message', this.ondata.bind(this));
  }

  /*
   * Format the data received from the C controller and forward to the clients
   * @param {object} ev The event with the data received from the controller.
   */
  ondata(message) {
    var data = message.toString().substr(5);
    // this.connected = true;
    this.state.update(data);
    for(var i=0; i<this.toNotify.length; i++) {
      var name = this.toNotify[i], value = this.state[name];
      var data = {'variable': name, 'value': value};
      this.notify('signals.get', data);
      logger.silly(`${name}->${value}`);
    }
  }

  /* Handles errors in the controller process.
   * @param {string} error The information about the error.
   */
  onerror(error) {
    logger.error(`Forcing controller stop: ${error}`);
  }

  /* Send a command to write the value of a variable in the C controller.
   * @patam {string}   variable the name of the variable
   * @patam {string}   value    the value of the variable
   * @patam {function} callback Invoked after success
   */
  write(variable, value, callback) {
    try {
      //this.state[variable] = value;
      this.socket.send(`${variable}:[${value}]`);
    } catch(e) {
      logger.error(`C Adapter: Cannot write ${variable}. Ignore this message if appears immediately after disconnection.`)
    }
  }
}

/* Encapsulate the state of the C controller */
class DobotState extends State {
  constructor() {
    super();
  }

  update(o) {
    try {
      var value = JSON.parse(`[${o}]`);
      this['pose'] = value;
    } catch(e) {
      logger.warn('Can\'t parse controller data.');
    }
  }

  notify(variables) {
     for (var i=0; i<this.listeners.length; i++) {
       try {
         for (var j=0; j<variables.length; j++) {
           this.listeners[i].write(variables[j], ()=>{});
         }
       } catch(error) {
         logger.warn(`C Adapter: Cannot notify listener.`);
       }
     }
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

  set pose(value) {
    try {
        this._pose = value;
    } catch(e) {
      logger.warn('C Adapter: Cannot set pose');
    }
  }

  get pose() {
    return this._pose;
  }

}

module.exports.Adapter = DobotAdapter;
module.exports.State = DobotState;
module.exports.DefaultConfig = HWConfig;
