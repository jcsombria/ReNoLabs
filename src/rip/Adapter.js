var ads = require('ads');
var config_default = require('./Config');

// TwinCAT variables
var handles = {
  'config': {
    //Handle name in twincat
    symname: 'Main.ControlState',
    //An ads type object or an array of type objects.
    //You can also specify a number or an array of numbers,
    //the result will then be a buffer object.
    //If not defined, the default will be BOOL.
    bytelength: [ads.INT],
    elements: [1],
    //The property name where the value should be written.
    //This can be an array with the same length as the array length of byteLength.
    //If not defined, the default will be 'value'.
    propname: ['value'],
  },
  'evolution': {
    symname: 'Main.evolution',
    bytelength: [ads.REAL],
    propname: ['values'],
    elements: [14],
  },
  'referenceR': {
    symname: 'Main.referenciaR',
    bytelength: [ads.BYTE, ads.REAL],
    propname: ['Tipo','param'],
 	  elements: [1,4],
  },
  'referenceP': {
    symname: 'Main.referenciaP',
    bytelength: [ads.BYTE, ads.REAL],
    propname: ['Tipo','param'],
    elements: [1,4],
  },
  'referenceY': {
    symname: 'Main.referenciaY',
    bytelength: [ads.BYTE, ads.REAL],
    propname: ['Tipo', 'param'],
    elements: [1, 4],
  },
  'controller': {
    symname: 'Main.ControlData',
    bytelength: [ads.BYTE, ads.BYTE, ads.BYTE, ads.REAL],
    propname: ['Tipo', 'Continuous', 'RealSys', 'T'],
    elements: [1, 1, 1, 1],
  },
  'PIDpr': {
    symname: 'Main.PIDrp',
    bytelength: [ads.BYTE, ads.REAL],
    propname: ['bp', 'values'],
    elements: [1, 4],
  },
  'PIDy': {
    symname: 'Main.PIDy',
    bytelength: [ads.BYTE, ads.REAL],
    propname: ['bp', 'values'],
    elements: [1, 4],
  },
  'FL': {
    symname: 'Main.FLdat',
    bytelength: [ads.BYTE,ads.REAL,],
    propname: ['bp','K'],
    elements:[1, 12],
  },
  'Change': {
    symname: 'Main.Change',
    bytelength: ads.INT,
    elements:[1],
    //OPTIONAL: (These are set by default)
    transmissionMode: ads.NOTIFY.CYLCIC,
    //transmissionMode: ads.NOTIFY.ONCHANGE, (other option is ads.NOTIFY.CYLCIC)
    //maxDelay: 0,  -> Latest time (in ms) after which the event has finished
    cycleTime: 100 //-> Time (in ms) after which the PLC server checks whether the variable has changed
  },
  'UserUpdate': {
    symname: 'Main.UserUpdate',
    bytelength: [
	    ads.INT, // Sequence
      ads.INT, // ControlState
      [ads.BYTE], //ads.BYTE, ads.BYTE, ads.REAL], // ControlData
	    [ads.REAL], // EvolutionData
	    ads.BYTE, // referenciaR.Tipo
      [ads.REAL], // referenciaR.param
      ads.BYTE, // referenciaP.Tipo
      [ads.REAL], // referenciaP.param
      ads.BYTE, // referenciaY.Tipo
      [ads.REAL], // referenciaY.param
      [ads.BYTE], // PIDrp
      [ads.BYTE], // PIDy
      [ads.BYTE], // FLdat
    ],
    elements: [ // TO DO: auto generate description
      1,
      2,
      11,
      20*4, // 1+4+7+20*4 = 92
      1,
      7*4,
      1,
      7*4,
      1,
      7*4,
      14*4 + 2*1,
      14*4 + 2*1,
      1 + 18*4 + 6*4 + 1 + 5*4,
    ],
    propname: [
      'Sequence',
      'ControlState',
      'ControlData',
      'EvolutionData',
      'referenciaR.Tipo',
      'referenciaR.param',
      'referenciaP.Tipo',
      'referenciaP.param',
      'referenciaY.Tipo',
      'referenciaY.param',
      'PIDrp',
      'PIDy',
      'FLdat',
    ],
    transmissionMode: ads.NOTIFY.CYCLIC,
    //transmissionMode: ads.NOTIFY.ONCHANGE, (other option is ads.NOTIFY.CYLCIC)
    //maxDelay: 0,  -> Latest time (in ms) after which the event has finished
    cycleTime: 100 //-> Time (in ms) after which the PLC server checks whether the variable has changed
  },
};

// Encapsulates the interaction with TwinCAT
class TwinCATAdapter {
	constructor(options) {
		this.connected = false;
		this.conn = null;
    this.handles = handles;
    this.toNotify = ['config', 'evolution', 'reference', 'controller'];
    this.toRequest = ['UserUpdate'];
    this.listeners = [];
    this.state = new State();
    this.options = (options !== undefined) ? options : config_default;
  }

  addListener(o) {
    if(!(o in this.listeners)) {
      this.listeners.push(o);
    }
  }

	start() {
		// Store the reference to this in that, we will need it inside the callbacks
		let that = this;

    this.conn = ads.connect(this.options, function() {
      logger.info('TwinCAT channel started.');
      for(var i=0; i<that.toRequest.length; i++) {
        var v = that.toRequest[i];
        this.notify(that.handles[v]);
      }
			that.onstart();
		});

		this.conn.on('notification', function(handle) {
      try {
        that.ondata(handle);
      } catch(e) {
        console.error('[ERROR] User data handler throws an error.');
        console.error(e);
      }
		});

    this.conn.on('error', function(error) {
			console.error('[ERROR] ' + error);
			that.onerror(error);
		});
  }

  onstart() {
		this.connected = true;
    this.state.addListener(this.conn);
  }

  ondata(ev) {
    this.state.update(ev);
		for(var i=0; i<this.toNotify.length; i++) {
      var name = this.toNotify[i], value = this.state[name];
			var data = {'variable': name, 'value': value};
      this.notify('serverOut_clientIn', data);
		}
  }

  notify(ev, data) {
    for(var i=0; i<this.listeners.length; i++) {
      this.listeners[i].emit(ev, data);
    }
  }

  onerror(error) {
		console.error('[DEBUG] User error handle is not defined.');
  }

	read(handle) {
    console.error('[ERROR] Method read not implemented.');
	}

	write(variable, value, callback) {
    try {
      this.state[variable] = value;
    } catch(e) {
      console.error(`[ERROR] Cannot write ${variable}`);
    }
	}

	stop(callback) {
    logger.info('TwinCAT channel stopped.');
    this.handles.config.value = 5;
    this.conn.write(this.handles.config, ()=>{
      this.conn.end();
      this.state.removeListener(this.conn);
      this.connected = false;
    });
	}
}

// TwinCAT State
class State {
  constructor() {
    // Initial state
    this.listeners = [];
    this._config = 0; //[play, pause, reset, update, connect]
    this._evolution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //[t, r, u, y]
    this._reference = {
      Roll: {Tipo:0, param:[40, 0, 0, 0]}, //Periodo, Amplitud, OffsetY, OffsetP]
      Pitch: {Tipo: 0, param: [40, 0, 0, 0]}, //Periodo, Amplitud, OffsetY, OffsetP]
  		Yaw: {Tipo:0,	param:[40, 0, 0, 0]}, //Periodo, Amplitud, OffsetY, OffsetP]
  	};
  	this._controller = {
  		Tipo: 0,
  		RealSys: 0,
  		T: 0.01,
  		PIDPR: [0.8861, 1.0835, 0.3374, 0.31620], //[Kp, Ki, Kd, N, Error]
  		PIDY: [4.3088, 9.1306, 0.56416, 1.0], //[Kp, Ki, Kd, N, Error]
  		FL: {
  			K:"[1.5451,0,0,1.8276,0,0;0,1.5451,0,0,1.8276,0;0,0,0.6308,0,0,1.2295]",
  		}
    };
  }

  addListener(l) {
    if(!(l in this.listeners)) {
      this.listeners.push(l);
    }
  }

  removeListener(l) {
    var i = this.listeners.indexOf(l);
    if(i != -1) {
      this.listeners.splice(i, 1);
    }
  }

  // Send state updates to the remote PLCs
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

  set config(value) {
    logger.debug('set config');
    handles.config.value = value;
    this.notify([
      handles.config,
    ]);
  }

  get config() {
    return this._config;
  }

  set reference(value) {
    logger.debug('set reference');
    handles.referenceR.Tipo = [value.Roll.Tipo];
    handles.referenceR.param = value.Roll.param;
    handles.referenceP.Tipo = [value.Pitch.Tipo];
    handles.referenceP.param = value.Pitch.param;
    handles.referenceY.Tipo = [value.Yaw.Tipo];
    handles.referenceY.param = value.Yaw.param;
    this.notify([
      handles.referenceR,
      handles.referenceP,
      handles.referenceY,
    ]);
  }

  get reference() {
    return this._reference;
  }

  set controller(value) {
    logger.debug('set controller');
    handles.controller.Tipo = [value.Tipo];
    handles.controller.Continuous = [1];
    handles.controller.RealSys = [value.RealSys];
    handles.controller.T = [value.T];
    handles.PIDpr.values = value.PIDPR;
    handles.PIDpr.bp = [0];
    handles.PIDy.values = value.PIDY;
    handles.PIDy.bp = [0];
    handles.FL.K = State.string2array(value.FL.K);
    handles.FL.bp = [0];
    this.notify([
      handles.controller,
      handles.PIDpr,
      handles.FL,
      handles.PIDy,
    ]);
  }

  get controller() {
    return this._controller;
  }

  get evolution() {
    return this._evolution;
  }

  // Parse PLC notification and update state
  update(o) {
		this._config = o.ControlState[0];
		this._evolution = this._buffer2array(o.EvolutionData, 4, 14);
		this._reference = {
      'Roll': {
        'Tipo': o['referenciaR.Tipo'][0],
        'param': this._buffer2array(o['referenciaR.param'], 4, 4),
      },
		 	'Pitch': {
        'Tipo': o['referenciaP.Tipo'][0],
        'param': this._buffer2array(o['referenciaP.param'], 4, 4),
      },
			'Yaw': {
        'Tipo': o['referenciaY.Tipo'][0],
        'param': this._buffer2array(o['referenciaY.param'], 4, 4),
      },
		};
		this._controller = {
			'Tipo': o.ControlData.readUInt8(0),
      'Continuous': o.ControlData.readUInt8(1),
			'RealSys': o.ControlData.readUInt8(2),
      'T': o.ControlData.readFloatLE(3),
			'PIDPR': this._buffer2array(o.PIDrp, 4, 4, 1),
			'PIDY': this._buffer2array(o.PIDy, 4, 4, 1),
			'FL': this._extractFL(o.FLdat),
		};
  }

  _extractFL(o) {
    var count = 6, size = 4, offset = 1, rows = 3;
    var cols = [];
    for(var i=0; i<rows; i++) {
      var row = this._buffer2array(o, size, count, offset + i*size);
      cols.push(row.join());
    }
    return '[' + cols.join(';') + ']';
  }

  _buffer2array(b, size, count, offset=0) {
    var a = []
    var n = (count !== undefined) ? count : (b.length - 1) / size;
    for(var i=0; i<n; i++) {
      var value = b.readFloatLE(offset + i*size);
      a.push(this._round(value));
    }
    return a;
  }

  _round(value) {
    return Math.round(1e4*value) * 1e-4;
  }

  static string2array(o) {
    return JSON.parse(o.replace(/;/g,","));
  }
}

module.exports.Adapter = TwinCATAdapter;
module.exports.State = State;
module.exports.DefaultConfig = config_default;
