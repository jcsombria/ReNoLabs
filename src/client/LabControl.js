const model = {
  writables: {
    Tipo: {
      name: 'Tipo',
      description: 'Amplitud de la señal a generar',
      type: 'set',
      choices: [
        'Senoidal',
        'Cuadrada',
        'Triangular',
        'Impulse',
        'Step',
        'Extern',
      ],
      value: 'Senoidal',
      new_value: 'Senoidal',
    },
    Amplitud: {
      name: 'Amplitud',
      description: 'Amplitud de la señal a generar',
      type: 'float',
      min: '-12',
      max: '+12',
      precision: '0.01',
      value: 0,
      new_value: 0,
    },
    Periodo: {
      name: 'Periodo',
      description: 'Periodo de la señal a generar',
      type: 'float',
      min: '0.02',
      max: 'Inf',
      precision: '0.01',
      value: 0,
      new_value: 0,
    },
    'Offset Y': {
      name: 'Offset Y',
      description: 'Desviación en amplitud de la señal generar',
      type: 'float',
      min: '0',
      max: 'Inf',
      precision: '0',
      value: 0,
      new_value: 0,
    },
    'Offset T': {
      name: 'Offset T',
      description: 'Desviación en el tiempo de la señal a generar',
      type: 'float',
      min: '0',
      max: 'Inf',
      precision: '0',
      value: 0,
      new_value: 0,
    },
  },

  readables: {
    time: {
      name: 'Tiempo',
      description: 'Tiempo del servidor en segundos desde el inicio.',
      type: 'float',
      min: '0',
      max: 'Inf',
      precision: '0.001',
      value: 0,
      new_value: 0,
    },
    ref: {
      name: 'Referencia',
      description: 'Referencia de entrada al circuito.',
      type: 'float',
      min: '-12',
      max: '+12',
      precision: '0.01',
      value: 0,
      new_value: 0,
    },
    u: {
      name: 'Variable manipulada',
      description: 'Acción de control ',
      type: 'float',
      min: -12,
      max: 11,
      precision: '0.01',
      value: 0,
      new_value: 0,
    },
    y: {
      name: 'Variable controlada',
      description: 'Salida del circuito',
      type: 'float',
      min: '0',
      max: 'Inf',
      precision: '0',
      value: 0,
      new_value: 0,
    },
  },
};

class LabState {
  static fromModel(model) {
    const state = new LabState();
    for (const [w, w_info] of model[this.CONTROLS].entries()) {
      state.add(w, w_info.type);
    }
    for (const [w, w_info] of model[this.SIGNALS].entries()) {
      state.add(w, w_info.type);
    }
    return state;
  }

  constructor(session) {
    this.CONTROLS = 'writable';
    this.SIGNALS = 'readable';
    this.state = {};
    this.state_server = {};
    this.events = { any: [] };
  }

  add(name, model) {
    if (type !== this.READABLE && type !== this.WRITABLE) {
      throw new Error(`Unsupported type ${type}`);
    }
    this.state[name] = {
      value: model.value,
      new_value: model.value,
      last_update: null,
      changed: false,
    };
  }

  get(name) {
    if (!name in this.READABLE) {
      throw new Error(`"${name}" does not exist.`);
    }
    return new Promise.resolve(this.st);
  }

  set(name, value) {
    this.state[name].new_value = value;
    this.state[name].changed = true;
  }

  register(callback, events) {
    if (!events || events != 'any') {
      throw new Error('Yet to be implemented');
    }
    if (this.events.any.includes(callback)) {
      throw new Error(`${callback} already registered.`);
    }
    this.events.any.push(callback);
  }

  serialize() {
    return this.state;
  }
}

// const labmodel = LabState.fromModel(model);
// labmodel.register((update) => {
//   console.log(update);
// }, 'any');

// labmodel
//   .set('Amplitud', 3)
//   .then((updated) => {
//     console.log(updated);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

class LabInstance {
  constructor(address, port, handlers) {
    this.address = address;
    this.port = port;
    this.handlers = handlers;
    this.state = 'idle';
    this.connecting = null;
    this.state_client = { inputs: {}, outputs: {} };
    this.state_server = { config: 1, evolution: [], inputs: {}, outputs: {} }; //[0: disconnected, 1: ready, 2: play, 3: pause, 4: reset]
    this.buffer = [];
    this.listeners = [];
    this.events = { any: [] };
    // Legacy version, will be removed
    this.state_EJS = this.state_client;
    this.state_REAL = this.state_server;
  }

  //this.socket.on(
  //  'disconnect_timeout',
  //  this._ondisconnecttimeout.bind(this)
  //);

  /**
   * Open a new connection with the remote laboratory server.
   */
  connect() {
    return this._transition(
      'connected',
      ['idle', 'disconnecting'],
      (resolve, reject) => {
        const doConnect = () => {
          this.socket.emit('signals.info', {
            request: 'config',
          });
          resolve();
        };
        this.socket = this._createSocket();
        this.socket.on('connect', () => doConnect());
        this.socket.on('login_error', (reason) => reject(reason));
        this.socket.on('connect_error', (reason) => reject(reason));
        this.socket.on('disconnect', this._ondisconnect.bind(this));
        this.socket.on('signals.get', this._onsignals.bind(this));
        // DEPRECATED: will be removed {
        this.socket.on('signals.info', this._onconfig.bind(this));
        // }
        this.socket.connect();
      }
    );
  }

  _transition(state, guard, action) {
    if (!guard.includes(this.state)) {
      return Promise.reject(
        new Error(`Invalid transition ${this.state} -> ${state}`)
      );
    }

    const doTransition = (data) => {
      this.state = state;
      return Promise.resolve(data);
    };
    return action ? new Promise(action).then(doTransition) : doTransition();
  }

  _createSocket() {
    const socket = io(this._getURL(), {
      query: this._getQueryString(),
      autoConnect: false,
      reconnecion: false,
    });
    return socket;
  }

  _getURL() {
    let url;
    try {
      url = parent.LAB_ADDRESS || LAB_ADDRESS;
    } catch (e) {
      url = Number.isInteger(this.port) ? `http://${this.address}:${this.port}` : `http://${this.address}/`;
    }
    return url;
  }

  _getQueryString() {
    return `key=${this.token}&activity=${this._getActivity()}`;
  }

  _getActivity() {
    try {
      return parent.LAB_ACTIVITY || LAB_ACTIVITY;
    } catch (e) {
      return this.activity;
    }
  }

  get token() {
    return document.cookie.replace(
      /(?:(?:^|.*;\s*)activityToken\s*\=\s*([^;]*).*$)|^.*$/,
      '$1'
    );
  }

  /**
   * Disconnect from the lab.
   */
  _ondisconnect(reason) {
    this._transition('idle', ['connected', 'disconnecting']).then(() => {
      this.socket.off();
      if (this.handlers && this.handlers.disconnect) {
        this.handlers.ondisconnect(reason);
      }
    });
  }

  /**
   * Receive signals data.
   */
  _onsignals(data) {
    const updated = {};
    if (!Array.isArray(data)) {
      data = [data];
    }
    for (var i = 0; i < data.length; i++) {
      const state = data[i];
      if (state['variable'] == 'evolution') {
        this.buffer.push(state['value']);
      } 
      this.state_server[state.variable] = state.value;
      updated[state.variable] == true;
    }
    // const eventsCount = {};
    // for (const [k, v] of Object.entries(this.state_server)) {
    //   eventsCount[k] = v.length;
    // }
    this.listeners.forEach((l) => {
      l.invoked = true;
      l.callback({
        history: this.buffer,
        state: this.state_server,
      });
    });
    // this.listeners = this.listeners.filter((l) => l.oneTime && l.invoked);
    if (this.handlers && this.handlers.onsignals) {
      this.handlers.onsignals({
        history: this.buffer,
        state: this.state_server,
      });
    }
    this.buffer = [];
  }

  /**
   * @deprecated
   * Receive the configuration metadata.
   */
  _onconfig(data) {
    if (data.request == 'config') {
      this.config = data.response;
      this.configNo++;
    }
    if (this.handlers && this.handlers.onconfig) {
      this.handlers.onconfig(data);
    }
  }

  /**
   * Disconnect from the lab.
   */
  disconnect() {
    return this._transition('disconnecting', ['connected']).then(() => {
      this.socket.disconnect();
    });
  }

  _ondisconnecttimeout(data) {
    alert('Aviso: La sesión ha finalizado.');
    window.location = './home';
  }

  get idle() {
    return this.state == 'idle';
  }

  get disconnecting() {
    return this.state == 'disconnecting';
  }

  get connected() {
    return this.state == 'connected';
  }

  set(updates) {
    const events = [];
    updates.forEach((u) => {
      for (const [signal, value] of Object.entries(u)) {
        events.push({
          variable: signal,
          value,
        });
      }
    });
    this.socket.emit('signals.set', events);
  }

  register(callback, events) {
    if (!events || events != 'any') {
      throw new Error('Yet to be implemented');
    }
    if (this.events.any.includes(callback)) {
      throw new Error(`${callback} already registered.`);
    }
    this.listeners.push({ callback, invoked: false, oneTime: false });
  }


  send(events) {
    this.socket.emit("signals.set", events);
  }
}
