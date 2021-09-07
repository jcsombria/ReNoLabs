const db = require('./db');
const SessionManager = require('./sessions').SessionManager;
const logger = require('winston').loggers.get('log');
const Config = require('./config/AppConfig');
const { Updater } = require('./updater');
const fs = require('fs');

module.exports = {
    index: function (req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/select');
        } else {
            context = { lab_title: Config.Lab['info']['name']};
            res.render('login', context);
        }
    },

    home: function(req, res) {
        res.redirect('/select');
    },
    
    select: function(req, res) {
        var user = db.users.getUser(req.user.username);
        res.render('select', {user: user, state: false});
    },
    
    help: function(req, res) {
        var user = db.users.getUser(req.user.username);
        res.render('help', {user: user});
    },

    data: function(req, res) {
        /*
         * Filtra los ficheros de cada usuario
         */
        var files = {name: 0, date: [], size: []};
        var dir = './data/';
        files.name = fs.readdirSync(dir)
            .filter((e) => { if (e.split('_')[0] == req.user.username) { return e; } })
            .sort((a, b) => { return fs.statSync(dir + b).mtime.getTime() - fs.statSync(dir + a).mtime.getTime(); });
        /*
         * Devuelve la hora de creación y el tamaño de cada fichero
         */
        for (i = 0; i < files.name.length; i++) {
          files.date[i] = fs.statSync('./data/'+files.name[i]).atime;
          files.size[i] = fs.statSync('./data/'+files.name[i]).size;
        }
        var user = db.users.getUser(req.user.username);
        res.render('experiments', {
          user: user,
          names: files.name,
          dates: files.date,
          sizes: files.size
        });
    },
    
    experience: function(req, res) {
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
        var user = db.users.getUser(req.user.username);
        if(token) {
            res.render('real.ejs', {
            user: user,
            key: token,
            ip: Config.WebServer.ip,
            port: Config.WebServer.port,
            gui: Config.Lab.GUI_JS,
            });
        } else {
            res.render('select', {
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
        users: {
            get: function(req, res) {
                logger.info('Sending list of users...A great power comes with a great responsibility!');
                let users = db.users.getUsers();
                res.send(users);
            },
            set: function(req, res) {
                let data = req.body;
                // Updater.updateUsers(data);
                logger.info('Updating list of users...A great power comes with a great responsibility!');
                db.users.reload();
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
                // Updater.setConfig(data);
                res.send({'DefaultConfig': Config});
            }
        },
    
        views: {
            get: function(req, res) {
                logger.info('Sending view...A great power comes with a great responsibility!');
                // res.send();
            },
    
            set: function(req, res) {
                
            },

            edit: function(req, res) {
                res.render('admin/views', )
            }
        },

        experiences: function(req, res) {
            res.render('admin/experiences', { user: db.users.getUser('admin') });
        }
    },
    
}