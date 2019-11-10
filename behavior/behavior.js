var CodeManager = require('../updater').CodeManager;

class Behavior {
  constructor(session) {
    this.actions = {};
    this.session = session;
    this.addAction('disconnect', this.disconnect);
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
      console.info('[INFO] Disconnecting client: ' + this.sender.id);
      this.session.disconnect('socket_' + this.sender.id);
    }
  }
}

// Common maintenance behavior
class BehaviorMaintenance extends Behavior {
  constructor(session) {
    super(session);
    this.cm = new CodeManager();
    this.addAction('upload_chunk', this.upload_chunk);
    this.addAction('finish_upload', this.finish_upload);
    this.addAction('download_controller', this.download_controller);
    this.addAction('upload_controller', this.upload_controller);
    this.addAction('disconnect', this.disconnect);
  }

  upload_chunk() {
    console.log('[ERROR] Maintenance - upload_chunk not implemented!');
  }

  finish_upload(data) {
    console.log('[ERROR] Maintenance - finish_upload not implemented!');
  }

  upload_controller(data) {
    console.info("[INFO] Maintenance - Receiving code...");
    this.cm.upload_code(data);
    this.sender.emit('controller_upload_complete', {});
  }

  download_controller(data) {
    console.info("[INFO] Maintenance - Sending code...");
    var files = this.cm.download_code(data);
    this.sender.emit('controller_code', files);
    console.info("[INFO] Maintenance - Code transferred.");
  }
}

// Maintenance actions only allowed as Admin
class BehaviorAdminMaintenance extends BehaviorMaintenance {
  upload_chunk(data) {
    console.info("[INFO] Uploading chunk...");
    if(!this.labCode) {
      this.labCode = "";
    }
    this.labCode = this.labCode + data.code;
    this.sender.emit('chunkCompleted', {});
  }

  finish_upload(data) {
    console.info("[INFO] Upload completed! Updating view...");
    this.cm.upload_view(this.labCode);
    console.info("[INFO] View updated.");
    this.sender.emit('codeCompleted', {});
  }
}

// Maintenance actions allowed as normal user
class BehaviorUserMaintenance extends BehaviorMaintenance {
  upload_chunk(data) {
    console.info("[INFO] User Maintenance - Upload rejected!");
    this.sender.emit('upload_rejected', { text: 'Access denied!' } );
  }

  finish_upload(data) {
    console.info("[INFO] User Maintenance - Upload rejected!");
    this.sender.emit('upload_rejected', {text: 'Access denied!'});
  }

  upload_controller(data) {
    console.info("[INFO] User Maintenance - Receiving code...");
    if(data.version !== 'private') {
      this.sender.emit('controller_upload_rejected', { text: 'Access denied!' } );
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
    console.info("[INFO] Client - Signal information requested...");
    this.sender.emit('SignalInfoToClient', this.signalDef);
  }
}

// Common events
class BehaviorConfig extends Behavior {
  constructor(session) {
    super(session);
    // TO DO: Load from config file
    this.config = {
      simulation: {
        parameter_names: ['Vup', 'Vdown', 'Delay'],
        options: [{
          name: 'Config',
          parameter_indexes: [0, 1, 2]
        }]
      },
      controller: {
        parameter_names: ['Threshold', 'Min', 'Max'],
        options: [{
          name : 'Single',
          parameter_indexes: [0]
        }, {
          name: 'Double',
          parameter_indexes : [1, 2]
        }]
      }
    };
    this.addAction('clientOut_request', this.clientOut_request);
  }

  clientOut_request(data) {
    if (data.request == 'config') {
      var response = {request: 'config', response: config};
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
    console.log('[DEBUG] ' + data.variable + ' = ' + data.value);
    this.session.hw.write(data.variable, data.value);
  }
}

module.exports.AdminMaintenance = BehaviorAdminMaintenance
module.exports.UserMaintenance = BehaviorUserMaintenance
module.exports.Client = BehaviorClient
module.exports.Config = BehaviorConfig
module.exports.Normal = BehaviorUser
