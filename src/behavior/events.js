var events = require('events');

/*
 * Decide which information, and when, will be transmitted to the clients.
 */
class EventGenerator extends events.EventEmitter {

  constructor(listener) {
    super();
    this.period = 500;
    this.periodHeartbeat = 5000;
    this.buffer = [];
    this.listener = listener;
    this.state = {};
    this.EVENT = 'signals.get';

    setInterval(this._withProcessing(this.flush.bind(this)), this.period);
    setInterval(this._withProcessing(this.heartbeat.bind(this)), this.periodHeartbeat);
    this.on(this.EVENT, this._withProcessing(this.onEvolution.bind(this)));
  }

  _withProcessing(f) {
    return (data => {
      var processedData = f(data);
      if(processedData) {
        this.listener.emit(this.EVENT, processedData);
      }
    }).bind(this);
  }

  /*
   * Process incoming data: 
   *  - Evolution data is buffered.
   *  - Parameters/config are immediately transmitted.
   */ 
  onEvolution(data) {
    var variable = data['variable'], value = data['value'];
    if (variable == 'evolution') {
      this.buffer.push(data); 
    } else {
      if(!this.state[variable] || this.state[variable] != value) {
        this.state[variable] = value;
        return data;
      }  
    }  
  }  

  /*
   * Transmit the content of the buffered. 
   */
  flush(data) {
    var data = this.buffer.splice(0);
    return data;
  }

  /*
   * Transmit an update periodically, to avoid long periods without notifications. 
   */
  heartbeat() {
    var data = [];
    for(var v in this.state) {
      data.push({ 'variable': v, 'value': this.state[v]});
    }
    return data;
  }
}


/* 
 * Dispatch incoming events.
 */
class EventDispatcher {
  //static PROCESS = 'process';
  //static ENQUEUE = 'enqueue';
  //static DISCARD = 'discard';
  //static UNMATCHED = 'umatched';
  constructor(eventProcessor) {
    this.eventProcessor = eventProcessor;
    this.rules = {}
    this.handle = {
      'process': this._process.bind(this),
      'enqueue': this._enqueue.bind(this),
    }
  }

  _process(event) {
    this.eventProcessor.process(event);
  }

  _enqueue(event) {
    this.eventProcessor.enqueue(event);
  }

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
      if (type != 'unmatched') { //EventDispatcher.UNMATCHED) {
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

  constructor(session) {
    this.rules = {};
    this.queue = [];
    this.session = session;
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
      if(rule['condition'](event)) { 
        let action = rule['action'].bind(this.session);
        action(event);
      }
    }
  }

  enqueue(event) {
    this.queue.push(event);
  }
}

module.exports.EventGenerator = EventGenerator;
module.exports.EventProcessor = EventProcessor;
module.exports.EventDispatcher = EventDispatcher;