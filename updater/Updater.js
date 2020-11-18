const LabConfig = require('../config/LabConfig');
const Config = require('../config/AppConfig');
const logger = require('winston').loggers.get('log');
const DateFormat = require('dateformat');
const fs = require('fs');
const { ensureLoggedIn } = require('connect-ensure-login');
const spawn = require('child_process').spawn;

const USERSDB_PATH = "db/";
const USERSDB_BACKUP_PATH = "db/backup/";
const USERSDB_FILE = "records.js";

const CONTROLLER_PATH = "controllers/";
const CONTROLLER_USER_PATH = "user/";

class Updater {
  upload_view(data) {
    var fileName = Config.Lab.GUI_JS;
    var code_stream = fs.createWriteStream('./views/' + fileName);
    code_stream.write(data);
    code_stream.end();
  }

  upload_code(data) {
    let path = '';
    if (data.version && data.version === 'private') {
      path = this._get_user_folder(data.username, data.language);
    } else {
      path = this._get_default_folder(data.username, data.language);
    }
    logger.debug(path);
    this._prepare_dev_folder(path);
    this._copy_files(data.files, path);
    this._compile_code(path);
  }

  _get_user_folder(username, language) {
    return `./${CONTROLLER_PATH}${language}/${CONTROLLER_USER_PATH}${username}/`;
  }

  _get_default_folder(language) {
    return `./${CONTROLLER_PATH}${language}/default/`;
  }

  _prepare_dev_folder(user_path) {
    try {
      var stats = fs.statSync(user_path);
    } catch (e) {
      logger.debug('Updater: Folder not found!');
      logger.debug(`Updater: Copying default controller ${default_path}->${user_path}`);
      let default_path = this._get_default_folder(language);
      var fileNames = fs.readdirSync(default_path);
      fs.mkdirSync(user_path,  {recursive: true});
      for (var i = 0; i < fileNames.length; i++) {
        var name = fileNames[i];
        var content = fs.readFileSync(default_path + name);
        var stats = fs.statSync(default_path + name);
        logger.debug(name);
        fs.writeFileSync(user_path + name, content, {mode: stats.mode});
      }    
    }    
  }    
  
  _copy_files(files, user_path) {
    logger.debug('Updater: Copying files!');
    for (var f in files) {
      var filename = files[f].filename;
      var content = files[f].code;
      logger.debug(`\tfile: ${filename}`);
      if(this._is_selectable(filename)) {
        var code_stream = fs.createWriteStream(user_path + filename);
        code_stream.write(content);
        code_stream.end();
      }
    }  
  }  
  
  download_code(data) {
    let path = '';
    if (data.version && data.version === 'private') {
      path = this._get_user_folder(data.username, data.language);
    } else {
      path = this._get_default_folder(data.username, data.language);
    }
    var fileNames = fs.readdirSync(path);
    var files = [];
    for (var i = 0; i < fileNames.length; i++) {
      var name = fileNames[i];
      if(this._is_selectable(name)) {
        var fileInfo = {};
        fileInfo.filename = name;
        fileInfo.code = fs.readFileSync(path + name, {encoding: 'utf8'});
        logger.debug(name);
        files.push(fileInfo);
      }
    }
    return files;
  }

  _is_selectable(filename) {
    return filename.endsWith('.c') || filename == "Makefile";
  }

  _compile_code(user_path, socket) {
    /*
     * Ejecuta el controlador e inicia una comunicación síncrona.
     */
    var p;
    p = spawn('make', ['-C', user_path, '-f', 'Makefile', 'c_controller']);
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
        logger.error(`Updater: Process ended due to signal: ${string}`);
        let result = {code:code};
      } else {
        logger.error(`Process ended with code: ${code}`);
        let result = {string:string};
      }

      if (socket != null) {
        socket.emit('Updater: compilation_result', result);
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

  getSignals() {
    return LabConfig;
  }
}

module.exports = new Updater();