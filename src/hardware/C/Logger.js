const Logger = require('../Logger');

class CLogger extends Logger {
  constructor(stream) {
    super();
    this.lastTime = -1;
    this.tolerance = 1e-2;
  }

  format(data) {
    if(data.variable == 'evolution' && data.value != undefined) {
      let time = data.value[0];
      if(Math.abs(time - this.lastTime) > this.tolerance) {
        this.lastTime = time;
        var message = data.value +  " ";
        var toLog = message.replace(/,/g, " ");
        return toLog;
      }
    }
  }
}

module.exports = CLogger;
