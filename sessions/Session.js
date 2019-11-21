const Config = require('../config/AppConfig');
const db = require('../db');
const logger = require('winston');

class Session {
  constructor (user, id, manager) {
    this.id = id;
    this.user = user;
    this.manager = manager;
    this.hw = manager.hw;
    this.logger = manager.logger;
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

class SessionManager {
  constructor() {
    this.clients = {};
    this.active_user = null;
    this.timeout = Config.Session.timeout*60*1000;
    this.hw = new Config.Hardware.Adapter();
    this.hwlogger = new Config.Hardware.Logger('start_server');
    this.running = false;
  }

  get idle() {
    return !this.hasClients();
  }

  isActiveUser(username) {
    return this.active_user == username;
  }

  hasClients() {
    return (Object.keys(this.clients).length > 0);
  }

  connect(id, socket, credentials) {
    var user = this.validate(credentials);
    if(user.username == this.active_user) {
      this.clients[id] = socket;
      var session = new Session(user, id, this);
      session.hw = this.hw;
      session.logger = this.hwlogger;
      session.token = this.token;
      return session;
    }
  }
  
  start(credentials) {
    try {
      var username = credentials['username'];
      if(this.active_user == null) {
        this.active_user = username;
        this.token = Math.floor((Math.random() * 1000000) + 1);
        this.sessionTimer = setTimeout(this._sessionTimeout.bind(this), this.timeout);
        this.hw.start(username);
        this.hwlogger.end();
        this.hwlogger.start(this.active_user);
        this.running = true;
        logger.info(`${new Date()} - PRÁCTICA INICIADA: Usuario ${this.active_user}`);
      }
    } catch(e) {
      logger.error(e);
    }
  }

  stop() {
    if (this.hw.connected) {
      this.hw.stop();
    }
    this.hwlogger.end();
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
        // if(user && user.password == credentials['password']) {
        if (user.username == this.active_user) {
          return user;
        }
      }
    } catch(e) {}
  }

  disconnect(id) {
    delete this.clients[id];
    if(!this.hasClients() && !this._disconnectTimer) {
      if(this.running) {
        this.disconnectTimer = setTimeout(this._disconnectTimeout.bind(this), 5000);
      }
    };
  }

  getToken() {
    return this.token;
  }

  _disconnectAll() {
    var clients = this.clients.values();
    for (var c in clients) {
      c.disconnect();
    }
  }

  _stopHardware() {
    if (this.hw.connected) {
      this.hw.stop();
      this.hwlogger.end();
    }
  }

  _sessionTimeout() {
    // io.emit('disconnect_timeout', { text: 'Timeout: Sesión terminada!' });
    this._disconnectAll();
    this._stopHardware();
    logger.info(`PRÁCTICA FINALIZADA POR TIMEOUT - ${new Date()}`);
    this.sessionTimer = undefined;
  };

  _disconnectTimeout() {
    clearTimeout(this.sessionTimer);
    this._stopHardware();
    this._disconnectTimer = undefined;
    this.active_user = null;
    this.running = false;
    logger.info(`PRÁCTICA FINALIZADA POR DESCONEXIÓN- ${new Date()}`);
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