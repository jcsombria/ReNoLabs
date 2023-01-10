const logger = require('winston').loggers.get('log');

// A generic class to synchronize the hardware state
class State {
  constructor() {
    this.listeners = [];
  }

  // Observer pattern
  addListener(o) {
    if(!(o in this.listeners)) {
      this.listeners.push(o);
    }
  }

  removeListener(o) {
    var i = this.listeners.indexOf(o);
    if(i != -1) {
      this.listeners.splice(i, 1);
    }
  }

  notify(variables) {
    this.listeners.forEach(l => {
       try {
         for (var j=0; j<variables.length; j++) {
           this.listeners[i].write(variables[j], ()=>{});
         }
       } catch(error) {
         logger.warn(`Cannot notify listener.`);
       }
    });
  }

  // Parse the notification and update the state
  update(o) {
    try {
      var lines = o.split("\n");
      for (var l in lines) {
      	if(lines[l].length > 0) {
          var variable = lines[l].split(":")[0];
          var value = JSON.parse(lines[l].split(/:|\n/)[1]);
          this[variable] = value;
        }
      }
    } catch(e){
      logger.warn('Can\'t parse controller data.');
    }
  }

  set config(value) {
    this._config = value;
    this.notify([`config:${value}`]);
  }

  get config() {
    return this._config;
  }

  set reference(value) {
    this._reference = value;
    this.notify([`reference:${value}`]);
  }

  get reference() {
    return this._reference;
  }

  set evolution(value) {
    this._evolution = value;
  }

  get evolution() {
    return this._evolution;
  }

}

module.exports = State;
