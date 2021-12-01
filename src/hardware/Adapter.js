const logger = require('winston').loggers.get('log');
const spawn = require('child_process').spawn;
const State = require('./State');
const Settings = require('../settings');

/**
 * Encapsulates the interaction with the hardware controller
 *
 * Provides an interface to control the hardware:
 * - start, play, pause, reset, end
 */
class Adapter {

  /**
   * @param {Controller} controller The controller info.
   */
  constructor(controller, options) {
    this.listeners = [];
    this.connected = false;
    this.conn = null;
    this.toNotify = ['config', 'evolution', 'reference', 'controller'];
    this.state = new State();
    this.options = options; //(options !== undefined) ? options : HWConfig;
    this.controller = controller;
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
  }

  _getDefaultFolder(language) {
    return `${Settings.CONTROLLERS}/${language}/default/`;
  }

  /*
   * Format the data received from the C controller and forward to the clients
   * @param {object} ev The event with the data received from the controller.
   */
  ondata(ev) {
    logger.error('Adapter: ondata is NOT Implemented and should not have been invoked! It MUST be overriden by subclasses.');
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
    logger.error('Adapter: stop is NOT Implemented and should not have been invoked! It MUST be overriden by subclasses.');
  }

  /* Handles errors in stderr.
   * @param {string} error The information about the error.
   */
  onerrordata(error) {
    logger.error('Adapter: onerrordata is NOT Implemented and should not have been invoked! It MUST be overriden by subclasses.');
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

  _prepareUserFolder(username, language) {
    let user_path = this._getUserFolder(username, language);
    try {
      var stats = fs.statSync(user_path);
    } catch (e) {
      logger.debug('Folder not found!');
      let default_path = this._getDefaultFolder(language);
      logger.debug(`Copying default controller ${default_path}->${user_path}`);
      var fileNames = fs.readdirSync(default_path);
      logger.debug(fileNames);
      fs.mkdirSync(user_path, {recursive: true});
      for (var i = 0; i < fileNames.length; i++) {
        var name = fileNames[i];
        var content = fs.readFileSync(default_path + name);
        var stats = fs.statSync(default_path + name);
        fs.writeFileSync(user_path + name, content, {mode: stats.mode});
      }
    }
  }

  /** Copy files to userpath */
  _copyFiles(files, userpath, is_selectable) {
    logger.debug('Copying files!');
    for (var f in files) {
      var filename = files[f].filename;
      var content = files[f].code;
      logger.debug(`file: ${filename}`);
      if(!is_selectable || is_selectable(filename)) {
        var code_stream = fs.createWriteStream(userpath + filename);
        code_stream.write(content);
        code_stream.end();
      }
    }
  }
}

module.exports = Adapter;