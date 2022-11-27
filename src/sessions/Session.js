// Sessions Management
const logger = require('winston').loggers.get('log');
const db = require('../db');
const rules = require('../behavior/rules')
const { EventGenerator, EventProcessor, EventDispatcher } = require('../behavior/events');
const models = require('../models');
const hardware = require('../hardware');

class HardwarePool {
  constructor() {
    this.hardware = {};
    this.available = {};
  }

  getHardwareFor(controller) {
    if (!(controller.type in hardware)) {
      throw new Error('Unknown hardware adapter.');
    }
    if (!(controller.name in this.available)) {
      this.available[controller.name] = {
        'adapter': new hardware[controller.type].Adapter(controller),
        'logger': new hardware[controller.type].Logger(),
        'eventGenerator': new EventGenerator(),
      };
      this.available[controller.name].adapter.addListeners([
        this.available[controller.name].logger,
        this.available[controller.name].eventGenerator
      ]);
    }
    return this.available[controller.name];
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
  constructor (activity, user, manager, hardware) {
    this.activity = activity;
    this.user = user;
    this.active = false;
    this.clients = {};
    this.manager = manager;
    this.hardware = hardware;
    this.token = Math.floor((Math.random() * 1000000) + 1);
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
    this.eventDispatcher.dispatch(event);
  }

  start() {
    logger.debug(`User ${this.user.username} starts ${this.activity.name}.`);
    this.active = true;
    this.hardware.logger.start(this.user.username);
    this.hardware.adapter.start(this.user.username);
    this.hardware.adapter.play();
    this.startTime = new Date();
    this.endTime = new Date(this.startTime.getTime() + this.activity.sessionTimeout*60*1000);
    this.timer = setTimeout(this._timeout.bind(this), this.activity.sessionTimeout*60*1000);
  }

  end() {
    this.active = false;
    logger.debug(`Stopping hardware`);
    this.stop();
    for (var c in this.clients) {
      try {
        logger.debug(`Disconnecting client ${c}`);
        this.clients[c].disconnect();
      } catch(e) {
        logger.debug(`Cannot notify disconnection to client ${c}`);
      }
    }
    this.manager.stop(this.activity.name);
  }

  connect(socket) {
    if (socket.id == undefined) { return; }
    this.clients[socket.id] = socket;
    this.hardware.eventGenerator.addListener(socket);
    this._clearDisconnectTimeout();
  }


  disconnect(id) {
    try {
      logger.debug(`Disconnecting client ${id}`);
      this.clients[id].disconnect();
    } catch(e) {
      logger.debug('Can\'t disconnect client properly.')
    }
    delete this.clients[id];
    if(!this.hasClients() && !this.disconnectTimer && this.active) {
      logger.debug(`No clients left, starting disconnection timeout`)
      return new Promise((resolve, reject) => {
        this.disconnectTimer = setTimeout(function() {
          logger.info(`Disconnection Timeout - ${new Date()}`);
          this.end();
          resolve(`Session expired - ${new Date()}`);
        }.bind(this), this.activity.disconnectTimeout*1000);
      });
    };
  }

  stop() {
    this.hardware.adapter.stop();
    this.hardware.logger.end();
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
    return this.active;
  }

  /*
  * @return {object} Information about the current session.
  */
  info() {
    return {
      user: this.user.username,
      timeout: this.endTime,
    }
  }

  get expired() {
    var now = new Date().getTime();
    return this.endTime < now;
  }

  get finished() {
    return !this.active;
  }


  _timeout() {
    this.end();
    logger.info(`Session expired - ${new Date()}`);
  };

  _disconnectTimeout() {
    this.end();
    logger.info(`Disconnection Timeout - ${new Date()}`);
  }

  _clearDisconnectTimeout() {
    clearTimeout(this.disconnectTimer);
    this.disconnectTimer = undefined;
  }

  hasClients() {
    return (Object.keys(this.clients).length > 0);
  }
}

// Coordina el inicio y fin de sesión entre hardware, logger y autenticación
class SessionManager {
  constructor() {
    this.clients = {};
    this.sessions = {};
    this.tokens = {};
  }

  /** Connects a client to an activity
   *  - If the activity has no opened session, a new one is created.
   *  - If there is an openeed session, the connection is successful 
   *  if and only if the user is supervisor or owns the previous session.
   */
  async connect(activity, credentials, socket) {
    var theActivity = await models.Activity.findOne({
      where: { name: activity },
      include: models.Controller
    })
    if (!theActivity) {
      throw new Error(`The activity ${theActivity} does not exist.`)
    }
    var user = await this.validate(credentials);
    if (!user) {
      throw new Error(`Authentication error.`)
    }
    const username = user.username;
    if (this.hasActivities(user)) {
      if (!(activity in this.sessions)) {
        throw new Error('Only one activity is allowed at the same time.');
      }
    }
    if (activity in this.sessions) {
      if (this.sessions[activity].user.username != user.username) {
        throw new Error('The activity is locked by other user.')
      }
      logger.info(`User ${username} connected to previous session.`);
      this.sessions[activity].connect(socket);
      return this.sessions[activity];
    }
    var controller = await getController(theActivity);
    this.hardware = hardwarePool.getHardwareFor(controller);
    this.sessions[activity] = new Session(theActivity, user, this, this.hardware);
    this.sessions[activity].start();
    this.sessions[activity].connect(socket);
    this.tokens[this.sessions[activity].token] = this.sessions[activity];
    logger.info(`Session started: user ${username} - ${new Date()}`);
    return this.sessions[activity];
  }

  stop(activity) {
    delete this.sessions[activity];
  }

  async validate(credentials) {
    try {
      var token = credentials['key'];
      if(token) {
        return this.tokens[token].user;
      }
      var user = await db.users.getUser(credentials['username']);
      if(user && user.password == credentials['password']) {
        return user;
      }
    } catch(e) {}
  }

  hasActivities(user) {
    for (const activity in this.sessions) {
      if (this.sessions[activity].user.username == user.username) {
        return true;
      }
    }
    return false;
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
