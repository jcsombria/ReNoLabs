const DateFormat = require('dateformat');
const AdmZip = require('adm-zip');
const logger = require('winston').loggers.get('log');
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');

const Config = require('../config/AppConfig');
const LabConfig = require('../config/LabConfig');
const { Controller, User, Activity, View, Course } = require('../models');
const Settings = require('../settings');
const { HardwarePool } = require('../sessions');

const CONTROLLER_USER_PATH = 'users/';

class InvalidActivityError extends Error {}
class InvalidControllerError extends Error {}
class InvalidViewError extends Error {}

class Updater {
  FILTERS = {
    C: (name) => {
      return (
        name.endsWith('.c') ||
        name == 'Makefile' ||
        name.endsWith('.txt') ||
        name.endsWith('.md')
      );
    },
    Python: (name) => {
      return (
        name.endsWith('.py') || name.endsWith('.txt') || name.endsWith('.md')
      );
    },
    Dobot: (name) => {
      return (
        name.endsWith('.py') || name.endsWith('.txt') || name.endsWith('.md')
      );
    },
    Javascript: (name) => {
      return (
        name.endsWith('.js') || name.endsWith('.txt') || name.endsWith('.md')
      );
    },
  };
  EXPLICIT = {
    'add controller': this.addController,
  };

  ACTIONS = {
    add: async (q) => {
      return this.add(q);
    },
    delete: async (q) => {
      return this.delete(q);
    },
    // 'set': async (q) => { return this.set(q); },
    get: async (q) => {
      return this.get(q);
    },
  };

  MODELS = {
    view: View,
    controller: Controller,
    activity: Activity,
    user: User,
    course: Course,
  };

  RESOURCES = {
    view: (where) => {
      return [
        `${Settings.VIEWS_SERVE}/${where.id}`,
        `${Settings.VIEWS}/${where.id}.zip`,
      ];
    },
    controller: (where) => {
      return [
        `${Settings.CONTROLLERS}/${where.id}`,
        `${Settings.CONTROLLERS}/${where.id}.zip`,
      ];
    },
    user: (where) => {
      return [];
    },
    activity: (where) => {
      return [];
    },
    course: (where) => {
      return [];
    },
  };

  /* Add a new activity.
   * @param {object}   data a dictionary like object:
      {
        name: <any valid user>,
        sessionTimeout: float,
        disconnectTimeout: float,
        view: <zip file content>,
        controller: <zip file content>,
        viewName: str,
        controllerName: str,
      }
   * @return the new activity.
   * @throws InvalidActivityError 
   */
  async addActivity(data) {
    try {
      var activity = {
        name: data.name,
        disconnectTimeout: data.disconnectTimeout || 10,
        sessionTimeout: data.sessionTimeout || 5,
        viewName: data.viewName,
        controllerName: data.controllerName,
      };
      if (data.view) {
        var view = await this.addView({ view: data.view });
        activity.ViewId = view.id;
        activity.viewName = view.name;
      }
      if (data.controller) {
        var controller = await this.addController({
          controller: data.controller,
        });
        activity.ControllerId = controller.id;
        activity.controllerName = controller.name;
      }
      if (!activity.viewName) {
        throw new InvalidActivityError('Invalid view');
      }
      if (!activity.controllerName) {
        throw new InvalidActivityError('Invalid controller');
      }
      return await Activity.create(activity);
    } catch (e) {
      throw new InvalidActivityError(e.message);
    }
  }

  /* Add a new view.
   * @param {object}   data a dictionary like object:
      {
        name: string,
        view: <zip file content>,
        comment: string,
      }
   * @return the new view.
   * @throws InvalidViewError 
   */
  async addView(data) {
    try {
      var bundle = new Bundle(data.view);
      var view = View.build({
        name: data.name || bundle.get('title'),
        comment: data.comment,
      });
      bundle.setName(`${Settings.VIEWS}/${view.id}.zip`);
      bundle.extractTo(`${Settings.VIEWS_SERVE}/${view.id}`);
      view.description = bundle.get('html-description');
      view.path = bundle.get('main-simulation');
      return await view.save();
    } catch (e) {
      logger.debug(`Cannot save view file: ${e.message}`);
      if (view) {
        fs.unlinkSync(`${Settings.VIEWS}/${view.id}.zip`);
        fs.rmdirSync(`${Settings.VIEWS_SERVE}/${view.id}`, { recursive: true });
      }
      throw new InvalidViewError(`Cannot save view file. Reason: ${e.message}`);
    }
  }

  /* Add a new controller.
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
    try {
      var bundle = new Bundle(data.controller);
      var controller = Controller.build({
        name: data.name || bundle.get('name'),
        type: data.language || bundle.get('type'),
        path: bundle.get('main-script'),
      });
      bundle.setName(`${Settings.CONTROLLERS}/${controller.id}.zip`);
      bundle.extractTo(`${Settings.CONTROLLERS}/${controller.id}`);
      controller.save();
      try {
        HardwarePool.getHardwareFor(controller)['adapter'].compile(
          data.callback
        );
      } catch (error) {
        logger.debug(error);
      }
      return controller;
    } catch (e) {
      console.log(e);
      logger.debug('Cannot save controller file.');
      if (controller) {
        fs.unlinkSync(`${Settings.CONTROLLERS}/${controller.id}.zip`);
        fs.rmdirSync(`${Settings.CONTROLLERS}/${controller.id}`, {
          recursive: true,
        });
      }
      throw new InvalidControllerError('Cannot save controller file.');
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
        logger.debug(
          `Updater: Copying default controller ${default_path}->${user_path}`
        );
        var fileNames = fs.readdirSync(default_path);
        fs.mkdirSync(user_path, { recursive: true });
        for (var i = 0; i < fileNames.length; i++) {
          var name = fileNames[i];
          var content = fs.readFileSync(default_path + name);
          var stats = fs.statSync(default_path + name);
          fs.writeFileSync(user_path + name, content, { mode: stats.mode });
        }
      } catch (e1) {
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
      if (!is_selectable || is_selectable(filename)) {
        var code_stream = fs.createWriteStream(`${userpath}/${filename}`);
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
  async getController(query) {
    try {
      var controller = await Controller.findOne({
        where: { name: query.name },
      });
      if (!query.format || query.format != 'zip') {
        return this._get_files(
          `${Settings.CONTROLLERS}/${controller.id}`,
          this.FILTERS[query.language]
        );
      }
      var filename = `${Settings.CONTROLLERS}/${controller.id}.zip`;
      return [
        {
          filename: filename,
          code: fs.readFileSync(filename, { encoding: 'utf8' }),
        },
      ];
    } catch (e) {
      logger.debug(e.message);
      throw new InvalidControllerError();
    }
  }

  _get_files(path, is_selectable) {
    let defaultFilter = [
      () => {
        return true;
      },
    ];
    var filter = is_selectable || defaultFilter;
    var fileNames = fs.readdirSync(path);
    var files = [];
    for (var i = 0; i < fileNames.length; i++) {
      var name = fileNames[i];
      if (filter(name)) {
        var fileInfo = {};
        fileInfo.filename = name;
        try {
          fileInfo.code = fs.readFileSync(`${path}/${name}`, {
            encoding: 'utf8',
          });
          files.push(fileInfo);
        } catch (e) {
          logger.debug(`Cannot read ${fileInfo.filename}`);
        }
      }
    }
    return files;
  }

  /* Retrieve a view.
   * @param {object}   data a dictionary like object:
      {
        name:,
        format: 'zip' (optional),
      }
   * @return the controller files if exist, otherwise undefined. 
   */
  async getView(query) {
    try {
      var view = await View.findOne({ where: { name: query.name } });
      if (!query.format || query.format != 'zip') {
        return this._get_files(
          `${Settings.VIEWS_SERVE}/${view.id}`,
          this.FILTERS[query.language]
        );
      }
      var filename = `${Settings.VIEWS}/${view.id}.zip`;
      return [
        {
          filename: filename,
          code: fs.readFileSync(filename, { encoding: 'utf8' }),
        },
      ];
    } catch (e) {
      throw new InvalidViewError();
    }
  }

  /** Update the users database.
   * @param {object}   users a dictionary-like object with users' data: { users: [ user1, ..., userN ] }
   */
  setUsers(users) {
    var userList = JSON.parse(users);
    userList.forEach(async (u) => {
      try {
        await User.create(u);
      } catch (error) {
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
    var date = DateFormat(new Date(), '_yyyymmdd_HHMMss');
    var backup = backup_path + path.basename(filename) + date;
    logger.info(
      `Saving ${path.basename(filename)} as ${path.basename(backup)}.`
    );
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
      if (this.FILTERS['Javascript'](files[i])) {
        var filename = `${Settings.CONFIG}'/'files[i]`;
        this._archive(filename, Settings.CONFIG + '/backup');
      }
    }
    this._copy_files(data.files, Settings.CONFIG);
  }

  getConfig() {
    return this._get_files(Settings.CONFIG, this.FILTERS['Javascript']);
  }

  // async deleteActivity(query) {
  //   try {
  //     await this._delete({
  //       'model': Activity,
  //       'where': { 'name': query.name },
  //       'resources': []
  //     });
  //   } catch(e) {
  //     throw new InvalidActivityError();
  //   }
  // }

  // async deleteController(query) {
  //   try {
  //     await this._delete({
  //       'model': Controller,
  //       'where': { 'id': query.id },
  //       'resources': [
  //         `${Settings.CONTROLLERS}/${query.id}`,
  //         `${Settings.CONTROLLERS}/${query.id}.zip`
  //       ]
  //     });
  //   } catch(e) {
  //     throw new InvalidControllerError();
  //   }
  // }

  // async deleteView(query) {
  //   try {
  //     await this._delete({
  //       'model': View,
  //       'where': { 'id': query.id },
  //       'resources': [
  //         `${Settings.VIEWS_SERVE}/${query.id}`,
  //         `${Settings.VIEWS}/${query.id}.zip`
  //       ]
  //     })
  //   } catch(e) {
  //     throw new InvalidViewError();
  //   }
  // }

  // async _delete(query) {
  //   var element = await query['model'].findOne({ where: query.where });
  //   query['resources'].forEach(r => {
  //     fs.rmdirSync(r, { recursive: true });
  //   })
  //   element.destroy();
  // }

  async query(q) {
    var action = `${q.action} ${q.model}`;
    if (action in this.EXPLICIT) {
      return this.EXPLICIT[action](q['data']);
    }
    return this.ACTIONS[q.action](q);
  }

  /* Add a new object.
   * @param {object}   query a dictionary-like object:
      {
        model: <any valid object model>,
        data: {...}
      }
  */
  async add(query) {
    return await this.MODELS[query['model']].create(query['data']);
  }

  async get(query) {
    const preprocess = {
      where: (v) => v,
      include: (v) => v.map((o) => this.MODELS[o]),
    };
    const validKeys = Object.keys(preprocess);
    let q = {};
    Object.keys(query)
      .filter((k) => validKeys.includes(k))
      .map((k) => {
        q[k] = preprocess[k](query[k]);
      });
    return validKeys.some((k) => k in q)
      ? this.MODELS[query.model].findAll(q)
      : this.MODELS[query.model].findAll();
  }

  async delete(query) {
    var element = await this.MODELS[query.model].findOne({
      where: query.where,
    });
    this.RESOURCES[query.model](query.where).forEach((r) => {
      fs.rmdirSync(r, { recursive: true });
    });
    element.destroy();
  }
}

class Bundle {
  constructor(content) {
    this.save(content);
  }

  save(content) {
    const tmpfile = tmp.fileSync({ tmpdir: `${Settings.CONTROLLERS}/` });
    var regex = /^data:.+\/(.+);base64,(.*)$/;
    var matches = content.match(regex);
    var contentToWrite =
      matches != null ? Buffer.from(matches[2], 'base64') : content;
    fs.writeFileSync(tmpfile.name, contentToWrite);
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
    lines.forEach((l) => {
      try {
        var pair = l.match(/([^:]*):\s(\S.*)/);
        result[pair[1]] = pair[2];
      } catch (e) {
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
