const AdmZip = require('adm-zip');
const fs = require('fs');
const logger = require('winston').loggers.get('log');
const { where, include } = require('sequelize');

const db = require('./db');
const { Updater } = require('./updater');
const { SessionManager } = require('./sessions');
const Config = require('./config/AppConfig');
const LabConfig = require('./config/LabConfig');
const models = require('./models');
const Settings = require('./settings');

const MODELS = {
  'activities': models.Activity,
  'views': models.View,
  'controllers': models.Controller,
  'users': models.User,
};

module.exports = {
  index: function (req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/home');
    } else {
      let context = {
        lab_title: Config.Lab['info']['name'],
        message: req.flash('error'),
      };
      res.render('login', context);
    }
  },

  home: async function(req, res) {
    try {
      var user = await db.users.getUser(req.user.username);
      var activities = await models.Activity.findAll();
      res.render('home', {
        user: user,
        activities: activities
      });
    } catch(e) {
      logger.debug('Invalid Activity');
      res.send('Activity not correctly configured.');
    }
  },

  menu: async function(req, res) {
    try {
      var user = await db.users.getUser(req.user.username);
      var activities = await models.Activity.findAll();
      res.render('ui/menu', {user: user, activities: activities});
    } catch(e) {
      logger.debug('Invalid Activity');
      res.send('Activity not correctly configured.');
    }
  },

  activity: async function(req, res) {
    try {
      var user = await db.users.getUser(req.user.username);
      var activities = await models.Activity.findAll();
      res.render('activity', {
        user: user,
        activities: activities,
        activity: req.query.name
      });
    } catch(e) {
      logger.debug('Invalid Activity');
    }
  },

  help: async function(req, res) {
    try {
      var user = await db.users.getUser(req.user.username);
      var activity = await models.Activity.findOne({
        where: { name: req.query.name },
        include: models.View
      });
      var view = await getView(activity);
      res.render('help', {
        user: user,
        view: `${view.id}/${view.description}`
      });
    } catch(e) {
      logger.debug('Invalid Activity');
      res.send('Activity not correctly configured.');
    }
  },

  // Read current user's files
  data: async function(req, res) {
    var files = fs.readdirSync(Settings.DATA)
      .filter(e => { if (e.split('_')[0] == req.user.username) { return e; } })
      .sort((a, b) => { return fs.statSync(`${Settings.DATA}/b`).mtime.getTime() - fs.statSync(Settings.DATA + '/' + a).mtime.getTime(); });
    let f = [];
    for (i = 0; i < files.length; i++) {
      var name = `${Settings.DATA}/${files[i]}`;
      var stats = fs.statSync(name);
      f.push({
        'name': name,
        'date': stats.atime,
        'size': stats.size
      });
    }
    var user = await db.users.getUser(req.user.username);
    res.render('table/experiments', { user: user, files: f });
  },
  
  experience: async function(req, res) {
    try {
      var user = await db.users.getUser(req.user.username);
      var activity = await models.Activity.findOne({
        where: {name: req.query.name},
        include: [models.View, models.Controller]
      });
      var view = await getView(activity);
      var credentials = { 'username': req.user.username, 'password': req.user.password};
      SessionManager.connect(activity.name, credentials, res.socket, null)
        .then(session => {
          if(!session) {
            return res.render('home', {user: user});
          }
          return res.render('remote_lab.ejs', {
            user: user,
            key: session.token,
            ip: Config.WebServer.ip,
            port: Config.WebServer.port,
            view: `${view.id}/${view.path}`,
            activity: activity.name
          });
        }).catch(e => {
          logger.debug(e.message);
          return res.status(500).send('Can\'t load activity');
        });
    } catch(e) {
      logger.debug('Invalid activity');
      res.send('Activity is not correctly configured.');
      return;
    }
  },

  download: function(req, res) {
    res.download('./data/' + req.params[0]);
  },
  
  logout: function(req, res) {
    req.logOut();
    res.redirect('/');
  },
}

module.exports.admin = {
  home: async function(req, res) {
    try {
      var user = await db.users.getUser(req.user.username);
      var activities = await models.Activity.findAll();
      res.render('admin/home', {
        user: user,
        activities: activities
      });
    } catch(e) {
      logger.debug('Invalid Activity');
      res.send('Activity not correctly configured.');
    }
  },

  getTable: async function(req, res) {
    const table = req.params.table;
    const QUERY = {
      'activities': {
        include: [models.View, models.Controller],
        order: [[ 'createdAt', 'DESC' ]]
      },
      'views': {
        order: [[ 'createdAt', 'DESC' ]]       
      },
      'controllers': {
        order: [[ 'createdAt', 'DESC' ]]
      },
      'users': {
        order: [[ 'createdAt', 'DESC' ]]
      },
    };
    try {
      const result = (req.method == 'POST') ? req.body.data : await MODELS[table].findAll(QUERY[table]);
      res.render('admin/table/' + table, {result: result});
    } catch(error) {
      res.status(400).send(error);
    }
  },

  getActivity: async function(req, res) {
    try {
      var activity = await models.Activity.findOne({
        where: { name: req.query.name },
        include: [models.View, models.Controller]
      });
      var users = activity.getUsers();
      if (users != undefined) { users = []; }
      const allUsers = await models.User.findAll();
      res.render('admin/edit/activity', {
        activity: activity,
        users: users,
        allUsers: allUsers,
      });
    } catch(error) {
      res.status(400).send(error);
    }
  },

  query: function (req, res) {
    var q = {
      'action': req.params.action,
      'model': req.params.model,
    };
    if (req.body.where) { q['where'] = req.body.where; }
    Updater.query(q)
      .then(result => { res.send(result); })
      .catch(error => { res.status(400).send(error); });
  },

  views: {
    get: function(req, res) {
      logger.info('Sending view...With great power comes great responsibility!');
      const v = models.View.findAll().then((result) => {
        res.render('admin/table/views', {result: result});
      }).catch((error) => {
        res.status(400).send(error);
      });
    },

    set: function(req, res) {
      logger.info('Uploading view...With great power comes great responsibility!');
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }
      Updater.addView({
        name: req.body.name,
        comment: req.body.comment,
        view: req.files.view.data
      });
      res.redirect('/admin');
    },
  },

  controller: {
    set: function(req, res) {
      logger.info('Uploading controller...With great power comes great responsibility!');
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }
      Updater.addController({
        name: req.body.name,
        comment: req.body.comment,
        controller: req.files.controller.data
      });
      res.redirect('/admin');
    }
  },

  activity: {
    add: function(req, res) {
      logger.info('Uploading activity...With great power comes great responsibility!');
      if(!req.body.name) {
        return res.status(400).send('Invalid name');
      }
      if(req.files && !req.files.controller && !req.body.controllerName) {
        return res.status(400).send('Invalid controller');
      }
      if(req.files && !req.files.view && !req.body.viewName) {
        return res.status(400).send('Invalid view');
      }
      var activity = {
        name: req.body.name,
        viewName: req.body.viewName,
        controllerName: req.body.controllerName,
      };
      if(req.files && req.files.view) {
        activity['view'] = req.files.view.data;
      }
      if(req.files && req.files.controller) {
        activity['controller'] = req.files.controller.data;
      }
      Updater.addActivity(activity)
        .then(()=>{
          return res.redirect('/admin');
        })
        .catch(e => {
          logger.debug(e.message);
          return res.status(500).send(e.message);
        });

    }
  }
};

module.exports.api = {
  info: {
    get: function(req, res) {
      logger.info('Sending Lab Info.');
      var response;
      try { 
        result = Updater.getInfo();
        response = {status: 'OK', 'data': result};
      } catch(e) {
        response = {status: 'ERROR', 'data': { reason: 'Server Error' }};
      } 
      res.send(response);
    }
  },

  config: {
    get: function(req, res) {
      logger.info('Sending config...With great power comes great responsibility!');
      var response;
      try { 
        result = Updater.getConfig();
        response = { status: 'OK', 'data': result};
      } catch(e) {
        response = { status: 'ERROR', 'data': { message: 'Server Error' }};
      }
      res.send(response);
    },
    set: function(req, res) {
      logger.info('Updating config...With great power comes great responsibility!');
      let data = req.body;
      Updater.setConfig(data);
      res.send({ status: 'OK', data: {DefaultConfig: Config}});
    },
  },

  users: {
    get: async function(req, res) {
      logger.info('Sending list of users...With great power comes great responsibility!');
      let users = await db.users.getUsers();
      res.send(users);
    },
    set: function(req, res) {
      let data = JSON.stringify(req.body);
      Updater.setUsers(data);
      logger.info('Updating list of users...With great power comes great responsibility!');
      res.send(data);
    },
  },

  view: {
    set: function(req, res) {
      var data = {
        name: req.body.name,
        comment: req.body.comment,
        view: Buffer.from(req.body.view, 'base64'),
        activity: req.body.activity,
      };
      Updater.addView(data)
        .then(v => {
          res.send({ status: "OK", data: {}});
        })
        .catch(e => {
          res.send({ status: "ERROR", data: {}});
        })
    }
  },

  controller: {
    get: async function(req, res) {
      logger.info('Maintenance - Sending code...');
      let data = { 
        username: req.user.username,
        name: req.body.name, 
        language: req.query.language || 'C',
        version: req.query.version || 'default',
      }
      var files = await Updater.getController(data);
      if (files) {
        logger.info('Maintenance - Code transferred.');
        response = {status: 'OK', data: files};
      } else {
        logger.info('Maintenance - Code not transferred.');
        response = {status: 'ERROR', data: 'Missing controller'};
      }
      res.json(response);
    },

    set: function(req, res) {
      logger.info('Maintenance - Receiving code...');
      var zip = new AdmZip();
      req.body.files.forEach(f => {
        zip.addFile(f.filename, Buffer.from(f.code, "utf8"));
      });
      Updater.addController({
        name: req.body.name,
        controller: zip.toBuffer(),
        callback: result => {
          var response;
          try { 
            logger.info('Maintenance - Controller updated.');
            response = {
              status: 'OK',
              data: {
                output: result.stdout,
                error: result.stderr
              }
            };
          } catch(e) {
            logger.info('Maintenance - Controller updated with errors.');
            response = {
              status: 'ERROR',
              data: 'Server Error'
            };
          } 
          res.send(response);
        }
      });
    }
  },

};


module.exports.test = {
  peggy: function(req, res) {
    res.render('test_peggy.ejs');
  },

  serve: function(req, res) {
    res.render(`tests/${req.params.page}.ejs`);
  },

  vue: function(req, res) {
    res.render(`tests/vue.ejs`, { 'model': LabConfig.model, 'viewmodel': LabConfig.view });
  }
}


function getView(activity) {
  if(activity.View) { return activity.View; }
  return models.View.findOne({
    where: { name: activity.viewName },
    order: [[ 'createdAt', 'DESC' ]]
  });
}