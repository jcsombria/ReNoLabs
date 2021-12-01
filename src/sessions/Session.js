// Sessions Management
const logger = require('winston').loggers.get('log');
const Config = require('../config/AppConfig');
const db = require('../db');
const rules = require('../behavior/rules')
const { EventProcessor, EventDispatcher } = require('../behavior/events');
const models = require('../models');
const hardware = require('../hardware');

/* Session model. */
class Session {

  /*
   * @param {Activity}       activity  The activity.
   * @param {User}           user      The user that opened the session.
   * @param {string}         id        The id of the channel (socket) associated to the session.
   * @param {SessionManager} manager   The session manager.
   */
  constructor (activity, user, id, manager) {
    this.activity = activity;
    this.user = user;
    this.id = id;
    this.manager = manager;
    this.logger = manager.hwlogger;
    this.createHardwareAdapter(this.activity.Controller);
    this.rules = {};
    this.eventProcessor = new EventProcessor(this);
    this.eventDispatcher = new EventDispatcher(this.eventProcessor);
    // # Dispatching Rules
    // - Enqueue if extern references, otherwise process immediately
    this.eventDispatcher.addRoutingRule('enqueue_if_extern_process_otherwise', 
      event => {
        let isExtern = (event.variable == 'reference' && event.value[0] == 4);
        return isExtern ? 'enqueue' : 'process'; // EventDispatcher.ENQUEUE : EventDispatcher.PROCESS;
      }
    );

    for (var r in rules) {
      try {
        this.eventProcessor.addRule(r, rules[r]['condition'], rules[r]['action']);
      } catch(e) {
        logger.warn('Cannot import event processing rule.')
      }
    }
  }

  createHardwareAdapter(controller) {
    if (!controller.type in hardware) {
      throw new Error('Unknown hardware adapter.');
    }
    const Adapter = hardware[controller.type].Adapter;
    this.hardware = new Adapter(controller);
    this.hardware.addListener(this.logger);    
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

  stop() {
    // this.hardware.stop();
    // this.logger.end();
  }

  start() {
    logger.debug(`User ${this.user.username} starts ${this.activity.name}.`);
    var user = this.user.username;
    this.logger.start(user);
    this.hardware.start(user);
    this.hardware.play();    
  }

  play() {
    // this.hardware.play();
  }

  pause() {
    // this.hardware.pause();
  }

  reset() {
    // this.hardware.reset();
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

// Coordina el inicio y fin de sesión entre hardware, logger y autenticación
class SessionManager {
  constructor() {
    this.clients = {};
    this.active_user = null;
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
  async connect(activity, credentials, socket, id) {
    var user = this.validate(credentials);
    if (!user) return;
    var theActivity = await models.Activity.findOne({
      where: { name: activity },
      include: models.Controller
    })
    if (!theActivity) return;
    var session = new Session(theActivity, user, id, this);
    if(id != null) {
      this.clients[id] = socket;
    }
    if (this.idle) {
      this.active_user = user.username;
      this.activity = theActivity;
      this.token = Math.floor((Math.random() * 1000000) + 1);
      this.sessionTimer = setTimeout(this._sessionTimeout.bind(this), this.activity.sessionTimeout*60*1000);
      this.sessionStartTime = new Date();
      this.sessionEndTime = new Date(this.sessionStartTime.getTime() + this.activity.sessionTimeout);
      this.running = true;
      session.start();
      session.token = this.token;
      logger.info(`Session started: user ${this.active_user} - ${new Date()}`);
      return session;
    } else {
      let isActive = (this.active_user == user.username || !this.active_user);
      let isSupervisor = db.users.isSupervisor(user);
      if (isActive || isSupervisor) {
        logger.debug(`User ${user.username} connected to session ${id}.`);
        if (isActive) {
          this._clearDisconnectTimeout();
        }
        session.token = this.token;
        return session;
      } else {
        logger.debug(`User ${user.username} not allowed to connect to session ${id}.`);
        socket.disconnect();
        delete this.clients[id];
        return;
      }
    }
  }

  async validate(credentials) {
    try {
      var token = credentials['key'];
      if(token) {
        if(this.token == token) {
          return await db.users.getUser(this.active_user);
        }
      } else {
        var user = await db.users.getUser(credentials['username']);
        if(user && user.password == credentials['password']) {
          return user;
        }
      }
    } catch(e) {}
  }

  disconnect(id) {
    logger.debug(`Disconnecting client ${id}`);
    try {
      this.clients[id].disconnect();
    } catch(e) {
      logger.debug('Can\'t disconnect client properly.')
    }
    delete this.clients[id];
    logger.debug("clients:" + Object.keys(this.clients));
    if(!this.hasClients() && !this.disconnectTimer) {
    logger.debug(`No clients left, starting disconnection timeout`)
      if(this.running) {
        this.disconnectTimer = setTimeout(this._disconnectTimeout.bind(this), this.activity.disconnectTimeout*1000);
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
    logger.info(`Session expired - ${new Date()}`);
  };

  _disconnectTimeout() {
    this.end();
    logger.info(`Disconnection Timeout - ${new Date()}`);
  }

  end() {
    this._clearSessionTimeout();
    this._clearDisconnectTimeout();
    this.running = false;
    this._disconnectAll();
    this.hardware.stop();
    this.hwlogger.end();
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

module.exports = {
  SessionManager: new SessionManager(),
  Session: Session
}