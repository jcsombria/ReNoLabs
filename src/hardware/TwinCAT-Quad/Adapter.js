const ads = require('ads');
const config_default = require('./Config');
const winston = require('winston');
const logger = winston.loggers.get('log');
const handles = require('./Variables');

const Adapter = require('../Adapter');
const State = require('../State');
const Settings = require('../../settings');


// Encapsulates the interaction with TwinCAT
class TwinCATAdapter extends Adapter {
	constructor(controller, options) {
    super(controller, options);
    this.handles = handles;
    this.toRequest = ['UserUpdate'];
    this.state = new State();
  }

  /**
   * Start the controller.
   */
   start() {
		// Store the reference to this in that, we will need it inside the callbacks
		let that = this;
    logger.silly('TwinCAT Adapter: Starting PLC Channel');

    this.conn = ads.connect(this.options, function() {
      logger.info('TwinCAT Adapter: TwinCAT channel started.');
      for(var i=0; i<that.toRequest.length; i++) {
        var v = that.toRequest[i];
        this.notify(that.handles[v]);
      }
			that.onstart();
		});

		this.conn.on('notification', function(handle) {
      try {
        logger.silly('TwinCAT Adapter: TwinCAT notification');
        that.ondata(handle);
      } catch(e) {
        logger.error(`TwinCAT Adapter: User data handler throws an error: ${e.message}`);
      }
		});

    this.conn.on('error', function(error) {
      logger.error(`TwinCAT Adapter: ${error}`);
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

	write(variable, value, callback) {
    try {
      this.state[variable] = value;
    } catch(e) {
      logger.error(`TwinCAT Adapter: Cannot write ${variable}`);
    }
	}

	stop(callback) {
    logger.info('TwinCAT Adapter: TwinCAT channel stopped.');
    this.handles.config.value = 5;
    this.conn.write(this.handles.config, ()=>{
      this.conn.end();
      this.state.removeListener(this.conn);
      this.connected = false;
    });
	}
}

// TwinCAT State
class TwinCATState extends State {
  constructor() {
    super();
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

  set config(value) {
    handles.config.value = value;
    this.notify([handles.config]);
    logger.debug(`TwinCAT Adapter: Set config=${value}`);
  }

  get config() {
    return this._config;
  }

  set reference(value) {
    logger.debug(`TwinCAT Adapter: Set reference=${value}`);
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
    logger.debug(`TwinCAT Adapter: set controller=${value}`);
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
    logger.silly('TwinCAT Adapter: Incoming PLC data');
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
    return { 'K' : '[' + cols.join(';') + ']' };
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
