const db = require('../db');
const logger = require('winston').loggers.get('log');
const Config = require('../config/AppConfig');
const { Updater } = require('../updater');

const INFO_GET = 'info.get';
const DISCONNECT = 'disconnect';
const ERROR = 'error';
const USERS_GET = 'users.get';
const USERS_SET = 'users.set';
const CONFIG_GET = 'config.get';
const CONFIG_SET = 'config.set';
const SIGNALS_INFO = 'signals.info';
const SIGNALS_SET = 'signals.set';
const SIGNALS_GET = 'signals.get';

class Behavior {
  constructor(session) {
    this.actions = {};
    this.session = session;
    this.addAction(INFO_GET, this.info);
    this.addAction(DISCONNECT, this.disconnect);
    this.addAction(ERROR, this.error);
  }

  register(o) {
    this.sender = o;
    for(var a in this.actions) {
      o.on(a, this.actions[a].bind(this));
    }
  }

  addAction(id, action) {
    this.actions[id] = action;
  }

  info() {
    logger.info('Sending Lab Info.');
    return this.sender.emit(this.INFO_GET, Config.Lab.info);
  }

  disconnect() {
    if(this.sender) {
      logger.info('Disconnecting client: ' + this.sender.id);
      try {
        this.session.end();
      } catch(e) {
        logger.debug(`Cannot end session: ${e.message}`)
      }
    }
  }

  error(msg) {
    logger.error('Behavior: ' + msg);
  }
}

// Common maintenance behavior
class BehaviorMaintenance extends Behavior {
  constructor(session) {
    super(session);
    this.addAction('upload_chunk', this.upload_chunk);
    this.addAction('finish_upload', this.finish_upload);
    this.addAction('controller.get', this.download_controller);
    this.addAction('controller.set', this.upload_controller);
    this.addAction(DISCONNECT, this.disconnect);
  }

  upload_chunk() {
    logger.error('Maintenance - upload_chunk not implemented!');
  }

  finish_upload(data) {
    logger.error('Maintenance - finish_upload not implemented!');
  }

  upload_controller(data) {
    logger.info('Maintenance - Receiving code...');
    let sender = this.sender;
    Updater.upload_code(data, (result)=>{
      logger.debug(result.stderr);
      sender.emit('controller.set', result);
    });
  }

  download_controller(data) {
    logger.info('Maintenance - Sending code...');
    var files = Updater.download_code(data);
    this.sender.emit('controller.get', files);
    logger.info('Maintenance - Code transferred.');
  }
}

// Maintenance actions only allowed as Admin
class BehaviorAdminMaintenance extends BehaviorMaintenance {
  constructor(session) {
    super(session);
    this.addAction(USERS_GET, this.get_users);
    this.addAction(USERS_SET, this.set_users);
    this.addAction(CONFIG_GET, this.get_signals);
    this.addAction(CONFIG_SET, this.set_signals);
  }

  upload_chunk(data) {
    logger.info('Uploading chunk...');
    if(!this.labCode) {
      this.labCode = "";
    }
    this.labCode = this.labCode + data.code;
    this.sender.emit('chunkCompleted', {});
  }

  finish_upload(data) {
    logger.info('Upload completed! Updating view...');
    Updater.upload_view(new Buffer(this.labCode, 'base64'));
    logger.info('View updated.');
    this.sender.emit('codeCompleted', {});
  }

  get_users() {
    logger.info('Sending list of users...A great power comes with a great responsibility!');
    logger.debug(db.users.getUsers());
    this.sender.emit(USERS_GET, db.users.getUsers());
  }

  set_users(data) {
    Updater.updateUsers(data);
    logger.info('Updating list of users...A great power comes with a great responsibility!');
    db.users.reload();
    this.sender.emit(USERS_SET, db.users.getUsers());
  }

  get_signals() {
    logger.info('Sending config...A great power comes with a great responsibility!');
    this.sender.emit(CONFIG_GET, Updater.getConfig());
  }

  set_signals(data) {
    logger.info('Updating config...A great power comes with a great responsibility!');
    Updater.setConfig(data);
    this.sender.emit(CONFIG_SET, {'DefaultConfig': Config});
  }
}

// Maintenance actions allowed as normal user
class BehaviorUserMaintenance extends BehaviorMaintenance {
  upload_chunk(data) {
    logger.info('User Maintenance - Upload rejected!');
    this.sender.emit('upload_rejected', { text: 'Access denied!' } );
  }

  finish_upload(data) {
    logger.info('User Maintenance - Upload rejected!');
    this.sender.emit('upload_rejected', {text: 'Access denied!'});
  }

  upload_controller(data) {
    logger.info('User Maintenance - Receiving code...');
    if(data.version !== 'private') {
      this.sender.emit('controller_upload_rejected', { text: 'Access denied!' });
    }
    super.upload_controller(data);
  }
}

// Client mode
class BehaviorClient extends Behavior {
  constructor() {
    super();
    this.addAction('SignalRequest', this.get_signals);
  }

  get_signals() {
    logger.info('Client - Signal information requested...');
    this.sender.emit('SignalInfoToClient', Config.Lab.signals);
  }

}

// User Mode
class BehaviorUser extends Behavior {
  constructor (session) {
    super(session);
    this.config = Config.Lab.config;
    this.addAction(SIGNALS_INFO, this.getSignalsInfo);
    this.addAction(SIGNALS_SET, this.setSignals);
  }

  setSignals(data) {
    logger.info(`User sends signal ${data.variable}.`);
    this.session.process(data);
  }

  getSignalsInfo(data) {
    if (data.request == 'config') {
      logger.info(`User requests signals info.`);
      var response = {
         request: 'config',
         response: Config.Lab.parameters,
         session: this.session.info()
      };
      this.sender.emit(SIGNALS_INFO, response);
    }
  }
}

module.exports.AdminMaintenance = BehaviorAdminMaintenance
module.exports.UserMaintenance = BehaviorUserMaintenance
module.exports.Client = BehaviorClient
module.exports.Normal = BehaviorUser
