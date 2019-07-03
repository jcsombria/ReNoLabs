var ads = require('ads');
var config_default = require('config/TwinCAT-quad');

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
    //The propery name where the value should be written.
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
			console.info('[INFO] TwinCAT channel started.');
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
      }
		});

    this.conn.on('error', function(error) {
			console.error('[ERROR] ' + error);
			that.onerror(error);
		});
  }

  onstart() {
		this.connected = true;
  }

  ondata(ev) {
    this.state.update(ev);
		// Write evolution to log file
		// TO DO: move to another place?
		// stream = state.evolution +  " ";
		// data_stream.write(stream.replace(/,/g, " ") + "\n");
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
    console.log(variable);
    if (variable === 'config') {
      this.handles.config.value = value;
      this.conn.write(this.handles.config, ()=>{});
    }

    if (variable === 'reference') {
      this.handles.referenceR.Tipo = [value.Roll.Tipo];
      this.handles.referenceR.param = value.Roll.param;
      this.handles.referenceP.Tipo = [value.Pitch.Tipo];
      this.handles.referenceP.param = value.Pitch.param;
      this.handles.referenceY.Tipo = [value.Yaw.Tipo];
      this.handles.referenceY.param = value.Yaw.param;

      this.conn.write(this.handles.referenceR, ()=>{});
      this.conn.write(this.handles.referenceP, ()=>{});
      this.conn.write(this.handles.referenceY, ()=>{});
    }

    if (variable === 'controller') {
    	this.handles.controller.Tipo = [value.Tipo];
    	this.handles.controller.Continuous = [1];
    	this.handles.controller.RealSys = [value.RealSys];
    	this.handles.controller.T = [value.T];
    	this.handles.PIDpr.values = value.PIDPR;
      this.handles.PIDpr.bp = [0];
    	this.handles.PIDy.values = value.PIDY;
    	this.handles.PIDy.bp = [0];
      this.handles.FL.K = State.string2array(value.FL.K);
    	this.handles.FL.bp = [0];

      this.conn.write(this.handles.controller, ()=>{});
      this.conn.write(this.handles.PIDpr, ()=>{});
      this.conn.write(this.handles.PIDy, ()=>{});
    	this.conn.write(this.handles.FL, ()=>{});
    }

	}

	stop(callback) {
		console.info('[INFO] TwinCAT channel stopped.');
    this.handles.config.value = 5;
    this.conn.write(this.handles.config, ()=>{
      this.conn.end();
      this.connected = false;
    });
	}
}

// TwinCAT State
class State {
  constructor() {
    // Initial state
    this.config = 0; //[play, pause, reset, update, connect]
    this.evolution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //[t, r, u, y]
    this.reference = {
      Roll: {Tipo:0, param:[40, 0, 0, 0]}, //Periodo, Amplitud, OffsetY, OffsetP]
      Pitch: {Tipo: 0, param: [40, 0, 0, 0]}, //Periodo, Amplitud, OffsetY, OffsetP]
  		Yaw: {Tipo:0,	param:[40, 0, 0, 0]}, //Periodo, Amplitud, OffsetY, OffsetP]
  	};
  	this.controller = {
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

  update(o) {
		this.config = o.ControlState[0];
		this.evolution = this._buffer2array(o.EvolutionData, 4, 14);
		this.reference = {
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
		this.controller = {
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
