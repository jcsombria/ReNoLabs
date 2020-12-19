class LabInstance {
  state_EJS = { inputs: {}, outputs: {} };
  state_REAL = { config: 0, evolution: [], inputs: {}, outputs: {} }; //[0: disconnected, 1: ready, 2: play, 3: pause, 4: reset] 

  constructor(address, port) {
    this.address = address;
    this.port = port;
    this.key_ejs = undefined;
    this.user = undefined;
    this.password = undefined;
    this.configNo = 0;
    this.config = undefined;
    this.socket = undefined;
  };

  getQueryString() {
    if (this.key_ejs) {
      return 'key=' + this.key_ejs;
    }
    return 'user='+(this.user || '')+'&'+'password='+(this.password || '');
  }

  connect() {
    console.log('connecting people');
    this.key_ejs = this.getLabKey();
    if (!this.key_ejs && !this.user) return;
    if (!this.socket) {
      this.socket = io.connect(this.getURL(), { query: this.getQueryString() });
      if (this.socket) {
        this.socket.on('connect', function() {
          this.socket.emit('signals.info', {request: 'config'});
          _model.update();
        }.bind(this));
        this.socket.on('signals.info', function(data) {
          if (data.request == 'config') {
            this.config = data.response;
            this.configNo++;
          }
          try {
            var endtime = new Date(data.session.timeout);
            var message = 'Estás conectado al Laboratorio.\n La hora de finalización de la sesión es: ' + endtime.toLocaleTimeString();
            alert(message);
          } catch(e) {}
          _model.update();
        }.bind(this));
        this.socket.on('signals.get', function(data) {
          this.state_REAL[data.variable] = data.value;
          this.state_REAL.inputs[data.variable] = data.value;
          _model.update();
        }.bind(this));
        this.socket.on('disconnect_timeout', function(data) {
          alert('Aviso: La sesión ha finalizado.');
        });
        this.socket.on('disconnect', function() {
          this.config = undefined;
          _model.update();
          alert('Aviso: Te has desconectado del laboratorio. Redirigiendo a inicio en unos segundos...');
          setTimeout(()=>{ window.location = "./select"; }, 4000);
        }.bind(this));
      }
    } else {
      if (this.socket.disconnected) {
        this.socket.query = this.socket.io.opts.query = this.getQueryString();
        this.socket.connect();
      }
    }
  }

  getLabKey() {
    let key;
    try {
      key = LAB_KEY;
    } catch(e) {
      key = this.key_ejs;
    };
    return key;
  }

  getURL() {
    let url;
    try {
      url = LAB_ADDRESS;
    } catch(e) {
      url = 'http://' + this.address + ':' + this.port;
    };
    return url;
  }

  disconnect() {
    alert('Te has desconectado del laboratorio. La sesión finalizará por desconexión.');
    if (this.socket.connected) {
      console.log('disconnecting people');
      //this.socket.disconnect();
    }
  }

  send_connect(variable, controller) {
    let data = { variable: 'config', value: [variable] };
    if (variable == 1) { data['version'] = controller; }
    this.socket.emit('signals.set', data);
  }
  
  update() {
    try {
      for (var key in this.state_EJS) {
        if (this.state_REAL[key] != this.state_EJS[key]) {
          this.socket.emit('signals.set', {variable: key, value: this.state_EJS[key]})
        }
      }
      for (var key in this.state_EJS.inputs) {
        if (this.state_REAL.inputs[key] != this.state_EJS.inputs[key]) {
          this.socket.emit('signals.set', {variable: key, value: this.state_EJS.inputs[key]})
        }
      }
    } catch(e) {
      console.error('cannot send variables to server.');
    }
  }
};
