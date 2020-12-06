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

const behavior = require('./behavior');
const Config = require('./config/AppConfig');
const db = require('./db');
const SessionManager = require('./sessions').SessionManager;
// const RIPBroker = require('./rip/RIPBroker');
// var ripBroker = new RIPBroker(Config.RIP);
// SessionManager.hardware.adapter.addListener(ripBroker);

// Express modules.
const express = require('express');
const fs = require('fs');
const login = require('connect-ensure-login');
const logger = require('winston').loggers.get('log');
logger.level = 'silly';
const passport = require('passport');
const Strategy = require('passport-local').Strategy;

/*
* Protocolo de autentificación (passport module).
*/
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

  passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});
/*
 * Inicialización de la aplicación express empleado para las rutas del servidor.
 */
var app = express();
/*
 * Selección del modo de renderizado, en este caso ejs (no confundir con el otro EJS)
 * Con esto podemos pasar información a los html (archivos .ejs), por ejemplo, el usuario.
 *
 */
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
/*
 * Selección de la carpeta donde están los archivos estáticos (imagenes, css, script, etc)
 */
app.use(express.static('public'));
/*
 * Carga de módulos que utiliza la aplicación express (app).
 */
const cookie_parser = require('cookie-parser')();
const body_parser = require('body-parser');
const { Updater } = require('./updater');
const express_session = require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
});
app.use(cookie_parser);
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json({ type: '*/*'}));
app.use(express_session);
app.use(passport.initialize());
app.use(passport.session());
/*
 * Seleción del servidor (ip + puerto).
 */
var server = app.listen(Config.WebServer.port, Config.WebServer.ip, function () {
  var host = server.address().address;
  var port = server.address().port;
  logger.info(`Server started on http://${host}:${port}`);
});
/*
 * Configuracion de rutas.
 */
app.get('/', function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/select');
  } else {
    res.render('login');
  }
});

app.post('/', passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/select');
});

app.get('/select',
  login.ensureLoggedIn('/'),
  function (req, res) {
    res.render('select', {user: req.user, state: false});
});

app.get('/help',
  login.ensureLoggedIn('/'),
  function (req, res) {
    res.render('help', {user: req.user});
});

app.get('/data',
  login.ensureLoggedIn('/'),
  function (req, res) {
    /*
     * Filtra los ficheros de cada usuario
     */
    var files = {name: 0, date: [], size: []};
    files.name = fs.readdirSync('./data/').filter(function(element) {
      if (element.split('_')[0] == req.user.username) {
        return element;
      }
    });
    /*
     * Devuelve la hora de creación y el tamaño de cada fichero
     */
    for (i = 0; i < files.name.length; i++) {
      files.date[i] = fs.statSync('./data/'+files.name[i]).atime;
      files.size[i] = fs.statSync('./data/'+files.name[i]).size;
    }
    res.render('experiments', {
      user: req.user,
      names: files.name,
      dates: files.date,
      sizes: files.size
    });
});

app.get('/download/*',
  login.ensureLoggedIn('/'),
  function (req, res) {
    res.download('./data/' + req.params[0]);
  }
);

app.get('/real',
  login.ensureLoggedIn('/'),
  function (req, res) {
    var credentials = {
      'username': req.user.username,
      'password': req.user.password
    };
    if(SessionManager.idle) {
      logger.debug(`User ${req.user.username} starts session.`);
      SessionManager.start(credentials);
    }
    var session = SessionManager.connect('http_'+req.socket.id, req.socket, credentials);
    logger.debug(`Session: ${session}`);
    if(session != undefined && session.isActive()) {
      logger.debug(`Key: ${session.token}`);
      res.render('real.ejs', {
        user: req.user,
        key: session.token,
        ip: Config.WebServer.ip,
        port: Config.WebServer.port
      });
    } else {
      res.render('select', {
        user: req.user,
        state: true
      });
    }
  }
);

// app.get('/signals/:signalName',
//   login.ensureLoggedIn('/'),
//   function (req, res) {
//     res.header('Access-Control-Allow-Credentials', "true");
//     res.header('Access-Control-Allow-Origin', req.headers.origin);
//     res.header('Access-Control-Allow-Methods', 'GET');
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
//     logger.debug(`Conexion recibida`);
//     var credentials = { 'key': token };
//     var session = SessionManager.connect('http_', req.socket, credentials);
//     var signal = req.params['signalName'];
//     try {
//       var value = session.hw.get(signal);
//       logger.debug(`${value}`);
//       res.json(value);
//     } catch(e) {
//       res.json({});
//     }
//   }
// );

// app.get('/signals/:signalName/:signalValue',
//   login.ensureLoggedIn('/'),
//   function (req, res) {
//     // Allow Cross-Origin-Resource-Sharing (CORS)
//     res.header('Access-Control-Allow-Credentials', "true");
//     res.header('Access-Control-Allow-Origin', req.headers.origin);
//     res.header('Access-Control-Allow-Methods', 'GET');
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
//     var credentials = { 'key': token };
//     var session = SessionManager.connect('http_', req.socket, credentials);
//     var name = req.params['signalName'];
//     try {
//       var value = session.hw.set(signal);
//       session.hw.write(name, value);
//       res.json(value);
//     } catch (e) {
//       res.json({});
//     }
//   }
// );

app.get('/logout',
  function(req, res) {
    req.logOut();
    res.redirect('/');
  }
);

app.get('/admin',
  function(req, res) {
    res.render('editor/code');
  }
)

// app.get('/signals/info',
//  // login.ensureLoggedIn('/'),
//   function (req, res) {
//     // Allow Cross-Origin-Resource-Sharing (CORS)
//     // res.header('Access-Control-Allow-Credentials', "true");
//     // res.header('Access-Control-Allow-Origin', req.headers.origin);
//     // res.header('Access-Control-Allow-Methods', 'GET');
//     // res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
//     // var credentials = { 'key': token };
//     // var session = SessionManager.connect('http_', req.socket, credentials);
//     // var name = req.params['signalName'];
//     // try {
//     //   var value = session.hw.set(signal);
//     //   session.hw.write(name, value);
//     //   res.json(value);
//     // } catch (e) {
//     //   res.json({});
//     // }
//     res.json(Updater.getSignals());
//   }
// );

// This section add RIP support (if enabled in AppConfig.js)
if (Config.RIP !== undefined) {
  var ripapp = app;
  if(Config.RIP.port != Config.WebServer.port) {
    ripapp = express();
    var ripserver = ripapp.listen(Config.RIP.port, Config.RIP.ip, function () {
      var host = ripserver.address().address;
      var port = ripserver.address().port;
      logger.info(`RIP Server started on http://${host}:${port}`);
    });
  } else {
    logger.info(`RIP Server started on http://${Config.RIP.ip}:${Config.RIP.port}`);
  }  

  ripapp.get('/RIP',
    function(req, res) {
      try {
        var expId = req.query['expId'];
        logger.debug(expId);
        var info = ripBroker.info(expId);
      } catch(e) {
        expId = undefined;
        var info = ripBroker.info();
      }
      logger.debug('info:' +info);
      res.json(info);
    }
  );

  ripapp.post('/RIP/POST',
    function(req, res) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      ripBroker.process(req.body);
      res.json({'result':'ok'});
    }
  );

  ripapp.get('/RIP/SSE',
    function (req, res) {
      // TO DO: The RIP username should not be hardcoded
      var username = 'rip';
      var credentials = { 'username': username };
      var id = 'sse_' + req.socket.id;
      if(SessionManager.idle) {
        SessionManager.start(credentials);
      } 
      var session = SessionManager.connect(id, ripBroker, credentials);
      var expId = req.query['expId'];
      if(session != undefined){
        logger.info('new connection to SSE, user:' + username);
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        if(ripBroker.connect(expId)) {
          logger.debug(`RIP Broker: connected to ${expId}`);
        } else {
          logger.debug(`RIP Connection: User ${username} disconnected ${expId}`);
          SessionManager.disconnect(id);
        }
        ripBroker.handle(req, res);
        logger.debug(`RIP Connection: User ${username} connected to ${expId}`);
      } 
    }
  );
}

// This section enables socket.io communications
var io = require('socket.io').listen(server);
SessionManager.hardware.addListener(io);
io.sockets.on('connection', function(socket) {
  var id = 'socket_' + socket.id;
  var credentials = {
    'key': socket.handshake.query.key,
    'username': socket.handshake.query.user,
    'password': socket.handshake.query.password,
  }
  logger.debug(`Request from user: ${credentials['username']}`);
  if(socket.handshake.query.mode != 'client') {
    var session = SessionManager.connect(id, socket, credentials);
    if(!session) {
      socket.emit('login_error', {'text':'Invalid credentials'});
      socket.disconnect();
      return;
    }
  }
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
      if(SessionManager.idle) {
        logger.debug(`User ${credentials['username']} starts session.`);
        SessionManager.start(credentials);
      }
      if (session.isActive()) {
        logger.info('Entering user mode...');
        logger.debug('Registering common services...');
        new behavior.Normal(session).register(socket);
      }
    }
});
