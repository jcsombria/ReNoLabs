const logger = require('winston').loggers.get('log');
// const LabConfig = require('../config/LabConfig');
const State = require('./State');
const spawn = require('child_process').spawn;

const CONTROLLER_PATH = "controllers/";
// const CONTROLLER_USER_PATH = "users/";

/**
 * Encapsulates the interaction with the hardware controller
 *
 * Provides an interface to control the hardware:
 * - start, play, pause, reset, end
 */
class Adapter {
  constructor(options) {
    this.listeners = [];
    this.connected = false;
    this.conn = null;
    this.toNotify = ['config', 'evolution', 'reference', 'controller'];
    this.state = new State();
    this.options = options; //(options !== undefined) ? options : HWConfig;
  }

  // Interface listener
  // {
  addListener(o) {
    if(!(o in this.listeners)) {
      this.listeners.push(o);
    }
  }

  removeListener(o) {
    var i = this.listeners.indexOf(o);
    if(i != -1) {
      this.listeners.splice(i, 1);
    }
  }
  // }

  /**
   * Start the controller for user: 'username'.
   *   - If username is valid, then its controller is started.
   *   - If invalid or no username, the default controller is started.
   * @param {string} username The name of the user that request to start the controller.
   */
  start(username) {
    logger.error('Adapter: start is NOT Implemented and should not have been invoked! It MUST be overriden by subclasses.');
    // logger.debug(`User ${username} request to start controller`);
    // if(this.connected) return;
    // logger.info('Dobot Adapter: Starting default controller...');
    // this.conn = spawn('sudo', [this._getDefaultFolder('Dobot') + LabConfig.controller]);
  }

  _getDefaultFolder(language) {
    return `./${CONTROLLER_PATH}${language}/default/`;
  }

  /*
   * Format the data received from the C controller and forward to the clients
   * @param {object} ev The event with the data received from the controller.
   */
  ondata(ev) {
    logger.error('Adapter: ondata is NOT Implemented and should not have been invoked! It MUST be overriden by subclasses.');
    // this.connected = true;
    // this.state.update(ev);
    // for(var i=0; i<this.toNotify.length; i++) {
    //   var name = this.toNotify[i], value = this.state[name];
    //   var data = {'variable': name, 'value': value};
    //   this.notify('signals.get', data);
    //   logger.silly(`${name}->${value}`);
    // }
  }

  /*
   * Send data to the registered listeners.
   * @param {object} ev   The event id.
   * @param {object} data The event data.
   */
  notify(ev, data) {
    for(var i=0; i<this.listeners.length; i++) {
      logger.silly(`notify ${ev} to listener ${i}`);
      this.listeners[i].emit(ev, data);
    }
  }

  /* Handles errors in the controller process.
   * @param {string} error The information about the error.
   */
  onerror(error) {
    logger.error(`Forcing controller stop: ${error}`);
  }

  /* Handles errors in stderr.
   * @param {string} error The information about the error.
   */
  onerrordata(error) {
    logger.error(`Adapter: ${error}`);
  }

  /* Read the cached value of a variable of the C controller.
   * @patam {string} variable the name of the variable
   */
  read(variable) {
    try {
      return this.state[variable];
    } catch(e) {
      logger.error(`Adapter: Cannot read ${variable}`)
    }
  }

  /* Send a command to write the value of a variable in the C controller.
   * @patam {string}   variable the name of the variable
   * @patam {string}   value    the value of the variable
   * @patam {function} callback Invoked after success
   */
  write(variable, value, callback) {
    try {
      //this.state[variable] = value;
      this.conn.stdin.write(variable + ':' + value);
      logger.debug(`${variable}->${value}`);
    } catch(e) {
      logger.error(`Adapter: Cannot write ${variable}. Ignore this message if appears immediately after disconnection.`)
    }
  }

  /* Send 'play' command to controller. */
  play() {
    logger.info('Adapter: Sending play to controller.');
    this.write('config', 2);
  }

  /* Send 'pause' command to controller. */
  pause() {
    logger.info('Adapter: Sending pause to controller.');
    this.write('config', 3);
  }

  /* Send 'reset' command to controller. */
  reset() {
    logger.info('Adapter: Sending reset to controller.');
    this.write('config', 4);
  }

  /* Send 'stop' command to controller. */
  stop() {
    logger.info('Adapter: Sending stop to controller.');
    this.write('config', 0);
    this.connected = false;
//    this.state.removeListener(this.conn);
  }

  /* Compile the controller in userpath.
   * @patam {string}   userpath the folder that contains the files that will be compiled
   * @patam {function} callback Invoked with the result of the compilation
   */
  compile(userpath, callback) {
    logger.error('Adapter: compile is NOT Implemented and should not have been invoked! It MUST be overriden by subclasses.');
  }
}

module.exports = Adapter;