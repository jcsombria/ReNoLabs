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

    setInterval(this.flush.bind(this), this.period);
    setInterval(this.heartbeat.bind(this), this.periodHeartbeat);
    this.on('signals.get', this.onEvolution.bind(this));
  }

  /*
   * Create a buffer with the data received and notifies the batch when the size is greater than
   * communicatino threshold
   */
  onEvolution(data) {
    var variable = data['variable'], value = data['value'];
      if (variable == 'evolution') {
        this.buffer.push(data);
      } else {
        if(!this.state[variable] || this.state[variable] != value) {
          this.state[variable] = value;
          this.listener.emit('signals.get', data);
        }
      }
  }

  flush() {
    var data = this.buffer.splice(0);
    this.listener.emit('signals.get', data);
  }

  heartbeat() {
    var data = [];
    for(var v in this.state) {
      data.push({ 'variable': v, 'value': this.state[v]});
    }
    this.listener.emit('signals.get', data);
  }
}

module.exports = EventGenerator;
