const LabConfig = require('../config/LabConfig');
const logger = require('winston').loggers.get('log');
const DateFormat = require('dateformat');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const SessionManager = require('../sessions').SessionManager;

const USERSDB_PATH = "db/";
const USERSDB_BACKUP_PATH = "db/backup/";
const USERSDB_FILE = "records.js";
const CONTROLLER_PATH = "controllers/";
const CONTROLLER_USER_PATH = "users/";
const CONFIG_PATH = "./config/";
const CONFIG_BACKUP_PATH = "config/backup/";
const VIEWS_PATH = "views/";
const PROFILES_PATH = "./profiles/";

const AdmZip = require('adm-zip');

class Updater {

  // @deprecated
  upload_view(data) {
    setView(data);
  }
  
  setView(data) {
    var fileName = 'view.zip';
    var source = PROFILES_PATH + VIEWS_PATH + fileName;
    var target = PROFILES_PATH + VIEWS_PATH + fileName + '.folder.tmp';
    var code_stream = fs.createWriteStream(source);
    code_stream.write(data, null, ()=>{
      const file = new AdmZip(source);
      file.extractAllTo(target);
    });
    code_stream.end();
  }

  getView() {
    try {
      var filename = VIEWS_PATH + LabConfig.GUI;
      var view = fs.readFileSync(filename);
      return view;
    } catch (e) {
      logger.debug('Updater: views folder not found!');
    }
  }

  // @deprecated
  upload_code(data, callback) {
    setController(data, callback);
  }

  setController(data, callback) {
    let username = data.username, language = data.language;
    let path = this._get_controller_path(data);
    this._prepare_dev_folder(username, language);
    this._copy_files(data.files, path);
    SessionManager.hardware.compile(path, callback);
  }

  _get_controller_path(data) {
    if (data.version && data.version === 'private') {
      return this._get_user_folder(data.username, data.language);
    } else {
      return this._get_default_folder(data.language);
    }
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
      try {
        logger.debug(`Updater: Copying default controller ${default_path}->${user_path}`);
        var fileNames = fs.readdirSync(default_path);
        fs.mkdirSync(user_path, {recursive: true});
        for (var i = 0; i < fileNames.length; i++) {
          var name = fileNames[i];
          var content = fs.readFileSync(default_path + name);
          var stats = fs.statSync(default_path + name);
          fs.writeFileSync(user_path + name, content, {mode: stats.mode});
        }
      } catch(e1) {
        logger.warn(`Updater: Missing default controller ${default_path}`);
        return false;
      }
    }
    return true;
  }

  /** Copy files to userpath */
  _copy_files(files, userpath, is_selectable) {
    logger.debug('Updater: Copying files!');
    for (var f in files) {
      var filename = files[f].filename;
      var content = files[f].code;
      logger.debug(`file: ${filename}`);
      if(!is_selectable || is_selectable(filename)) {
        var code_stream = fs.createWriteStream(userpath + filename);
        code_stream.write(content);
        code_stream.end();
      }
    }
  }

  /* Send a command to write the value of a variable in the C controller.
   * @param {object}   data a dictionary like object:
      {
        version: 'private' | 'default',
        username: <any valid user>,
        language: <any supported language> ('C' | 'Python' | ... ),
      }
   * @return the controller files if exist, otherwise undefined. 
   */
  getController(data) {
    let path = this._get_controller_path(data);
    let controllerExists = this._prepare_dev_folder(data.username, data.language);
    if (controllerExists) {
      return this._get_files(path);
    }
  }

  // @deprecated
  download_code(data) {
    return this.getController(data);
  }

  _get_files(path, is_selectable) {
    let defaultFilter = (()=>{ return true; });
    is_selectable = is_selectable || defaultFilter;
    var fileNames = fs.readdirSync(path);
    var files = [];
    for (var i = 0; i < fileNames.length; i++) {
      var name = fileNames[i];
      if(is_selectable(name)) {
        var fileInfo = {};
        fileInfo.filename = name;
        fileInfo.code = fs.readFileSync(path + name, {encoding: 'utf8'});
        files.push(fileInfo);
      }
    }
    return files;
  }

  _is_C_file(name) {
    return name.endsWith('.c') || name == "Makefile";
  }

  /** Update the users database and archives the old version. */
  updateUsers(users) {
    var src = USERSDB_PATH + USERSDB_FILE;
    this._archive(src, USERSDB_BACKUP_PATH);
    fs.writeFileSync(src, "module.exports = " + users + ";");
  }

  _archive(filename, backup_path) {
    try {
      fs.accessSync(backup_path);
    } catch (err) {
      logger.debug(`Creating folder: ${backup_path}.`);
      fs.mkdirSync(backup_path);
    }
    var date = DateFormat(new Date(), "_yyyymmdd_HHMMss");
    var backup = backup_path + path.basename(filename) + date;
    logger.info(`Saving ${path.basename(filename)} as ${path.basename(backup)}.`);
    fs.copyFileSync(filename, backup);
  }

  download_description() {
  }

  upload_description(description) {
    logger.debug(data.length);
    var fileName = LabConfig.GUI_JS;
    var code_stream = fs.createWriteStream(VIEWS_PATH + fileName);
    code_stream.write(data);
    code_stream.end();
  }

  getSignals() {
    return LabConfig;
  }

  /* Send a command to update the configuration.
   * @param {object}   data a dictionary-like object:
      {
        files: [{
          filename: <any valid filenam>,
          code: <text content>,
        }, {...}]
      }
   */
  setConfig(data) {
    var files = fs.readdirSync(CONFIG_PATH);
    for (var i = 0; i < files.length; i++) {
      if(this._is_js_file(files[i])) {
        var filename = CONFIG_PATH + files[i];
        this._archive(filename, CONFIG_BACKUP_PATH);
      }
    }
    this._copy_files(data.files, CONFIG_PATH);
  }

  getConfig() {
    return this._get_files(CONFIG_PATH, this._is_js_file);
  }

  _is_js_file(name) {
    return name.endsWith('.js');
  }
}

module.exports = new Updater();
