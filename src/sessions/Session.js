// Sessions Management
const logger = require('winston').loggers.get('log');
const Config = require('../config/AppConfig');
const db = require('../db');
const rules = require('../behavior/rules')
const { EventGenerator, EventProcessor, EventDispatcher } = require('../behavior/events');
const models = require('../models');
const hardware = require('../hardware');
const { authorize } = require('passport');

class HardwarePool {
  constructor() {
    this.hardware = {};
    this.available = {};
  }

  getHardwareFor(controller) {
    if (!(controller.type in hardware)) {
      throw new Error('Unknown hardware adapter.');
    }
    if (!(controller.type in this.available)) {
      this.available[controller.type] = {
        'adapter': new hardware[controller.type].Adapter(controller),
        'logger': new hardware[controller.type].Logger(),
        'eventGenerator': new EventGenerator(),
      };
      this.available[controller.type].adapter.addListeners([
        this.available[controller.type].logger,
        this.available[controller.type].eventGenerator
      ]);
    }
    return this.available[controller.type];
  }
}

const hardwarePool = new HardwarePool();

/* Session model. */
class Session {
  /*
   * @param {Activity}       activity  The activity.
   * @param {User}           user      The user that opened the session.
   * @param {string}         id        The id of the channel (socket) associated to the session.
   * @param {SessionManager} manager   The session manager.
   */
  constructor (activity, user, id, manager, hardware) {
    this.activity = activity;
    this.user = user;
    this.id = id;
    this.active = false;
    this.manager = manager;
    this.hardware = hardware;
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

  /*
   * Process user data. If data contains action command, executte. Otherwise, forward to hardware.
   * @param {object} data The received data.
   */
  process(event) {
    this.eventDispatcher.dispatch(e);
  }

  stop() {
    this.hardware.adapter.stop();
    this.hardware.logger.end();
  }

  start() {
    logger.debug(`User ${this.user.username} starts ${this.activity.name}.`);
    this.active = true;
    this.hardware.logger.start(this.user.username);
    this.hardware.adapter.start(this.user.username);
    this.hardware.adapter.play();
  }

  play() {
    this.hardware.adapter.play();
  }

  pause() {
    this.hardware.adapter.pause();
  }

  reset() {
    this.hardware.adapter.reset();
  }

  /*
   * Finish the session.
   */
  async end() {
    this.active = false;
    return await this.manager.disconnect(this.id);
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

  get expired() {
    var now = new Date().getTime();
    return this.manager.getEndTime() < now;
  }

  get finished() {
    return !this.active;
  }
}

// Coordina el inicio y fin de sesión entre hardware, logger y autenticación
class SessionManager {
  constructor() {
    this.clients = {};
    this.active_user = null;
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

  /** Connects a client to an activity
   *  - If the activity has no opened session, a new one is created.
   *  - If there is an openeed session, the connection is successful 
   *  if and only if the user is supervisor or owns the previous session.
   */
  async connect(activity, credentials, socket, id) {
    var user = await this.validate(credentials);
    if (!user) return;
    var theActivity = await models.Activity.findOne({
      where: { name: activity },
      include: models.Controller
    })
    if (!theActivity) return;
    var controller = await getController(theActivity);
    this.hardware = hardwarePool.getHardwareFor(controller);
    var session = new Session(theActivity, user, id, this, this.hardware);
    if(id != null) { this.clients[id] = socket; }
    if (this.idle) {
      this.active_user = user.username;
      this.activity = theActivity;
      this.token = Math.floor((Math.random() * 1000000) + 1);
      this.sessionTimer = setTimeout(this._sessionTimeout.bind(this), this.activity.sessionTimeout*60*1000);
      this.sessionStartTime = new Date();
      this.sessionEndTime = new Date(this.sessionStartTime.getTime() + this.activity.sessionTimeout*60*1000);
      this.running = true;
      session.start();
      logger.info(`Session started: user ${this.active_user} - ${new Date()}`);
    } else {
      let isActive = (this.active_user == user.username || !this.active_user);
      let isSupervisor = db.users.isSupervisor(user);
      if (!isActive && !isSupervisor) {
        logger.debug(`User ${user.username} not allowed to connect to session ${id}.`);
        socket.disconnect();
        delete this.clients[id];
        return;
      }
      if (isActive) { this._clearDisconnectTimeout(); }
    }
    logger.debug(`User ${user.username} connected to session ${id}.`);
    session.token = this.token;
    this.hardware.eventGenerator.addListener(socket);
    return session;

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

  // createHardwareAdapter(controller) {
  //   if (!controller.type in hardware) {
  //     throw new Error('Unknown hardware adapter.');
  //   }
  //   const hw = hardware[controller.type];
  //   return {
  //     'adapter': new hw.Adapter(controller),
  //     'logger': new hw.Logger()
  //   }
//  }

  disconnect(id) {
    logger.debug(`Disconnecting client ${id}`);
    try {
      this.clients[id].disconnect();
    } catch(e) {
      logger.debug('Can\'t disconnect client properly.')
    }
    delete this.clients[id];
    logger.debug("clients:" + Object.keys(this.clients));
    if(!this.hasClients() && !this.disconnectTimer && this.running) {
      logger.debug(`No clients left, starting disconnection timeout`)
      return new Promise((resolve, reject) => {
        this.disconnectTimer = setTimeout(function() {
          this.end();
          logger.info(`Disconnection Timeout - ${new Date()}`);
          resolve(`Session expired - ${new Date()}`);
        }.bind(this), this.activity.disconnectTimeout*1000);
          // this._disconnectTimeout.bind(this), this.activity.disconnectTimeout*1000);
      });
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
    this.hardware.adapter.stop();
    this.hardware.logger.end();
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

function getController(activity) {
  if(activity.Controller) { return activity.Controller; }
  return models.Controller.findOne({
    where: { name: activity.controllerName },
    order: [[ 'createdAt', 'DESC' ]]
  });
}

module.exports = {
  SessionManager: new SessionManager(),
  HardwarePool: hardwarePool,
  Session: Session,
}