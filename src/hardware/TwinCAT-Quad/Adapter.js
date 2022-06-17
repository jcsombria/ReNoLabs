const ads = require('node-ads');
const winston = require('winston');
const logger = winston.loggers.get('log');

const Adapter = require('../Adapter');
const State = require('../State');
const Settings = require('../../settings');

// Encapsulates the interaction with TwinCAT
class TwinCATAdapter extends Adapter {
	constructor(controller) {
    super(controller);
    this.toRequest = ['UserUpdate'];
    this.state = new TwinCATState();
  }

  /**
   * Start the controller.
   */
   start() {
		// Store the reference to this in that, we will need it inside the callbacks
		let that = this;
    logger.debug('TwinCAT Adapter: Starting PLC Channel');
    const options = require(this.getPathFor('Config.js'));
    this.handles = require(this.getPathFor('Variables.js'));
    this.state.setHandles(this.handles);
    this.conn = ads.connect(options, function() {
      logger.info('TwinCAT Adapter: TwinCAT channel started.');
      that.toRequest.forEach(r => {
        this.notify(that.handles[r]); 
      });
			that.onstart();
		});
		this.conn.on('notification', function(handle) {
      try {
        logger.debug('TwinCAT Adapter: TwinCAT notification');
        console.log('dfFDFFD')
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

  setHandles(handles) {
    this.handles = handles;
  }

  set config(value) {
    this.handles.config.value = value;
    this.notify([this.handles.config]);
    logger.debug(`TwinCAT Adapter: Set config=${value}`);
  }

  get config() {
    return this._config;
  }

  set reference(value) {
    logger.debug(`TwinCAT Adapter: Set reference=${value}`);
    this.handles.referenceR.Tipo = [value.Roll.Tipo];
    this.handles.referenceR.param = value.Roll.param;
    this.handles.referenceP.Tipo = [value.Pitch.Tipo];
    this.handles.referenceP.param = value.Pitch.param;
    this.handles.referenceY.Tipo = [value.Yaw.Tipo];
    this.handles.referenceY.param = value.Yaw.param;
    this.notify([
      this.handles.referenceR,
      this.handles.referenceP,
      this.handles.referenceY,
    ]);
  }

  get reference() {
    return this._reference;
  }

  set controller(value) {
    logger.debug(`TwinCAT Adapter: set controller=${value}`);
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
    this.notify([
      this.handles.controller,
      this.handles.PIDpr,
      this.handles.FL,
      this.handles.PIDy,
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
    console.log('DDD')
    logger.silly('TwinCAT Adapter: Incoming PLC data');
		this._config = o.config[0];
		this._evolution = o.evolution;
		this._reference = o.reference;

    console.log(this._controller)
    console.log(o.controller)
		// this._controller = {
		// 	'Tipo': o.ControlData.readUInt8(0),
    //   'Continuous': o.ControlData.readUInt8(1),
		// 	'RealSys': o.ControlData.readUInt8(2),
    //   'T': o.ControlData.readFloatLE(3),
		// // 	'PIDPR': this._buffer2array(o.PIDrp, 4, 4, 1),
		// // 	'PIDY': this._buffer2array(o.PIDy, 4, 4, 1),
		// // 	'FL': this._extractFL(o.FLdat),
		// };
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