const Config = require('../config/AppConfig');
const logger = require('winston').loggers.get('log');
const DateFormat = require('dateformat');
const fs = require('fs');
const spawn = require('child_process').spawn;

const USERSDB_PATH = "db/";
const USERSDB_BACKUP_PATH = "db/backup/";
const USERSDB_FILE = "records.js";

class Updater {
  upload_view(data) {
    var fileName = Config.Lab.GUI_JS;
    var code_stream = fs.createWriteStream('./views/' + fileName);
    code_stream.write(data);
    code_stream.end();
  }

  upload_code(data) {
    var username = data.name;
    var lang = data.languaje; // Me duelen los ojos!!!
    this.prepare_dev_folder(lang, username);
    var folder = 'controllers/' + data.languaje;
    if (data.version && data.version === 'private') {
      folder = folder  + '/users/' + data.name + '/';
      username = data.name;
    } else {
      folder = folder  + '/default/';
    }
    for (var f in data.files) {
      if(f.endsWith('.c') | f == "Makefile") {
        var code_stream = fs.createWriteStream(folder + data.files[f].fileName);
        code_stream.write(data.files[f].code);
        code_stream.end();
      }
    }
    this.compile_code(data.languaje, username, null);
  }

  download_code(data) {
    var folder = 'controllers/' + data.languaje;
    if (data.version && data.version === 'private') {
      folder = folder  + '/users/' + data.name + '/';
    } else {
      folder = folder  + '/default/';
    }
    var fileNames = fs.readdirSync(folder);
    var files = [];
    for (var i = 0; i < fileNames.length; i++) {
      var name = fileNames[i];
      if (name.length - name.lastIndexOf(".c") == 2) {
        var fileInfo = {};
        fileInfo.fileName = name;
        fileInfo.code = fs.readFileSync(folder + name, {encoding: 'utf8'});
        files.push(fileInfo);
      }
    }
    return files;
  }

  prepare_dev_folder(lang, username) {
    try {
      var stats = fs.statSync('./controllers/'+ lang + '/users/' + username);
    } catch (e) {
      logger.debug('Updater: Folder not found!');
      var fromFolder = './controllers/' + lang + '/default/';
      logger.debug(`Updater: ${fromFolder}`);
      var toFolder = './controllers/' + lang + '/users/' + username + '/';
      logger.debug(`Updater: ${toFolder}`);
      var fileNames = fs.readdirSync(fromFolder);
      var files = [];
      fs.mkdirSync(toFolder, {recursive:true});
      for (var i = 0; i < fileNames.length; i++) {
        var name = fileNames[i];
        var content = fs.readFileSync(fromFolder + name);
        var stats = fs.statSync(fromFolder + name);
        fs.writeFileSync(toFolder + name, content, {mode: stats.mode});
      }
    }
  }

  compile_code(lang, user, socket) {
    /*
     * Ejecuta el controlador e inicia una comunicación síncrona.
     */
    var p;
    if (user == null) {
      p = spawn('make',['-C', './controllers/'+ lang + '/default', '-f', 'Makefile', 'c_controller']);
    }
    else {
      p = spawn('make',['-C', './controllers/'+ lang + '/users/' + user, '-f', 'Makefile', 'c_controller']);
    }

    /*
     * Recibe la información del compilador canalizandola al usuario.
     * Además guarda el estado en el servidor para escribir en el fichero
     * toda la información que necesita el cliente (señal + controller).
     */
    p.stdout.setEncoding('utf8');
    p.stdout.on('data', function(data) {
      logger.debug(`Updater: ${data}`);
    });

    /*
     * En caso de fallo del controlador resetea las variables config y evolucion.
     * Si hay algún usuario conectado en ese momento lo redirige a la página principal.
     */
    p.on('exit', function(code, string) {
      if (code == null) {
        logger.error('Updater: Process ended due to signal: '+string);
        if (socket != null) {
          socket.emit('Updater: compilation_result', { signal:string});
        }
      } else {
        logger.error('Process ended with code: ' + code);
        if (socket != null) {
          socket.emit('Updater: compilation_result', {code:code});
        }
      }
    });

    /*
     * En caso de error se escribe en la terminal o en su defecto en un
     * fichero de salida (output.log) si se ejecuta el servidor como:
     * nohup node app_....js > output.log &
     */
    p.stderr.setEncoding('utf8');
    p.stderr.on('data', function(data) {
      logger.error(`Updater: Error ${data}`);
      if (socket != null) {
        socket.emit('compilation_error', {error: data });
      }
    });
  }

  updateUsers(users) {
    var date = DateFormat(new Date(), "_yyyymmdd_HHMMss");
    var src = USERSDB_PATH + USERSDB_FILE;
    var dst = USERSDB_BACKUP_PATH + USERSDB_FILE + date;
    try {
      fs.accessSync(USERSDB_BACKUP_PATH);
      console.log('can read/write');
    } catch (err) {
      fs.mkdirSync(USERSDB_BACKUP_PATH);
      console.error('no access!');
    }
    fs.copyFileSync(src, dst);
    fs.writeFileSync(src, "module.exports = " + users + ";");
  }

  setView() {
  }

  getView() {
    try {
      var filename = './views/' + Config.Lab.GUI;
      var view = fs.readFileSync(filename);
      return view;
    } catch (e) {
      logger.debug('Updater: views folder not found!');
    }
  }

  getDescription() {
  }

  setDescription() {
  }

}

module.exports = Updater;
