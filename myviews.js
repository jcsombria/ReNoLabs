const db = require('./db');
const SessionManager = require('./sessions').SessionManager;
const logger = require('winston').loggers.get('log');
const Config = require('./config/AppConfig');
const { Updater } = require('./updater');
const models = require('./models');
const fs = require('fs');
const { where } = require('sequelize');

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
    var user = await db.users.getUser(req.user.username);
    res.render('home', {user: user, state: false});
  },
  
  help: async function(req, res) {
    var user = await db.users.getUser(req.user.username);
    res.render('help', {
      user: user,
      view: './Sistemas Lineales/Unnamed_Intro.xhtml'
    });
  },

  data: async function(req, res) {
    // Read current user's files
    var files = {name: 0, date: [], size: []};
    var dir = './data/';
    files.name = fs.readdirSync(dir)
      .filter((e) => { if (e.split('_')[0] == req.user.username) { return e; } })
      .sort((a, b) => { return fs.statSync(dir + b).mtime.getTime() - fs.statSync(dir + a).mtime.getTime(); });
    let f = [];
    for (i = 0; i < files.name.length; i++) {
      var name = './data/' + files.name[i];
      var stats = fs.statSync(name);
      files.date[i] = stats.atime;
      files.size[i] = stats.size;
      f.push({
        'name': files.name[i],
        'date': stats.atime,
        'size': stats.size
      });
    }
    var user = await db.users.getUser(req.user.username);
    res.render('experiments', {
      user: user,
      names: files.name,
      dates: files.date,
      sizes: files.size,
      files: f,
    });
  },
  
  experience: async function(req, res) {
    var credentials = { 'username': req.user.username, 'password': req.user.password };
    // if(SessionManager.idle) {
    //     logger.debug(`User ${req.user.username} starts session.`);
    //     SessionManager.start(credentials);
    // }
    SessionManager.connect('http', res.socket, credentials);
    try {
      var token = SessionManager.getToken(credentials);
      session['token'] = token;
    } catch(e) {
      session = { token:token };
    }
    var user = await db.users.getUser(req.user.username);
    if(token) {
      models.View.findAll({
        where: {
          id: Config.Lab.view
        }
      }).then(v => {
        res.render('remote_lab.ejs', {
          user: user,
          key: token,
          ip: Config.WebServer.ip,
          port: Config.WebServer.port,
          view: v[0].dataValues.id + '/' + v[0].dataValues.path,
        });
      }).catch(error => {
        res.send('View is not configured');      
      });
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
 
  admin: {
    home: async function(req, res) {
      var user = await db.users.getUser(req.user.username);
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
        // db.users.reload();
        res.send(data);
      },
    },

    config: {
      get: function(req, res) {
        logger.info('Sending config...A great power comes with a great responsibility!');
        res.send(Updater.getConfig());
      },
      set: function(req, res) {
        logger.info('Updating config...A great power comes with a great responsibility!');
        let data = req.body;
        Updater.setConfig(data);
        res.send({'DefaultConfig': Config});
      },
      edit: function(req, res) {
        logger.info('Editing config...A great power comes with a great responsibility!');
        // Updater.setConfig(data);
        var user = db.users.getUser(req.user.username);
        res.render('admin/config', {
          user: user,
          config: Updater.getConfig()
        });
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
      
      edit: function(req, res) {
        var user = db.users.getUser(req.user.username);
        res.render('admin/views', {user: user})
      }
    },

    activities: {
      get: function(req, res) {
        const a = models.Activity.findAll()
          .then(result => {
            res.render('admin/table/activities', {activities: result});
          })
          .catch(error => {
          });
      }
    },

    controller: {
      get: function(req, res) {
        logger.info('Maintenance - Sending code...');
        if (!req.user) {
          res.json({
            status: 'error',
            result: 'Invalid user.'
          });
          return;
        }
        let data = { 
          username: req.user.username,
          language: req.query.language || 'C',
          version: req.query.version || 'default',
        }
        var files = Updater.download_code(data);
        if (files) {
          res.json({
            status: 'ok',
            result: files
          });
          logger.info('Maintenance - Code transferred.');
        } else {
          res.json({
            status: 'error',
            result: 'Missing controller'
          });
          logger.info('Maintenance - Code not transferred.');
        }
      },
      set: function(req, res) {
        logger.info('Maintenance - Receiving code...');
        // if (!req.user) {
        //     res.json({
        //         status: 'error',
        //         result: 'Invalid user.'
        //     });
        //     return;
        // }
        // let data = { 
        //     username: req.user.username,
        //     language: req.query.language || 'C',
        //     version: req.query.version || 'default',
        // }
        let sender = this.sender;
        Updater.upload_code(data, (result)=>{
          logger.debug(result.stderr);
          sender.emit('controller.set', result);
        });
      },
      edit: function(req, res) {
        res.render('admin/controller', { user: db.users.getUser('admin') });
      }
    },

    experiences: function(req, res) {
      res.render('admin/experiences', { user: db.users.getUser('admin') });
    }
  },
}