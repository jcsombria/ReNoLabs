// Sessions Management
const logger = require('winston').loggers.get('log');
const rules = require('../behavior/rules');
const {
  EventGenerator,
  EventProcessor,
  EventDispatcher,
} = require('../behavior/events');
const models = require('../models');
const Hardware = require('../hardware');

class HardwarePool {
  constructor() {
    this.busy = {};
  }

  getHardwareFor(controller) {
    if (!(controller.type in Hardware)) {
      throw new Error('Unknown hardware adapter.');
    }
    if (!(controller.name in this.busy)) {
      this.busy[controller.name] = {
        name: controller.name,
        adapter: new Hardware[controller.type].Adapter(controller),
        logger: new Hardware[controller.type].Logger(),
        eventGenerator: new EventGenerator(),
      };
      this.busy[controller.name].adapter.addListeners([
        this.busy[controller.name].logger,
        this.busy[controller.name].eventGenerator,
      ]);
    }
    return this.busy[controller.name];
  }

  free(hardware) {
    if (!hardware.name in this.busy) {
      return;
    }
    hardware.adapter.stop();
    hardware.logger.end();
    hardware.eventGenerator.stop();
    delete this.busy[hardware.name];
  }
}

const hardwarePool = new HardwarePool();


class SessionReadOnly {
  constructor(session) {
    this.session = session;
  }

  connect(socket) {
    if (socket.id == undefined) {
      return;
    }
    this.socket = socket;
    this.session.hardware.eventGenerator.addListener(socket);
  }

  disconnect(id) {
    try {
      logger.debug(`Disconnecting read only client ${id}`);
      this.socket.disconnect();
    } catch (e) {
      logger.debug("Can't disconnect read only client properly.");
    }
  }

  /* TO DO: Implement as a rule in the dispatcher. */
  process(event) {}

  /*
   * @return {object} Information about the current session.
   */
  info() {
    return {
      user: this.session.user.username,
      timeout: this.session.endTime,
    };
  }

  get expired() {
    return this.session.expired;
  }

  get finished() {
    return !this.active;
  }

  /**
   * @return {number} Seconds remaining in the session
   */
  get expiresIn() {
    return this.session.expiresIn;
  }
}

/* Session model. */
class Session {
  /*
   * @param {Activity}       activity  The activity.
   * @param {User}           user      The user that opened the session.
   * @param {string}         id        The id of the channel (socket) associated to the session.
   * @param {ActivityManager} manager   The session manager.
   */
  constructor(activity, user, manager, hardware) {
    this.activity = activity;
    this.user = user;
    this.active = false;
    this.clients = {};
    this.manager = manager;
    this.hardware = hardware;
    this.eventProcessor = new EventProcessor(this);
    this.eventDispatcher = new EventDispatcher(this.eventProcessor);
    // # Dispatching Rules
    // - Enqueue if extern references, otherwise process immediately
    this.eventDispatcher.addRoutingRule(
      'enqueue_if_extern_process_otherwise',
      (event) => {
        let isExtern = event.variable == 'reference' && event.value[0] == 4;
        return isExtern ? 'enqueue' : 'process'; // EventDispatcher.ENQUEUE : EventDispatcher.PROCESS;
      }
    );

    for (var r in rules) {
      try {
        this.eventProcessor.addRule(
          r,
          rules[r]['condition'],
          rules[r]['action']
        );
      } catch (e) {
        logger.warn('Cannot import event processing rule.');
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

  async start() {
    logger.debug(`User ${this.user.username} starts ${this.activity.name}.`);
    this.active = true;
    this.activity.state = 'busy';
    this.activity.save().catch((e) => {
      logger.debug(e);
    });
    this.hardware.logger.start(this.user.username);
    this.hardware.adapter.start(this.user.username);
    this.hardware.adapter.play();
    this.startTime = new Date();
    this.endTime = new Date(
      this.startTime.getTime() + this.activity.sessionTimeout * 60 * 1000
    );
    this.timer = setTimeout(
      this._timeout.bind(this),
      this.activity.sessionTimeout * 60 * 1000
    );
    this.session = await models.Session.create({
      ActivityName: this.activity.name,
      UserUsername: this.user.username,
      startedAt: this.startTime,
      finishedAt: this.endTime,
      data: this.hardware.logger.name,
    });
  }

  end() {
    this.active = false;
    this.activity.state = 'idle';
    this.activity.save().catch((e) => {
      logger.debug(e);
    });
    this.session.finishedAt = new Date();
    this.session.save();
    logger.debug(`Stopping hardware`);
    this.stop();
    for (var c in this.clients) {
      try {
        logger.debug(`Disconnecting client ${c}`);
        this.clients[c].disconnect();
      } catch (e) {
        logger.debug(`Cannot notify disconnection to client ${c}`);
      }
    }
    this.manager.stop(this.activity.name);
  }

  connect(socket) {
    if (socket.id == undefined) {
      return;
    }
    this.clients[socket.id] = socket;
    this.hardware.eventGenerator.addListener(socket);
    this._clearDisconnectTimeout();
  }

  disconnect(id) {
    try {
      logger.debug(`Disconnecting client ${id}`);
      this.clients[id].disconnect();
    } catch (e) {
      logger.debug("Can't disconnect client properly.");
    }
    delete this.clients[id];
    if (!this.hasClients() && !this.disconnectTimer && this.active) {
      logger.debug(`No clients left, starting disconnection timeout`);
      return new Promise((resolve, reject) => {
        this.disconnectTimer = setTimeout(
          function () {
            logger.info(`Disconnection Timeout - ${new Date()}`);
            this.end();
            resolve(`Session expired - ${new Date()}`);
          }.bind(this),
          this.activity.disconnectTimeout * 1000
        );
      });
    }
  }

  stop() {
    hardwarePool.free(this.hardware);
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
   * @return {object} Information about the current session.
   */
  info() {
    return {
      user: this.user.username,
      timeout: this.endTime,
    };
  }

  get expired() {
    var now = new Date().getTime();
    return this.endTime < now;
  }

  get finished() {
    return !this.active;
  }

  /**
   * @return {number} Seconds remaining in the session
   */
  get expiresIn() {
    var now = new Date().getTime();
    return Math.round((this.endTime - now) / 1000);
  }

  /*
   * @return {boolean} True if the user is owner of the hardware, False otherwise.
   */
  isActive() {
    return this.active;
  }

  _timeout() {
    this.end();
    logger.info(`Session expired - ${new Date()}`);
  }

  _disconnectTimeout() {
    this.end();
    logger.info(`Disconnection Timeout - ${new Date()}`);
  }

  _clearDisconnectTimeout() {
    clearTimeout(this.disconnectTimer);
    this.disconnectTimer = undefined;
  }

  hasClients() {
    return Object.keys(this.clients).length > 0;
  }
}

// Coordina el inicio y fin de sesión entre hardware, logger y autenticación
class ActivityManager {
  constructor() {
    this.clients = {};
    this.sessions = {};
  }

  /** Connects a client to an activity
   *  - If the activity has no opened session, a new one is created.
   *  - If there is an openeed session, the connection is successful
   *  if and only if the user is supervisor or owns the previous session.
   */
  async get_or_start(activity, user) {
    if (!activity) {
      throw new Error(`The activity ${theActivity} does not exist.`);
    }
    if (!user) {
      throw new Error(`Invalid User`);
    }
    const session =
      this.getSession(activity, user) || (await this.start(activity, user));
    return session;
  }

  /**
   * Get a session of user in activity if it exists, otherwise undefined.
   * @param {*} activity
   * @param {*} user
   * @returns The session
   */
  getSession(activity, user) {
    if (!(activity.name in this.sessions)) {
      return;
    }
    if (this.sessions[activity.name].user.username != user.username) {
      return ; //new SessionReadOnly(this.sessions[activity.name]);
    }
    return this.sessions[activity.name];
  }

  /** Connects a client to an activity
   *  - If the activity has no opened session, a new one is created.
   *  - If there is an openeed session, the connection is successful
   *  if and only if the user is supervisor or owns the previous session.
   */
  async connect(activity, user, socket) {
    if (!activity) {
      throw new Error(`The activity ${theActivity} does not exist.`);
    }
    if (!user) {
      throw new Error(`Invalid User`);
    }
    const session = this.getSession(activity, user);
    session.connect(socket);
    logger.info(`User ${user.username} connected to session.`);
    return session;
  }

  /**
   * Start a new session
   * @param {*} activity
   * @param {*} user
   */
  async start(activity, user) {
    if (this.hasActivities(user)) {
      throw new Error('Only one activity is allowed at the same time.');
    }
    if (this.isBusy(activity)) {
      throw new Error('The activity is busy.');
    }
    const controller = await getController(activity);
    const theHardware = hardwarePool.getHardwareFor(controller);
    this.sessions[activity.name] = new Session(
      activity,
      user,
      this,
      theHardware
    );
    this.sessions[activity.name].start();
    logger.info(`Session started: user ${user.username} - ${new Date()}`);
    return this.sessions[activity.name];
  }

  /**
   * Start a running activity
   * @param {*} activity
   * @param {*} user
   */
  stop(activity) {
    delete this.sessions[activity];
  }

  isBusy(activity) {
    return activity.name in this.sessions;
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
  if (activity.Controller) {
    return activity.Controller;
  }
  return models.Controller.findOne({
    where: { name: activity.controllerName },
    order: [['createdAt', 'DESC']],
  });
}

module.exports = {
  ActivityManager: new ActivityManager(),
  HardwarePool: hardwarePool,
  Session: Session,
};
