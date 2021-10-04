global.__basedirname = __dirname;
// Logs Configuration
const winston = require('winston');
const { format, transports } = winston;
const consoleformat = format.combine(
  format.colorize(), format.timestamp(), format.align(),
  format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);
const fileformat = format.combine(format.timestamp(), format.json());
const errors = new transports.File({
  format: fileformat, filename: 'log/error.log', level: 'error',
});
const console_ = new transports.Console({
  format: consoleformat,
});

// System Events Logger
winston.loggers.add('log', { transports: [errors, console_] });
const logger = require('winston').loggers.get('log');
logger.level = 'debug';

// Database
const { Sequelize, where } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db/database.sqlite'
});
const models = require('./models');
// Application Modules
const behavior = require('./behavior');
const Config = require('./config/AppConfig');
const db = require('./db');
const SessionManager = require('./sessions').SessionManager;
const { Updater } = require('./updater');
const views = require ('./myviews');
// Express modules.
const express = require('express');
const login = require('connect-ensure-login');
const fileUpload = require('express-fileupload');
const cookie_parser = require('cookie-parser');
const bodyParser = require('body-parser');
const express_session = require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
});
const flash = require('connect-flash');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
/*
* Inicialización de la aplicación express empleado para las rutas del servidor.
*/
var app = express();
app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookie_parser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({type: 'application/json'}));
app.use(express_session);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(fileUpload());
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});
/*
* Protocolo de autentificación (passport module).
*/
passport.use(new Strategy(
  function(username, password, done) {
    models.User.findOne({ where: {username: username} })
      .catch(error => { return done(error); })
      .then(user => {
        if(!user) {
          return done(null, false, { message: 'Incorrect username.'});
        }
        if(user.password != password) {
          return done(null, false, { message: 'Incorrect password.'});
        };
        return done(null, user);
      });
    }
  )
);
passport.serializeUser(function(user, done) {
    done(null, user.username);
});
passport.deserializeUser(function(username, done) {
  models.User.findOne({ where: {username: username} })
  .catch(error => { return done(error); })
  .then(user => { return done(null, user); });
});

// HTTP Server
var server = app.listen(Config.WebServer.port, Config.WebServer.ip, function () {
  var host = server.address().address;
  var port = server.address().port;
  logger.info(`Server started on http://${host}:${port}`);
});
// URLs
app.get('/', views.index);
app.post('/', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/',
  failureFlash: 'El usuario o la contraseña es incorrecto.'
}));
app.get('/home', login.ensureLoggedIn('/'), views.home);
app.get('/help', login.ensureLoggedIn('/'), views.help);
app.get('/data', login.ensureLoggedIn('/'), views.data);
app.get('/download/*', login.ensureLoggedIn('/'), views.download);
app.get('/remotelab', login.ensureLoggedIn('/'), views.experience);
app.get('/logout', views.logout);
app.get('/admin', login.ensureLoggedIn('/'), views.admin.home);
app.get('/admin/experiences', login.ensureLoggedIn('/'), views.admin.experiences);

app.get('/admin/users/get', login.ensureLoggedIn('/'), views.admin.users.get);
app.get('/admin/controller/get', login.ensureLoggedIn('/'), views.admin.controller.get);
app.get('/admin/config/get', login.ensureLoggedIn('/'), views.admin.config.get);
app.get('/admin/views/get', login.ensureLoggedIn('/'), views.admin.views.get);
app.get('/admin/activities/get', login.ensureLoggedIn('/'), views.admin.activities.get);
app.get('/admin/table/get/:table', login.ensureLoggedIn('/'), views.admin.getTable);
app.post('/admin/table/get/:table', login.ensureLoggedIn('/'), views.admin.getTable);

app.post('/admin/users/set', login.ensureLoggedIn('/'), views.admin.users.set);
app.get('/admin/controller', login.ensureLoggedIn('/'), views.admin.controller.edit);
app.post('/admin/controller/set', login.ensureLoggedIn('/'), views.admin.controller.set);
app.get('/admin/config/edit', login.ensureLoggedIn('/'), views.admin.config.edit);
app.post('/admin/config/set', login.ensureLoggedIn('/'), views.admin.config.set);
app.get('/admin/views', login.ensureLoggedIn('/'), views.admin.views.edit);
app.post('/admin/views/set', login.ensureLoggedIn('/'), views.admin.views.set);

// app.get('/experience/Sistemas Lineales/*', login.ensureLoggedIn('/'), )
// function (req, res) {
//   res.download('./data/' + req.params[0]);
// }


// This section adds RIP support (if enabled in AppConfig.js)
// if (Config.RIP !== undefined) {
//   const RIPBroker = require('./rip/RIPBroker');
//   const ripBroker = new RIPBroker(Config.RIP);
//   SessionManager.hardware.addListener(ripBroker);
//     var ripapp = app;
//   if(Config.RIP.port != Config.WebServer.port) {
//     ripapp = express();
//     var ripserver = ripapp.listen(Config.RIP.port, Config.RIP.ip, function () {
//       var host = ripserver.address().address;
//       var port = ripserver.address().port;
//       logger.info(`RIP Server started on http://${host}:${port}`);
//     });
//   } else {
//     logger.info(`RIP Server started on http://${Config.RIP.ip}:${Config.RIP.port}`);
//   }

//   ripapp.get('/RIP',
//     function(req, res) {
//       try {
//         var expId = req.query['expId'];
//         logger.debug(expId);
//         var info = ripBroker.info(expId);
//       } catch(e) {
//         expId = undefined;
//         var info = ripBroker.info();
//       }
//       logger.debug('info:' +info);
//       res.json(info);
//     }
//   );

//   ripapp.post('/RIP/POST',
//     function(req, res) {
//       res.header('Access-Control-Allow-Origin', req.headers.origin);
//       ripBroker.process(req.body);
//       res.json({'result':'ok'});
//     }
//   );

//   ripapp.get('/RIP/SSE',
//     function (req, res) {
//       // TO DO: The RIP username should not be hardcoded
//       var username = 'rip';
//       var credentials = { 'username': username };
//       var id = 'sse_' + req.socket.id;
//       if(SessionManager.idle) {
//         SessionManager.start(credentials);
//       } 
//       var session = SessionManager.connect(id, ripBroker, credentials);
//       var expId = req.query['expId'];
//       if(session != undefined){
//         logger.info('new connection to SSE, user:' + username);
//         res.header('Access-Control-Allow-Origin', req.headers.origin);
//         if(ripBroker.connect(expId)) {
//           logger.debug(`RIP Broker: connected to ${expId}`);
//         } else {
//           logger.debug(`RIP Connection: User ${username} disconnected ${expId}`);
//           SessionManager.disconnect(id);
//         }
//         ripBroker.handle(req, res);
//         logger.debug(`RIP Connection: User ${username} connected to ${expId}`);
//       } 
//     }
//   );
// }

// This section enables socket.io communications
const { EventGenerator } = require('./behavior/events');
const { UserMaintenance } = require('./behavior');
var io = require('socket.io').listen(server);
var eg = new EventGenerator(io);
SessionManager.hardware.addListener(eg);

io.sockets.on('connection', function(socket) {
  var id = 'socket_' + socket.id;
  var credentials = {
    'key': socket.handshake.query.key,
    'username': socket.handshake.query.user,
    'password': socket.handshake.query.password,
  }
  logger.debug(`Request from user: ${credentials['username']}`);
  // if(socket.handshake.query.mode != 'client') {
  var session = SessionManager.connect(id, socket, credentials);
  if(!session) {
    socket.emit('login_error', {'text':'Invalid credentials'});
    socket.disconnect();
    return;
  }
  // }
  logger.debug(`User ${credentials['username']} authenticated`);
  logger.debug(`Mode: ${socket.handshake.query.mode}`);
  switch (socket.handshake.query.mode) {
    case 'maintenance':
      logger.info('Entering maintenance mode...');
      if (session.isAdministrator()) {
        logger.debug('Registering admin maintenance services...');
        new behavior.AdminMaintenance(session).register(socket);
      } else {
        logger.debug('Registering user maintenance services...');
        new behavior.UserMaintenance(session).register(socket);
      }
      break;
    case 'client': // TO DO: is this necessary?
      logger.info('Entering client mode...');
      logger.debug('Registering client services...');
      new behavior.Client(session).register(socket);
      break;
    default:
      // Behave as a normal user
      if (session.isActive()) {
        logger.info('Entering user mode...');
        logger.debug('Registering common services...');
        new behavior.Normal(session).register(socket);
      }
  }
});