const DateFormat = require('dateformat');
const AdmZip = require('adm-zip');
const logger = require('winston').loggers.get('log');
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');

const Config = require('../config/AppConfig');
const LabConfig = require('../config/LabConfig');
const { Controller, User, Activity, View } = require('../models');
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
  
  async addActivity(data) {
    var view = await this.addView({view: data.view});
    var controller = await this.addController({controller: data.controller});
    return await Activity.create({
      name: data.name,
      disconnectTimeout: 10,
      sessionTimeout: 5,
      ViewId: view.id,
      ControllerId: controller.id
    });
  }

  async addView(data) {
    try {
      var bundle = new Bundle(data.view);
      var view = View.build({
        name: data.name || bundle.get('title'),
        comment: data.comment
      });
      bundle.setName(Settings.VIEWS + '/' + view.id + '.zip');
      bundle.extractTo(Settings.VIEWS_SERVE + '/' + view.id);
      view.description = bundle.get('html-description');
      view.path = bundle.get('main-simulation');
      await view.save();
      // try {
      //   var activity = await Activity.findOne({where: {name: data.name}});
      //   activity.ViewId = view.id;
      //   await activity.save({ fields: ['ViewId'] });
      // } catch(e) {
      //   logger.debug('Activity not defined.');
      // }
      return view;
    } catch(e) {
      logger.debug('Cannot save view file.');
    }
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
        controller: <zip file content>,
        files: <JSON encoded - controller files>
      }
   * @return the controller files if exist, otherwise undefined. 
   */
  async addController(data) {
    let type = data.language,
        name = data.name;
    // if(data.controller) {-
    //   let path = this._get_controller_path(data);
    //   this._prepare_dev_folder(username, type);
    //   this._copy_files(data.files, path);
    //   SessionManager.hardware.compile(path, callback);
    //   return;
    // }
    try {
      var bundle = new Bundle(data.controller);
      var controller = Controller.build({
        name: bundle.get('name') || name, 
        type: bundle.get('type') || type,
        path: bundle.get('main-script')
      });
      bundle.setName(`${Settings.CONTROLLERS}/${controller.id}.zip`);
      bundle.extractTo(`${Settings.CONTROLLERS}/${controller.id}`);
      return await controller.save();
    } catch(e) {
      logger.debug('Cannot save controller file.');
    }
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
        fs.mkdirSync(user_path, { recursive: true });
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

class Bundle {

  constructor(content) {
    this.save(content);
  }

  save(content) {
    const tmpfile = tmp.fileSync({ 'tmpdir': Settings.CONTROLLERS + '/' });
    fs.writeFileSync(tmpfile.name, content);
    this.name = tmpfile.name;
    this.metadata = this._getMetadata();
  }

  setName(name) {
    fs.renameSync(this.name, name);
    this.name = name;
  }

  _getMetadata() {
    const zipfile = new AdmZip(this.name);
    var metadata = zipfile.getEntry('_metadata.txt');
    var data = metadata.getData();
    var content = Buffer.from(data).toString();
    const lines = content.split(/\r?\n/);
    var result = {};
    lines.forEach(l => {
      try {
        var pair = l.match(/([^:]*):\s(\S.*)/);
        result[pair[1]] = pair[2];
      } catch(e) {
        // logger.warn("Can't parse metadata pair.");
      }
    });
    return result;
  }

  get(key) {
    return this.metadata[key];
  }
  
  extractTo(target) {
    const zip = new AdmZip(this.name);
    zip.extractAllTo(target);
  }

}

module.exports = new Updater();
