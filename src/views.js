const db = require('./db');
const SessionManager = require('./sessions').SessionManager;
const logger = require('winston').loggers.get('log');
const Config = require('./config/AppConfig');
const LabConfig = require('./config/LabConfig');
const { Updater } = require('./updater');
const models = require('./models');
const fs = require('fs');
const { where, include } = require('sequelize');
const Settings = require('./settings');

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
    } catch(e) {
      logger.debug('Invalid Activity');
      res.send('Activity not correctly configured.');
    }
    res.render('home', {
      user: user,
      activities: activities
    });
  },

  menu: async function(req, res) {
    var user = await db.users.getUser(req.user.username);
    try {
      var activities = await models.Activity.findAll();
    } catch(e) {
      logger.debug('Invalid Activity');
      res.send('Activity not correctly configured.');
    }
    res.render('ui/menu', {user: user, activities: activities});
  },

  activity: async function(req, res) {
    try {
      var user = await db.users.getUser(req.user.username);
      var activities = await models.Activity.findAll();
    } catch(e) {
      logger.debug('Invalid Activity');
    }
    res.render('activity', {
      user: user,
      activities: activities,
      activity: req.query.name
    });
  },
  
  help: async function(req, res) {
    try {
      var user = await db.users.getUser(req.user.username);
      var activity = await models.Activity.findOne({
        where: { name: req.query.name },
        include: models.View
      });
      var view = activity.View;
    } catch(e) {
      logger.debug('Invalid Activity');
      res.send('Activity not correctly configured.');
    }
    res.render('help', {
      user: user,
      view: view.id + '/' + view.description
    });
  },

  data: async function(req, res) {
    // Read current user's files
    var files = fs.readdirSync(Settings.DATA)
      .filter(e => { if (e.split('_')[0] == req.user.username) { return e; } })
      .sort((a, b) => { return fs.statSync(Settings.DATA + '/' + b).mtime.getTime() - fs.statSync(Settings.DATA + '/' + a).mtime.getTime(); });
    let f = [];
    for (i = 0; i < files.length; i++) {
      var name = Settings.DATA + '/' + files[i];
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
    var credentials = { 'username': req.user.username, 'password': req.user.password };
    // if(SessionManager.idle) {
    //     logger.debug(`User ${req.user.username} starts session.`);
    //     SessionManager.start(credentials);
    // }
    try {
      var user = await db.users.getUser(req.user.username);
      var activity = (await models.Activity.findOne({
        where: { name: "Sistemas Lineales: 1" }
      }));
    } catch(e) {
      logger.debug('Invalid activity');
      res.send('Activity is not correctly configured.');
    }
    SessionManager.connect(null, res.socket, credentials, activity);
    try {
      var token = SessionManager.getToken(credentials);
      session['token'] = token;
    } catch(e) {
      session = { token:token };
    }
    if(token) {
      // models.View.findAll({
      //   where: {
      //     id: activity.ViewId
      //   }
      // }).then(v => {
      //   res.render('remote_lab.ejs', {
      //     user: user,
      //     key: token,
      //     ip: Config.WebServer.ip,
      //     port: Config.WebServer.port,
      //     view: v[0].id + '/' + v[0].path,
      //     state: false
      //   });
      // }).catch(error => {
      //   res.send('View is not configured');      
      // });
      try {
        var v = models.View.findAll({
          where: { id: activity.ViewId }
        });
        res.render('remote_lab.ejs', {
          user: user,
          key: token,
          ip: Config.WebServer.ip,
          port: Config.WebServer.port,
          view: v[0].id + '/' + v[0].path,
          state: false
        });
      } catch(e) {
        res.send('View is not configured');
      }
    } else {
      res.render('home', {
        user: user,
        state: true
      });
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
    } catch(e) {
      logger.debug('Invalid Activity');
      res.send('Activity not correctly configured.');
    }
    var data = {
      version: 'private' | 'default',
      username: user.username,
      language: 'C',
    };
    let users = await db.users.getUsers();
    res.render('admin/home', {
      user: user,
      config: Updater.getConfig(),
      controller: Updater.getController(data),
      users: users, 
      activities: activities
    });
  },

  getTable: async function(req, res) {
    const table = req.params.table;
    const MODELS = {
      'activities': models.Activity,
      'views': models.View,
      'controllers': models.Controller,
      'users': models.User,
    }
    try {
      const resource = MODELS[table];
      const result = (req.method == 'POST') ? req.body.data : await resource.findAll();
      res.render('admin/table/' + table, {result: result});
    } catch(error) {
      res.status(400).send(error);
    }
  },

  views: {
    get: function(req, res) {
      logger.info('Sending view...A great power comes with a great responsibility!');
      const v = models.View.findAll().then((result) => {
        res.render('admin/table/views', {result: result});
      }).catch((error) => {
        res.status(400).send(error);
      });
    },
    
    set: function(req, res) {
      logger.info('Uploading view...A great power comes with a great responsibility!');
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }
      data = {
        name: req.body.name,
        comment: req.body.comment,
        view: req.files.view.data
      }
      Updater.setView(data);
      res.redirect('/admin');
    },
    
    // edit: function(req, res) {
    //   var user = db.users.getUser(req.user.username);
    //   res.render('admin/views', {user: user})
    // }
  },

  // edit: function(req, res) {
  //   res.render('admin/controller', { user: db.users.getUser('admin') });
  // },

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
      logger.info('Sending config...A great power comes with a great responsibility!');
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
      logger.info('Updating config...A great power comes with a great responsibility!');
      let data = req.body;
      Updater.setConfig(data);
      res.send({ status: 'OK', data: {DefaultConfig: Config}});
    },
  },

  users: {
    get: async function(req, res) {
      logger.info('Sending list of users...A great power comes with a great responsibility!');
      let users = await db.users.getUsers();
      res.send(users);
    },
    set: function(req, res) {
      let data = JSON.stringify(req.body);
      Updater.setUsers(data);
      logger.info('Updating list of users...A great power comes with a great responsibility!');
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
      Updater.setView(data);
      res.send({ status: "OK", data: {}});
    }
  },

  controller: {
    get: function(req, res) {
      logger.info('Maintenance - Sending code...');
      let data = { 
        username: req.user.username,
        language: req.query.language || 'C',
        version: req.query.version || 'default',
      }
      var files = Updater.getController(data);
      if (files) {
        logger.info('Maintenance - Code transferred.');
        response = {status: 'ok', data: files};
      } else {
        logger.info('Maintenance - Code not transferred.');
        response = {status: 'error', data: 'Missing controller'};
      }
      res.json(response);
    },

    // data = { 
    //     username: req.user.username,
    //     language: req.query.language || 'C',
    //     version: req.query.version || 'default',
    // }
    set: function(req, res) {
      logger.info('Maintenance - Receiving code...');
      data = req.body;
      Updater.setController(data, result => {
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