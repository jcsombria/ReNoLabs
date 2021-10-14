const Config = require('../config/AppConfig');
const LabConfig = require('../config/LabConfig');
const logger = require('winston').loggers.get('log');
const DateFormat = require('dateformat');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const AdmZip = require('adm-zip');
const SessionManager = require('../sessions').SessionManager;
const models = require('../models');
const { User, Activity } = require('../models');
const { username } = require('../hardware/env');
const Settings = require('../settings');

const CONTROLLER_USER_PATH = "users/";

class Updater {

  FILTERS = {
    'C':
      name => { return name.endsWith('.c') || name == "Makefile"; },
    'Python':
      name => { return name.endsWith('.py'); },
    'Javascript':
      name => { name.endsWith('.js')},
  }
  
  setView(data) {
    let view = models.View.build({
      name: data.name,
      comment: data.comment
    })
    var extension = '.zip';
    var source = Settings.VIEWS + '/' + view.id + extension;
    var target = Settings.VIEWS_SERVE + '/' + view.id;
    let activity = data.activity;
    var code_stream = fs.createWriteStream(source);
    code_stream.write(data.view, null, async () => {
      const zip = new AdmZip(source);
      zip.extractAllTo(target);
      code_stream.end();
      // Read metadata
      try {
        var metadata = zip.getEntry('_metadata.txt');
        var data = metadata.getData();
        var lines = Buffer.from(data).toString();
        var main = lines.match(/main-simulation:\s(\S.*)\n/);
        var description = lines.match(/html-description:\s(\S.*)\n/);
        if (description) {
          view.description = description[1];
        }
        if (main) {
          view.path = main[1];
        }
      } catch(e) {
          logger.error('Cannot extract view from EJS file.');
      }
      try {
        await view.save();
        var a = await models.Activity.findOne({
          where: { name: activity }
        });
        a.ViewId = view.id;
        await a.save({ fields: ['ViewId'] });
      } catch(e) {
        logger.debug('Cannot add view to activity.')
      }
    });
  }

  getView() {
    // try {
    //   var filename = Settings.VIEWS + LabConfig.GUI;
    //   var view = fs.readFileSync(filename);
    //   return view;
    // } catch (e) {
    //   logger.debug('Updater: views folder not found!');
    // }
  }

  /* Update the controller.
   * @param {object}   data a dictionary like object:
      {
        version: 'private' | 'default',
        username: <any valid user>,
        language: <any supported language> ('C' | 'Python' | ... ),
      }
   * @return the controller files if exist, otherwise undefined. 
   */
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
    return `${Settings.CONTROLLERS}/${language}/${CONTROLLER_USER_PATH}${username}/`;
  }

  _get_default_folder(language) {
    return `${Settings.CONTROLLERS}/${language}/default/`;
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

  /* Retrieve a controller.
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
      return this._get_files(path, this.FILTERS[data.language]);
    }
  }

  _get_files(path, is_selectable) {
    let defaultFilter = (()=>{ return true; });
    var filter = is_selectable || defaultFilter;
    var fileNames = fs.readdirSync(path);
    var files = [];
    for (var i = 0; i < fileNames.length; i++) {
      var name = fileNames[i];
      if(filter(name)) {
        var fileInfo = {};
        fileInfo.filename = name;
        try {
          fileInfo.code = fs.readFileSync(path + '/' + name, {encoding: 'utf8'});
          files.push(fileInfo);
        } catch(e) {
          logger.debug(`Cannot read ${fileInfo.filename}`);
        }
      }
    }
    return files;
  }

  /** Update the users database.
   * @param {object}   data a dictionary-like object with users' data: { users: [ user1, ..., userN ] }
   */
  setUsers(users) {
    var userList = JSON.parse(users);
    userList.forEach(async u => {
      try {
        await User.create(u);
      } catch(error) {
        logger.log(error.message);
      }
    });
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

  getInfo() {
    return Config.Lab.info;
  }

  getSignals() {
    return LabConfig;
  }

  /* Update the configuration.
   * @param {object}   data a dictionary-like object:
      {
        files: [{
          filename: <any valid filenam>,
          code: <text content>,
        }, {...}]
      }
   */
  setConfig(data) {
    var files = fs.readdirSync(Settings.CONFIG);
    for (var i = 0; i < files.length; i++) {
      if(this.FILTERS['Javascript'](files[i])) {
        var filename = Settings.CONFIG + '/' + files[i];
        this._archive(filename, Settings.CONFIG + '/backup');
      }
    }
    this._copy_files(data.files, Settings.CONFIG);
  }

  getConfig() {
    return this._get_files(Settings.CONFIG, this._is_js_file);
  }
}

module.exports = new Updater();
