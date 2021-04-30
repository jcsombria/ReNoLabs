class LabInstance {
  state_EJS = { inputs: {}, outputs: {} };
  state_REAL = { config: 0, evolution: [], inputs: {}, outputs: {} }; //[0: disconnected, 1: ready, 2: play, 3: pause, 4: reset] 

  constructor(address, port, handlers) {
    this.address = address; 
    this.port = port;
    this.key_ejs = undefined;
    this.user = undefined;
    this.password = undefined;
    this.configNo = 0;
    this.config = undefined;
    this.socket = undefined;
    this.BUFFER_SIZE = 1000;
    this.buffer = [];
    this.handlers = handlers;
  };
    
  /**
   * Create an io socket and try to open a new connection with the configured remote laboratory server.
   */
  connect() {
    this.key_ejs = this._getLabKey();
    if (!this.key_ejs && !this.user) return;
    if (!this.socket) {
      this.socket = io.connect(this._getURL(), { query: this._getQueryString() });
      if (this.socket) {
        this.socket.on('connect', this.onconnect.bind(this));
        this.socket.on('signals.info', this.onconfig.bind(this));
        this.socket.on('signals.get', this.onsignals.bind(this));
        this.socket.on('disconnect_timeout', function(data) {
          alert('Aviso: La sesión ha finalizado.');
          window.location = "./select";
        });
        this.socket.on('disconnect', this.disconnect.bind(this));
      }
    } else {
      if (this.socket.disconnected) {
        this.socket.query = this.socket.io.opts.query = this._getQueryString();
        this.socket.connect();
      }
    }
  }
    
  _getLabKey() {
    let key;
    try { key = LAB_KEY; } catch(e) { key = this.key_ejs; };
    return key;
  } 
  
  _getURL() {
    let url;
    try { url = LAB_ADDRESS; } catch(e) { url = 'http://' + this.address + ':' + this.port; };
    return url;
  }
  
  _getQueryString() {
    if (this.key_ejs) { return 'key=' + this.key_ejs; }
    return 'user='+(this.user || '')+'&'+'password='+(this.password || '');
  }

  /**
  * Handle the connection event. 
  */ 
  onconnect() {
    this.socket.emit('signals.info', {request: 'config'});
  }    

  /**
  * Receive the configuration metadata. 
  */ 
  onconfig(data) {
    if (data.request == 'config') {
      this.config = data.response;
      this.configNo++;
    }    
    try {
      var endtime = new Date(data.session.timeout);
      var message = 'Estás conectado al Laboratorio.\n La hora de finalización de la sesión es: ' + endtime.toLocaleTimeString();
      // alert(message);
      this.handlers['onconfig'](data);
    } catch(e) {}    
  }    

  /**
  * Receive signals data. 
  */ 
  onsignals(data) {
    if(!Array.isArray(data)) { data = [data]; }
    for (var i = 0; i < data.length; i++) {
      var state = data[i];
      if(state['variable'] == 'evolution') {
        this.buffer.push(state['value']);
      } else {
        this.state_REAL[state.variable] = state.value;
        this.state_REAL.inputs[state.variable] = state.value;
      }
    }
    try {
      this.handlers['onsignals'](data);
    } catch {}
  }    

  /**
  * Receive signals data. 
  */
 update() {
    try {
      var batch = [];
      for (var key in this.state_EJS) {
        if (this.state_REAL[key] != this.state_EJS[key]) {
          batch.push({variable: key, value: this.state_EJS[key]});
        }
      }
      for (var key in this.state_EJS.inputs) {
        if (this.state_REAL.inputs[key] != this.state_EJS.inputs[key]) {
          batch.push({variable: key, value: this.state_EJS.inputs[key]});
        }
      }
      this.socket.emit('signals.set', batch);
    } catch(e) {
      console.error('cannot send variables to server.');
    }
  }

  send(events) {
    this.socket.emit('signals.set', events);
  }

  /**
  * Disconnect from the lab.
  */ 
  disconnect() {
    this.config = undefined;
    if (this.key_ejs) { window.location = "./select"; }
    alert('Te has desconectado del laboratorio. La sesión finalizará si no hay mas clientes conectados.');
    if (this.socket.connected) {
      this.socket.disconnect();
    }
    try {
      this.handlers['ondisconnect'](data);
    } catch {}
  }

  /**
  * Send a config command. 
  */ 
 send_connect(variable, controller) {
      let data = { variable: 'config', value: [variable] };
      if (variable == 1) { data['version'] = controller; }
      this.socket.emit('signals.set', data);
  }

  /**
  * Set user credentials. 
  */ 
 setCredentials(credentials) {
      if (!credentials) { return; }
      if (credentials['user'] !== undefined) { this.user = credentials['user']; }
      if (credentials['password'] !== undefined) { this.password = credentials['password'] }
  }
};
