const logger = require('winston').loggers.get('log');
const HWConfig = require('./Config');
const LabConfig = require('../../config/LabConfig');
//const { Updater } = require('../../updater');
var State = require('../State');
var spawn = require('child_process').spawn;

/** 
 * Encapsulates the interaction with the C Server 
 * 
 * Provides an interface to control the hardware:
 * - start
 * - play
 * - pause
 * - reset
 * - end
 */
class CAdapter {
   constructor(options) {
    this.listeners = [];
    this.connected = false;
    this.conn = null;
    this.toNotify = ['config', 'evolution', 'reference'];
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
   * 
   * If username is valid, then its controller is started.
   * If invalid or no username, the default controller is started.
   */
  start(username) {
    logger.debug(`User ${username} request to start C controller`);
    if(this.connected) return;
    /* Start user or default controller */
    if (!username) {
      logger.info('C Adapter: Starting default controller...');
      this.conn = spawn('sudo', ['./controllers/C/default/' + LabConfig.controller]);
    } else {
      logger.info(`C Adapter: Starting user controller (${username})...`);
      // TO DO: Move _prepare_dev_folder to CAdapter
      //Updater._prepare_dev_folder(username, 'C');
      this.conn = spawn('sudo', ['./controllers/C/users/' + username + '/' + LabConfig.controller]);
    }
    // JCS: I commented this code and the method definition below because it was never reached
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

// JCS: I commented this code because it was never reached
//  onstart() {
//    logger.debug('Controller spawned.');
//    this.connected = true;
//    this.state.addListener(this.conn);
//  }

  /* Format the data received from the C controller and forward to the clients */
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
  
  /* Send data to the registered listeners. */
  notify(ev, data) {
    for(var i=0; i<this.listeners.length; i++) {
      logger.silly(`notify ${ev} to listener ${i}`);
      this.listeners[i].emit(ev, data);
    }
  }

  /* Handles errors in the controller process */
  onerror(error) {
    logger.error(`Forcing controller stop: ${error}`);
  }

  /* Handles errors in stderr */
  onerrordata(error) {
    logger.error(`C Adapter: ${error}`);
  }

  /* Read the cached value of a variable of the C controller */
  read(variable) {
    try {
      return this.state[variable];
    } catch(e) {
      logger.error(`C Adapter: Cannot read ${variable}`)
    }
  }

  /* Send a command to write the value of a variable in the C controller */
  write(variable, value, callback) {
    try {
      this.state[variable] = value;
      this.conn.stdin.write(variable + ':' + value);
      logger.debug(`${variable}->${value}`);
    } catch(e) {
      logger.error(`C Adapter: Cannot write ${variable}`)
    }
  }

  /* Send 'play' command to C controller */
  play() {
    logger.info('C Adapter: Sending play to C controller.');
    this.write('config', 2);
  }

  /* Send 'pause' command to C controller */
  pause() {
    logger.info('C Adapter: Sending pause to C controller.');
    this.write('config', 3);
  }
  
  /* Send 'reset' command to C controller */
  reset() {
    logger.info('C Adapter: Sending reset to C controller.');
    this.write('config', 4);
  }
 
  /* Send 'end' command to C controller */
  end() {
    logger.info('C Adapter: Sending stop to C controller.');
    this.write('config', 0);
    this.connected = false;
//    this.state.removeListener(this.conn);
  }

  /* Compile the controller in userpath. */
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
      var variable = o.split(":")[0];
      var value = JSON.parse(o.split(/:|\n/)[1]);
      this[variable] = value;
    } catch(e){}
    // signals.o.Time = state.evolution[0];
    // stream = state.evolution +  " " + state.simulation +  " " + state.controller;
    // data_stream.write(stream.replace(/,/g, " ") + "\n");
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
    logger.debug(`reference:${value}`);
    this.notify(['reference:' + value]);
  }

  get reference() {
    return this._reference;
  }

  set evolution(value) {
    this._evolution = value;
    this.notify('evolution:' + value);
  }

  get evolution() {
    return this._evolution;
  }
}

module.exports.Adapter = CAdapter;
module.exports.State = CState;
module.exports.DefaultConfig = HWConfig;
