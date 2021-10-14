const logger = require('winston').loggers.get('log');
const HWConfig = require('./Config');
const LabConfig = require('../../config/LabConfig');
var spawn = require('child_process').spawn;
const Adapter = require('../Adapter');
const Settings = require('../../settings');
var State = require('../State');

/**
 * Encapsulates the interaction with the C Server
 *
 * Provides an interface to control the hardware:
 * - start, play, pause, reset, end
 */
class CAdapter extends Adapter {
  constructor(options) {
    super(options);
    this.state = new CState();
  }

  /**
   * Start the controller for user: 'username'.
   *   - If username is valid, then its controller is started.
   *   - If invalid or no username, the default controller is started.
   * @param {string} username The name of the user that request to start the controller.
   */
  start(username) {
    logger.debug(`User ${username} request to start C controller`);
    if(this.connected) return;
    /* Start user or default controller */
    //if (!username) {
      logger.info('C Adapter: Starting default controller...');
      this.conn = spawn('sudo', [this._getDefaultFolder('C') + LabConfig.controller]);
    //} else {
    //  logger.info(`C Adapter: Starting user controller (${username})...`);
    //  this._prepareUserFolder(username, 'C');
    //  this.conn = spawn('sudo', [this._getUserFolder(username, 'C') + LabConfig.controller]);
    //}
    // I commented this code and the method definition below because it was never reached
    // I have to check why the event 'spawn' is not being notified
    //this.conn.on('spawn', this.onstart.bind(this));
    this.conn.on('error', this.onerror.bind(this));
    this.conn.on('close', function() {this.connected = false;}.bind(this));
    /* En caso de fallo del controlador resetea las variables config y evolucion. */
    this.conn.on('exit', function(code, string) {
      logger.info(`Exiting controller with error ${code}`)
      if (code == null) {
        this.state['config'] = 0;
        var e = new Array(4); for (var i = 0; i < 18; i++) { e[i] = 0; }
        this.state['evolution'] = e;
      }
    }.bind(this));
    // Redirect stdout/stderr to log
    this.conn.stdout.setEncoding('utf8');
    this.conn.stdout.on('data', this.ondata.bind(this));
    this.conn.stderr.on('data', this.onerrordata.bind(this));
  }

  /*
   * Format the data received from the C controller and forward to the clients
   * @param {object} ev The event with the data received from the controller.
   */
  ondata(ev) {
    this.connected = true;
    this.state.update(ev);
    for(var i=0; i<this.toNotify.length; i++) {
      var name = this.toNotify[i], value = this.state[name];
      var data = {'variable': name, 'value': value};
      this.notify('signals.get', data);
      logger.silly(`${name}->${value}`);
    }
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
