const logger = require('winston').loggers.get('log');
const HWConfig = require('./Config');
const LabConfig = require('../../config/LabConfig');
const fs = require('fs');
const path = require('path');
var State = require('../State');
var spawn = require('child_process').spawn;
const zmq = require('zeromq');

const CONTROLLER_PATH = "controllers/";
const CONTROLLER_USER_PATH = "users/";

/**
 * Encapsulates the interaction with the C Server
 *
 * Provides an interface to control the hardware:
 * - start, play, pause, reset, end
 */
class CAdapter {
   constructor(options) {
    this.listeners = [];
    this.connected = false;
    this.conn = null;
    this.toNotify = ['config', 'evolution', 'reference', 'controller'];
    this.state = new CState();
    this.options = (options !== undefined) ? options : HWConfig;
  }

  // TO DO: extract the interface listener?
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
    logger.debug(`User ${username} request to start Dobot controller`);
    if(this.connected) return;
    /* Start user or default controller */
    logger.info('Dobot Adapter: Starting default controller...');
    this.conn = spawn('sudo', [this._getDefaultFolder('Dobot') + LabConfig.controller]);
    this.socket = zmq.socket('req');

    this.socket.on('message', this.ondata.bind(this));
    var endpoint = 'tcp://127.0.0.1:5555';
    socket.connect(endpoint);
  }

  _getDefaultFolder(language) {
    return `./${CONTROLLER_PATH}${language}/default/`;
  }

  /*
   * Format the data received from the C controller and forward to the clients
   * @param {object} ev The event with the data received from the controller.
   */
  ondata(ev) {
    console.log(ev);
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
    logger.error(`C Adapter: ${error}`);
  }

  /* Read the cached value of a variable of the C controller.
   * @patam {string} variable the name of the variable
   */
  read(variable) {
    try {
      return this.state[variable];
    } catch(e) {
      logger.error(`C Adapter: Cannot read ${variable}`)
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
      logger.error(`C Adapter: Cannot write ${variable}. Ignore this message if appears immediately after disconnection.`)
    }
  }

  /* Send 'play' command to C controller. */
  play() {
    logger.info('C Adapter: Sending play to C controller.');
    this.write('config', 2);
  }

  /* Send 'pause' command to C controller. */
  pause() {
    logger.info('C Adapter: Sending pause to C controller.');
    this.write('config', 3);
  }

  /* Send 'reset' command to C controller. */
  reset() {
    logger.info('C Adapter: Sending reset to C controller.');
    this.write('config', 4);
  }

  /* Send 'end' command to C controller. */
  end() {
    logger.info('C Adapter: Sending stop to C controller.');
    this.write('config', 0);
    this.connected = false;
//    this.state.removeListener(this.conn);
  }

  /* Compile the controller in userpath.
   * @patam {string}   userpath the folder that contains the files that will be compiled
   * @patam {function} callback Invoked with the result of the compilation
   */
  compile(userpath, callback) {
    logger.debug(userpath);
    var p = spawn('make', ['-C', userpath, '-f', 'Makefile', 'c_controller'], {shell:true});
    // Stores the compiler output & errors
    let compiler_stdout = '';
    p.stdout.setEncoding('utf8');
    p.stdout.on('data', function(data) {
      compiler_stdout += data;
    });
    let compiler_stderr = '';
    p.stderr.setEncoding('utf8');
    p.stderr.on('data', function(data) { compiler_stderr += data; });
    // Return the compilation results on exit
    p.on('exit', function(code, signal) {
      if (code == null) {
        logger.error(`C Adapter: Process ended due to signal: ${signal}`);
      } else {
        logger.error(`C Adapter: Process ended with code: ${code}`);
      }
      if (callback != null) {
        let result = {
          status: code,
          message: signal,
          stdout: compiler_stdout,
          stderr: compiler_stderr,
        };
        callback(result);
      }
    });
  }
}

/* Encapsulate the state of the C controller */
class CState extends State {
  constructor() {
    super();
  }

  update(o) {
    try {
      var lines = o.split("\n");
      for (var l in lines) {
	if(lines[l].length > 0) {
          var variable = lines[l].split(":")[0];
          var value = JSON.parse(lines[l].split(/:|\n/)[1]);
          this[variable] = value;
        }
      }
    } catch(e){
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

  set evolution(value) {
    try {
      let changed = ((!this._evolution && value) || Math.abs(this._evolution[0] - value[0])>1e-3);
      if(this.config == 2 && changed) {
        this._evolution = value;
      }
    } catch(e) {
      logger.warn('C Adapter: Cannot set evolution');
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

module.exports.Adapter = CAdapter;
module.exports.State = CState;
module.exports.DefaultConfig = HWConfig;