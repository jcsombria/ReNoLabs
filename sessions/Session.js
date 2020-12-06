// Sessions Management
const Config = require('../config/AppConfig');
const db = require('../db');
const logger = require('winston').loggers.get('log');

// Session model
class Session {
  constructor (user, id, manager) {
    this.id = id;
    this.user = user;
    this.manager = manager;
    this.hardware = manager.hardware;
    logger.debug(`Session is ${user.username}`);
  }

  process(data) {
    try {
      let isCommand = (data.variable == 'config');
      if(isCommand) {
        let action = Number(data.value);
        logger.debug(`Command ${action} received.`);
        switch(action) {
          case 0: this.hardware.end(); break;
          case 1: this.hardware.start(this.user.username); break;
          case 2: this.hardware.play(); break;
          case 3: this.hardware.pause(); break;
          case 4: this.hardware.reset(); break;
        }
      } else {
        logger.debug('Forwarding message to hardware.');
        this.hardware.write(data.variable, data.value);
      }
    } catch(e) {
      logger.error('');
    }
  }

  end() {
    this.manager.disconnect(this.id);
  }

  isSupervisor() {
    return db.users.isSupervisor(this.user);
  }

  isAdministrator() {
    return db.users.isAdministrator(this.user);
  }

  isActive() {
    return this.manager.isActiveUser(this.user.username);
  }
}

// Controla los inicios y fin de sesión y coordina el funcionamiento conjunto de hardware, logger y autenticación
class SessionManager {
  constructor() {
    this.clients = {};
    this.active_user = null;
    this.timeout = Config.Session.timeout*60*1000;
    this.hwlogger = new Config.Hardware.Logger();
    this.hardware = new Config.Hardware.Adapter();
    this.hardware.addListener(this.hwlogger);
    this.running = false;
  }

  get idle() {
    return !this.hasClients() || !this.active_user;
  }

  isActiveUser(username) {
    return this.active_user == username;
  }

  hasClients() {
    return (Object.keys(this.clients).length > 0);
  }

  // Connects a client to an opened session, if and only if is supervisor or the active user (owns the previous session).
  connect(id, socket, credentials) {
    var user = this.validate(credentials);
    if (!user) return;
    let isActive = (this.active_user == user.username);
    let isSupervisor = db.users.isSupervisor(user);
    logger.debug(user.permissions);
    if (isActive || isSupervisor || !this.active_user) {
      logger.debug(`User ${user.username} connected to session ${id}.`);
      this.clients[id] = socket;
      var session = new Session(user, id, this);
      this._clearDisconnectTimeout();
      session.token = this.token;
      return session;
    }
  }
  
  start(credentials) {
    try {
      var username = credentials['username'];
      logger.debug(`Starting session for user: ${username}`);
      if(this.active_user == null) {
        this.active_user = username;
        this.token = Math.floor((Math.random() * 1000000) + 1);
        this.sessionTimer = setTimeout(this._sessionTimeout.bind(this), this.timeout);
        this.hardware.start(username);
        this.hwlogger.start(this.active_user);
        this.running = true;
        logger.info(`${new Date()} - PRÁCTICA INICIADA: Usuario ${this.active_user}`);
      }
    } catch(e) {
      logger.error(`Session: ${e}`);
    }
  }

  validate(credentials) {
    try {
      var token = credentials['key'];
      if(token) {
        if(this.token == token) {
          return db.users.getUser(this.active_user);
        }
      } else {
        var user = db.users.getUser(credentials['username']);
        if(user && user.password == credentials['password']) {
          return user;
        }
      }
    } catch(e) {}
  }

  disconnect(id) {
    delete this.clients[id];
    if(!this.hasClients() && !this.disconnectTimer) {
      if(this.running) {
        this.disconnectTimer = setTimeout(this._disconnectTimeout.bind(this), 5000);
      }
    };
  }

  getToken() {
    return this.token;
  }

  _sessionTimeout() {
    this.end();
    logger.info(`PRÁCTICA FINALIZADA POR TIMEOUT - ${new Date()}`);
  };

  _disconnectTimeout() {
    this.end();
//    this.hardware.removeListener(this.hwlogger);
    logger.info(`PRÁCTICA FINALIZADA POR DESCONEXIÓN- ${new Date()}`);
  }

  end() {
    this._clearSessionTimeout();
    this._clearDisconnectTimeout();
    this.running = false;
    this._disconnectAll();
    setTimeout(this.hardware.end.bind(this.hardware), 1000);
    this.hardware.end();
//    this.hwlogger.end();
//    this.hardware.removeListener(this.hwlogger);
    this.active_user = null;
  }
  
  _clearSessionTimeout() {
    clearTimeout(this.sessionTimer);
    this.sessionTimer = undefined;
  }

  _clearDisconnectTimeout() {
    clearTimeout(this.disconnectTimer);
    this.disconnectTimer = undefined;
  }

  _disconnectAll() {
    for (var c in this.clients) {
      try {
        logger.debug(`Disconnecting client ${c}`);
        this.clients[c].disconnect();
      } catch(e) {
        logger.debug(`Cannot notify disconnection to client ${c}`);
      }
    }
  }

  _logged(credentials, args, action) {
    if (this.validate(credentials)) {
      var a = action.bind(this);
      return action.call(this, args);
    }
  }
}

module.exports.SessionManager = new SessionManager();
module.exports.Session = Session;
