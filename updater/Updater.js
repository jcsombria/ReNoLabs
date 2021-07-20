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
const VIEWS_PATH = "./views/";

const AdmZip = require('adm-zip');


class Updater {
  upload_view(data) {
    logger.debug(data.length);
    var fileName = LabConfig.GUI_JS;
    var code_stream = fs.createWriteStream(VIEWS_PATH + fileName + '.tmp');
    code_stream.write(data);
    code_stream.end();

    
    var source = VIEWS_PATH + fileName + '.tmp';
    var target = VIEWS_PATH + fileName + '.folder.tmp';
    const file = new AdmZip(source);
    file.extractAllTo(target);
  }

  upload_code(data, callback) {
    let username = data.username, language = data.language;
    let path = '';
    if (data.version && data.version === 'private') {
      path = this._get_user_folder(username, language);
    } else {
      path = this._get_default_folder(username, language);
    }
    this._prepare_dev_folder(username, language);
    this._copy_files(data.files, path);
    SessionManager.hardware.compile(path, callback);
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
        fs.writeFileSync(user_path + name, content, {mode: stats.mode});
      }
    }
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

  /** Return the controller code files */
  download_code(data) {
    let path = '';
    if (data.version && data.version === 'private') {
      path = this._get_user_folder(data.username, data.language);
    } else {
      path = this._get_default_folder(data.username, data.language);
    }
    this._prepare_dev_folder(data.username, data.language);
    return this._get_files(path, this._is_C_file);
    // var fileNames = fs.readdirSync(path);
    // var files = [];
    // for (var i = 0; i < fileNames.length; i++) {
    //   var name = fileNames[i];
    //   if(this._is_selectable(name)) {
    //     var fileInfo = {};
    //     fileInfo.filename = name;
    //     fileInfo.code = fs.readFileSync(path + name, {encoding: 'utf8'});
    //     files.push(fileInfo);
    //   }
    // }
    return files;
  }

  _is_C_file(name) {
    return name.endsWith('.c') || name == "Makefile";
  }

  /** Update the users database and archives the old version. */
  updateUsers(users) {
    var src = USERSDB_PATH + USERSDB_FILE;
    //var dst = USERSDB_BACKUP_PATH + USERSDB_FILE + date;
    this._archive(src, USERSDB_BACKUP_PATH);
    // try {
    //   fs.accessSync(USERSDB_BACKUP_PATH);
    //   console.log('can read/write');
    // } catch (err) {
    //   fs.mkdirSync(USERSDB_BACKUP_PATH);
    //   console.error('no access!');
    // }
    // fs.copyFileSync(src, dst);
    fs.writeFileSync(src, "module.exports = " + users + ";");
  }

  _get_files(path, is_selectable) {
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

  setView() {
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
