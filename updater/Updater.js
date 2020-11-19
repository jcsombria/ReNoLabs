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

  upload_code(data, callback) {
    let username = data.username, language = data.language;
    let path = '';
    if (data.version && data.version === 'private') {
      path = this._get_user_folder(username, language);
    } else {
      path = this._get_default_folder(username, language);
    }
    logger.debug(path);
    this._prepare_dev_folder(username, language);
    this._copy_files(data.files, path);
    this._compile_code(path, callback);
  }

  _get_user_folder(username, language) {
    return `./${CONTROLLER_PATH}${language}/${CONTROLLER_USER_PATH}${username}/`;
  }

  _get_default_folder(language) {
    return `./${CONTROLLER_PATH}${language}/default/`;
  }

  _prepare_dev_folder(username, language) {
    let user_path = this._get_user_folder(username, language);
    try {
      var stats = fs.statSync(user_path);
    } catch (e) {
      logger.debug('Updater: Folder not found!');
      let default_path = this._get_default_folder(language);
      logger.debug(`Updater: Copying default controller ${default_path}->${user_path}`);
      var fileNames = fs.readdirSync(default_path);
      fs.mkdirSync(user_path, {recursive: true});
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
    this._prepare_dev_folder(data.username, data.language);
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

  _compile_code(user_path, callback) {
    /*
     * Ejecuta el controlador e inicia una comunicación síncrona.
     */
    var p = spawn('make', ['-C', user_path, '-f', 'Makefile', 'c_controller'], {shell:true});
    
    // Stores the compiler output & errors
    let compiler_stdout = '';
    p.stdout.setEncoding('utf8');
    p.stdout.on('data', function(data) {
      compiler_stdout += data;
    });
    
    let compiler_stderr = '';
    p.stderr.setEncoding('utf8');
    p.stderr.on('data', function(data) {
      compiler_stderr += data;
    });

    // En caso de fallo del controlador resetea las variables config y evolucion.
    p.on('exit', function(code, signal) {
      if (code == null) {
        logger.error(`Updater: Process ended due to signal: ${signal}`);
      } else {
        logger.error(`Process ended with code: ${code}`);
      }
      if (callback != null) {
        let result = {
          status: code,
          message: signal,
          stdout: compiler_stdout,
          stderr: compiler_stderr,
        };
        callback(result);
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