const logger = require('winston').loggers.get('log');
var spawn = require('child_process').spawn;
const zmq = require('zeromq');

const Adapter = require('../Adapter');
const { exec } = require('child_process');

/**
 * Encapsulates the interaction with the Dobot Server
 */
class ArduinoAdapter extends Adapter {
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
    logger.debug(`User ${username} request to start Arduino controller`);
    if(this.connected) return;
    logger.info('Arduino Adapter: Starting default controller...');
    this.conn = spawn('python3',[`../var/controllers/${this.controller.id}/${this.controller.path}`]);
//#exec(`python3 ../var/controllers/${this.controller.id}/${this.controller.path}`, (error, stdout, stderr) => {
//  if (error) {
//    console.error(`exec error: ${error}`);
//    return;
//  }
//  console.log(`stdout: ${stdout}`);
//  console.error(`stderr: ${stderr}`);
//});
    this.conn.on('error', function(error) { console.log(error); });
    this.commandSocket = zmq.socket('req');
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
    super.ondata(message.toString());
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

  /* Compile the controller in userpath.
   * @patam {string}   userpath the folder that contains the files that will be compiled
   * @patam {function} callback Invoked with the result of the compilation
   */
  compile(callback) {
    logger.debug(`make -C ${Settings.CONTROLLERS}/${this.controller.id}/ -f Makefile ${this.controller.path}`);
    logger.error(`Arduino compiling not implemented`)
    // var p = spawn('make', ['-C', `${Settings.CONTROLLERS}/${this.controller.id}/`, '-f', 'Makefile', this.controller.path, {shell:true}]);
    // // Stores the compiler output & errors
    // let compiler_stdout = '';
    // p.stdout.setEncoding('utf8');
    // p.stdout.on('data', function(data) { compiler_stdout += data; });
    // let compiler_stderr = '';
    // p.stderr.setEncoding('utf8');
    // p.stderr.on('data', function(data) { compiler_stderr += data; });
    // // Return the compilation results on exit
    // p.on('exit', function(code, signal) {
    //   if (code == null) {
    //     logger.error(`C Adapter: Process ended due to signal: ${signal}`);
    //   } else {
    //     logger.error(`C Adapter: Process ended with code: ${code}`);
    //   }
    //   if (callback != null) {
    //     let result = {
    //       status: code,
    //       message: signal,
    //       stdout: compiler_stdout,
    //       stderr: compiler_stderr,
    //     };
    //     callback(result);
    //   }
    // });
  }


}

module.exports.Adapter = ArduinoAdapter;
