const Config = require('../config/AppConfig');
const Updater = require('../updater').Updater;
const logger = require('winston');

class Behavior {
  constructor(session) {
    this.actions = {};
    this.session = session;
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

  disconnect() {
    if(this.sender) {
      logger.info('Disconnecting client: ' + this.sender.id);
      this.session.end();
    }
  }

  error(msg) {
    logger.error('Socket: ' + msg);
  }
}

// Common maintenance behavior
class BehaviorMaintenance extends Behavior {
  constructor(session) {
    super(session);
    this.cm = new Updater();
    this.addAction('upload_chunk', this.upload_chunk);
    this.addAction('finish_upload', this.finish_upload);
    this.addAction('download_controller', this.download_controller);
    this.addAction('upload_controller', this.upload_controller);
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
    this.cm.upload_code(data);
    this.sender.emit('controller_upload_complete', {});
  }

  download_controller(data) {
    logger.info('Maintenance - Sending code...');
    var files = this.cm.download_code(data);
    this.sender.emit('controller_code', files);
    logger.info('Maintenance - Code transferred.');
  }
}

// Maintenance actions only allowed as Admin
class BehaviorAdminMaintenance extends BehaviorMaintenance {
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
    this.cm.upload_view(this.labCode);
    logger.info('View updated.');
    this.sender.emit('codeCompleted', {});
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
  constructor(session) {
    super(session);
    // TO DO: Load from config file
    this.signalDef = {
      i:[{name: "SetPoint", type: "double", value: 0.0}],
      o:[{name: "Time", type: "double", value: 0.0},{name: "Output", type: "double", value: 0.0}]
    };
    this.addAction('SignalRequest', this.SignalRequest);
    this.addAction('disconnect', this.disconnect);
  }

  SignalRequest(data) {
    logger.info('Client - Signal information requested...');
    this.sender.emit('SignalInfoToClient', this.signalDef);
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
      var response = {request: 'config', response: this.config};
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
