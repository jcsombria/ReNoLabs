var db = require('./db');

class Session {
  constructor(config) {
    this.Config = config;
    this.clients = {};
    this.active_user = null;
    this.hw = new this.Config.Hardware.Adapter();
    this.timeout = this.Config.Session.timeout*60*1000;
    this.logger = new config.Hardware.Logger('start_server');
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

  connect(id, socket) {
    this.clients[id] = socket;
  }

  start(username, token) {
    if(this.active_user == null) {
      this.active_user = username;
      this.token = token;
      this.sessionTimer = setTimeout(this._sessionTimeout.bind(this), this.timeout);
      this.hw.start(username);
      this.logger.end();
      this.logger.start(this.active_user);
      this.running = true;
      console.info('[INFO] PRÁCTICA INICIADA');
      console.info('[INFO] Usuario: ' + this.active_user);
      console.info('[INFO] ' + new Date());
    }
  }

  stop() {
    if (this.hw.connected) {
      this.hw.stop();
    }
    this.logger.end();
  }

  validate(credentials) {
    var token = credentials['key'];
    var user = db.users.getUser(credentials['user']);
    if(token) {
      return this.token == token;
    } else {
      return user && user.password == credentials['password'];
    }
  }

  disconnect(id) {
    delete this.clients[id];
    if(!this.hasClients() && !this._disconnectTimer) {
      if(this.running) {
        this.disconnectTimer = setTimeout(this._disconnectTimeout.bind(this), 5000);
      }
    };
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
      this.logger.end();
    }
  }

  _sessionTimeout() {
    io.emit('disconnect_timeout', { text: 'Timeout: Sesión terminada!' });
    this._disconnectAll();
    this._stopHardware();
    console.info('[INFO] PRÁCTICA FINALIZADA POR TIMEOUT');
    console.info('[INFO] ' + new Date());
    this.sessionTimer = undefined;
  };

  _disconnectTimeout() {
    clearTimeout(this.sessionTimer);
    this._stopHardware();
    this._disconnectTimer = undefined;
    this.active_user = null;
    this.running = false;
    console.info('[INFO] PRÁCTICA FINALIZADA POR DESCONEXIÓN');
    console.info('[INFO] ' + new Date());
  }
}

module.exports = Session;
