const db = require('../db');
const logger = require('winston').loggers.get('log');
const Config = require('../config/AppConfig');
const { Updater } = require('../updater');

class Behavior {
  constructor(session) {
    this.actions = {};
    this.GET_INFO = 'info.get';
    this.session = session;
    this.addAction(this.GET_INFO, this.info);
    this.addAction('disconnect', this.disconnect);
    this.addAction('error', this.error);
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
    return this.sender.emit(this.GET_INFO, Config.Lab.info);
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
    this.addAction('disconnect', this.disconnect);
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
    this.GET_USERS = 'users.get';
    this.SET_USERS = 'users.set';
    this.GET_CONFIG = 'config.get';
    this.SET_CONFIG = 'config.set';
    this.addAction(this.GET_USERS, this.get_users);
    this.addAction(this.SET_USERS, this.set_users);
    this.addAction(this.GET_CONFIG, this.get_signals);
    this.addAction(this.SET_CONFIG, this.set_signals);
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
    Updater.upload_view(this.labCode);
    logger.info('View updated.');
    this.sender.emit('codeCompleted', {});
  }

  get_users() {
    logger.info('Sending list of users...A great power comes with a great responsibility!');
    this.sender.emit(this.GET_USERS, db.users.getUsers());
  }

  set_users(data) {
    Updater.updateUsers(data);
    logger.info('Updating list of users...A great power comes with a great responsibility!');
    db.users.reload();
    this.sender.emit(this.SET_USERS, db.users.getUsers());
  }

  get_signals() {
    logger.info('Sending config.');
    this.sender.emit(this.GET_CONFIG, {'DefaultConfig': Config});
  }

  set_signals(data) {
    logger.info('Updating config...A great power comes with a great responsibility!');
    console.log(data);
    this.sender.emit(this.SET_CONFIG, {'DefaultConfig': Config});
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
    this.GET_USERS = 'users.get';
    this.GET_SIGNALS = 'SignalRequest';
    this.SET_SIGNALS = 'signals.set';
    this.addAction('disconnect', this.disconnect);
    this.addAction(this.GET_SIGNALS, this.get_signals);
//    this.addAction(this.GET_SIGNALS, this.set_signals);
  }

  get_signals() {
    logger.info('Client - Signal information requested...');
    this.sender.emit('SignalInfoToClient', Config.Lab.signals);
  }

  set_signals(data) {
    logger.info('Client - Signal information updated...');
    this.sender.emit('SignalInfoToClient', Config.Lab.signals);
  }
}

// Common events
class BehaviorConfig extends Behavior {
  constructor(session) {
    super(session);
    this.addAction('clientOut_request', this.clientOut_request);
    this.config = Config.Lab.config;
  }

  clientOut_request(data) {
    if (data.request == 'config') {
      var response = { request: 'config', response: Config.Lab.parameters };
      this.sender.emit('serverOut_response', response);
    }
  }
}

class BehaviorUser extends Behavior {
  constructor (session) {
    super(session);
    this.addAction('clientOut_serverIn', this.clientOut_serverIn);
  }

  clientOut_serverIn(data) {
    logger.debug(data.variable + ' = ' + data.value);
    this.session.hw.write(data.variable, data.value);
  }
}

module.exports.AdminMaintenance = BehaviorAdminMaintenance
module.exports.UserMaintenance = BehaviorUserMaintenance
module.exports.Client = BehaviorClient
module.exports.Config = BehaviorConfig
module.exports.Normal = BehaviorUser