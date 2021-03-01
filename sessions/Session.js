// Sessions Management
const Config = require('../config/AppConfig');
const db = require('../db');
const logger = require('winston').loggers.get('log');

/* 
 * Dispatch incoming events.
 */
class EventDispatcher {

  static PROCESS = 'process';
  static ENQUEUE = 'enqueue';
  static DISCARD = 'discard';
  static UNMATCHED = 'umatched';

  constructor(eventProcessor) {
    this.eventProcessor = eventProcessor;
    this.rules = {}
    this.handle = {
      'process': this._process.bind(this),
      'enqueue': this._enqueue.bind(this),
    }
  }

  _process(event) { this.eventProcessor.process(event); }

  _enqueue(event) { this.eventProcessor.enqueue(event); }

  /*
   * @param {string}   name     The unique name of the routing rule.
   * @param {function} classify A function that accepts an event and returns a dispatching label ('Process', 'Enqueue', 'Discard').
   */
  addRoutingRule(name, classify) {
    this.rules[name] = { 'classify': classify };
  }

  dispatch(event) {
    for (var r in this.rules) {
      const classify = this.rules[r]['classify'];
      var type = classify(event);
      if (type != EventDispatcher.UNMATCHED) {
        this.handle[type](event);
        return;
      }
    }
  }

}

/* 
 * Process incoming events.
 */
class EventProcessor {

  constructor() {
    this.rules = {};
    this.queue = [];
    this._start();
  }

  _start() {
    setInterval(this._check.bind(this), 100);
  }

  _check() {
    var event = this.queue.shift();
    if(event) { this.process(event); }
  }

  /*
   * Add a new event processing rule.
   *
   * A rule is defined by a unique name, a condition that must be true to trigger the rule, and the action
   * that will be triggered.
   *
   * @param {object}   name The unique name of the rule.
   * @param {function} condition The rule triggering condition.
   * @param {function} action The rule action.
   */
  addRule(name, condition, action) {
    this.rules[name] = {
      'condition': condition,
      'action': action,
    }
  }

  process(event) {
    for (var r in this.rules) {
      const rule = this.rules[r];
      if(rule['condition'](event)) { rule['action'](event); }
    }
  }

  enqueue(event) {
    this.queue.push(event);
  }
}



/* Session model.
 */
class Session {

  /*
   * @param {User}           user    The user that opened the session.
   * @param {string}         id      The id of the channel (socket) associated to the session.
   * @param {SessionManager} manager The session manager.
   */
  constructor (user, id, manager) {
    this.id = id;
    this.user = user;
    this.manager = manager;
    this.hardware = manager.hardware;
    this.rules = {};
    this.eventProcessor = new EventProcessor();
    this.eventDispatcher = new EventDispatcher(this.eventProcessor);
    logger.debug(`Session is ${user.username}`);

    // # Dispatching Rules
    // - Enqueue if extern references, otherwise process immediately
    this.eventDispatcher.addRoutingRule('enqueue_if_extern_process_otherwise', 
      event => {
        let isExtern = (event.variable == 'reference' && event.value[0] == 5);
        return (isExtern) ? EventDispatcher.ENQUEUE : EventDispatcher.PROCESS;
      }
    );

    // # Processing Rules
    // - Process commands 
    this.eventProcessor.addRule('process_command', 
      event => { // Rule condition
        let isCommand = (event.variable == 'config');
        return isCommand;
      },
      event => { // Rule action
        let action = Number(event.value);
        logger.debug(`Command ${action} received.`);
        switch(action) {
          case 0: this.hardware.end(); break;
          case 1: this.hardware.start(this.user.username); break;
          case 2: this.hardware.play(); break;
          case 3: this.hardware.pause(); break;
          case 4: this.hardware.reset(); break;
        }
      }
    );
    // - Process commands immediately
    this.eventProcessor.addRule('forward_to_hardware',
      event => { // Rule condition
        let isCommand = (event.variable == 'config');
        return !isCommand;
      },
      event => { // Rule action
        logger.debug('Forwarding message to hardware.');
        this.hardware.write(event.variable, event.value);
      }
    );

  }

  /*
   * Process user data. If data contains action command, executte. Otherwise, forward to hardware.
   * @param {object} data The received data.
   */
  process(event) {
    if(!Array.isArray(event)) {event = [event]} 
    for (i in event) {
      try {
        this.eventDispatcher.dispatch(event[i]);
      } catch(e) {
        logger.error('Can\'t process event.');
      }
    }
  }

  /*
   * Finish the session.
   */
  end() {
    this.manager.disconnect(this.id);
  }

  /*
   * @return {boolean} True if the user has supervisor permissions, False otherwise.
   */
  isSupervisor() {
    return db.users.isSupervisor(this.user);
  }

  /*
   * @return {boolean} True if the user has administrator permissions, False otherwise.
   */
  isAdministrator() {
    return db.users.isAdministrator(this.user);
  }

  /*
   * @return {boolean} True if the user is owner of the hardware, False otherwise.
   */
  isActive() {
    return this.manager.isActiveUser(this.user.username);
  }

  /*
   * @return {object} Information about the current session.
   */
  info() {
    return {
      user: this.user.username,
      timeout: this.manager.getEndTime(),
    }
  }
}

// Coordina el inicios y fin de sesión entre hardware, logger y autenticación
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
        this.sessionStartTime = new Date();
        this.sessionEndTime = new Date(this.sessionStartTime.getTime() + this.timeout);
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
    logger.debug(`Disconnecting client ${id}`);
    this.clients[id].disconnect();
    delete this.clients[id];
    logger.debug("clients:" + Object.keys(this.clients));
    if(!this.hasClients() && !this.disconnectTimer) {
    logger.debug(`No clients left, starting disconnection timeout`)
      if(this.running) {
        this.disconnectTimer = setTimeout(this._disconnectTimeout.bind(this), Config.Session.disconnectTimeout*1000);
      }
    };
  }

  getToken(credentials) {
    var user = this.validate(credentials);
    if (!user) return;
    let isActive = (this.active_user == user.username);
    let isSupervisor = db.users.isSupervisor(user);
    if (isActive || isSupervisor || !this.active_user) {
       return this.token;
    }
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

  getEndTime() {
    return this.sessionEndTime;
  }
}

module.exports.SessionManager = new SessionManager();
module.exports.Session = Session;
