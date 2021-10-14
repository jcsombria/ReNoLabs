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
     for (var i=0; i<this.listeners.length; i++) {
       try {
         for (var j=0; j<variables.length; j++) {
           this.listeners[i].write(variables[j], ()=>{});
         }
       } catch(error) {
         logger.warn(`Cannot notify listener.`);
       }
     }
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
}

module.exports = State;
