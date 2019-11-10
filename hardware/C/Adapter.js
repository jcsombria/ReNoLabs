var config_default = require('./Config');
var State = require('../State');
var spawn = require('child_process').spawn;

// Encapsulates the interaction with the C Server
class CAdapter {
   constructor(options) {
    this.listeners = [];
    this.connected = false;
    this.conn = null;
    this.toNotify = ['config', 'evolution'];
    // this.toRequest = ['UserUpdate'];
    this.state = new CState();
    this.options = (options !== undefined) ? options : config_default;
  }

  addListener(o) {
    if(!(o in this.listeners)) {
      this.listeners.push(o);
    }
  }

  start(username) {
    let that = this;
    /*
     * Ejecuta el controlador e inicia una comunicación síncrona.
     */
    if (!username) {
      console.info('[INFO] Starting main controller...');
      this.conn = spawn('sudo', ['./controllers/C/default/c_controller']);
    } else {
      console.info('[INFO] Starting user controller (' + username + ')...');
      this.conn = spawn('sudo',['./controllers/C/users/' + username + '/c_controller']);
    }

    /*
     * Recibe la información de controlador canalizandola al usuario.
     * Además guarda el estado en el servidor para escribir en el fichero
     * toda la información que necesira el cliente (señal + controller).
     */
    this.conn.stdout.setEncoding('utf8');
    this.conn.stdout.on('data', this.ondata.bind(this));

    /*
     * En caso de fallo del controlador resetea las variables config y evolucion.
     * Si hay algún usuario conectado en ese momento lo redirige a la página principal.
     */
    this.conn.on('exit', function(code, string) {
      if (code == null) {
        // io.emit('disconnect_timeout', {text: 'Error: fallo en el controlador! \n' + 'Reinicie la práctica'});
        this.state.config = 0;
        this.state.evolution = [0, 0, 0, 0];
      }
    });

    /*
     * En caso de error se escribe en la terminal o en su defecto en un
     * fichero de salida (output.log) si se ejecuta el servidor como:
     * nohup node app_....js > output.log &
     */
    this.conn.stderr.on('data', function(data) {
        console.log('Error:', data);
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
//      this.state[variable] = value;
      this.stdin.write(variable + ':' + value);
    } catch(e) {
      console.error(`[ERROR] Cannot write ${variable}`);
    }
  }

  stop(callback) {
    console.info('[INFO] C controller stopped.');
    this.state['config'] = 0;
    // this.handles.config.value = 5;
    // this.conn.write(this.handles.config, ()=>{
    //   this.conn.end();
    //   this.state.removeListener(this.conn);
    //   this.connected = false;
    // });
  }
}

class CState extends State {
  constructor() {
    super();
  }

  update(o) {
    try {
      var variable = o.split(":")[0];
      var value = JSON.parse(o.split(/:|\n/)[1]);
      this[variable] = value;
    } catch(e){}
    // signals.o.Time = state.evolution[0];
    // stream = state.evolution +  " " + state.simulation +  " " + state.controller;
    // data_stream.write(stream.replace(/,/g, " ") + "\n");
  }

  notify(variables) {
     for (var i=0; i<this.listeners.length; i++) {
       try {
         for (var j=0; j<variables.length; j++) {
           this.listeners[i].write(variables[j], ()=>{});
         }
       } catch(error) {
         console.log(`[WARNING] Cannot notify listener.`);
       }
     }
  }

  set config(value) {
    console.log('[DEBUG] set config');
    this._config = value;
    this.notify(['config:' + value]);
  }
  //
  // get config() {
  //   return this._config;
  // }
  //
  // set evolution(value) {
  //   this._evolution = value;
  //   this.notify('evolution:' + value);
  // }
  //
  // get evolution() {
  //   return this._evolution;
  // }
}

module.exports.Adapter = CAdapter;
module.exports.State = CState;
module.exports.DefaultConfig = config_default;
