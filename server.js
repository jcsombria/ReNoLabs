const Config = require('./config/AppConfig');
const behavior = require('./behavior');
const db = require('./db');
const SessionManager = require('./sessions').SessionManager;
const RIPBroker = require('./rip/RIPBroker');
var ripBroker = new RIPBroker(Config.RIP);
// const hwlogger = new Config.Hardware.Logger('start_server');
// SessionManager.hw.addListener(hwlogger);
SessionManager.hw.addListener(ripBroker);

/*
* Módulos necesarios guardados package.json.
*/
const express = require('express');
const fs = require('fs');
const login = require('connect-ensure-login');
const logger = require('winston');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;

/*
 * variables utilizadas.
 */
var files = {name: 0, date: [], size: []};

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
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

/////////
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
    res.render('select', { user: req.user, state: false });
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
    var credentials = { 'username': req.user.username };
    if(SessionManager.idle) {
      logger.debug(`User ${req.user.username} starts session.`);
      SessionManager.start(credentials);
    }
    var session = SessionManager.connect('http_'+req.socket.id, req.socket, credentials);
    logger.debug(`Session: ${session}`);
    if(session != undefined && session.isActive()) {
      logger.debug(`Key: ${session.token}`);
      res.render(Config.Lab.GUI, {
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

app.get('/signals/:signalName',
  login.ensureLoggedIn('/'),
  function (req, res) {
    // Permitir Cross-Origin-Resource-Sharing (CORS)
    res.header('Access-Control-Allow-Credentials', "true");
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    var credentials = { 'key': token };
    var session = SessionManager.connect('http_', req.socket, credentials);
    var signal = req.params['signalName'];
    try {
      var value = session.hw.get(signal);
      res.json(value);
    } catch(e) {
      res.json({});
    }
  }
);

app.get('/signals/:signalName/:signalValue',
  login.ensureLoggedIn('/'),
  function (req, res) {
    // Permitir Cross-Origin-Resource-Sharing (CORS)
    res.header('Access-Control-Allow-Credentials', "true");
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    var credentials = { 'key': token };
    var session = SessionManager.connect('http_', req.socket, credentials);
    var name = req.params['signalName'];
    try {
      var value = session.hw.set(signal);
      session.hw.write(name, value);
      res.json(value);
    } catch (e) {
      res.json({});
    }
  }
);

app.get('/logout',
  function(req, res) {
    req.logOut();
    res.redirect('/');
  }
  );

var ripapp = app;
if(Config.RIP.port != Config.WebServer.port) {
  ripapp = express();
  var ripserver = ripapp.listen(Config.RIP.port, Config.RIP.ip, function () {
    var host = ripserver.address().address;
    var port = ripserver.address().port;
    logger.info(`RIP Server started on http://${host}:${port}`);
  });
} {
  logger.info(`RIP Server started on http://${Config.RIP.host}:${Config.RIP.port}`);
}

// This section enables RIP communications
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
    ripBroker.send();
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
    var session = SessionManager.connect(id, res.socket, credentials);
    var expId = req.query['expId'];
    if(session != undefined){
      logger.info('new connection to SSE, user:' + username);
      res.setHeader('Access-Control-Allow-Origin', '*');
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

// This section enables socket.io communications
var io = require('socket.io').listen(server);
SessionManager.hw.addListener(io);
io.sockets.on('connection', function(socket) {
  var id = 'socket_' + socket.id;
  var credentials = {
    'key': socket.handshake.query.key,
    'username': socket.handshake.query.user,
    'password': socket.handshake.query.password,
  }
  logger.debug(`socket.io: ${socket.handshake.query.key}`);
  logger.debug(`${socket.handshake.query.user}:${socket.handshake.query.password}`);
  var session = SessionManager.connect(id, socket, credentials);
  if(!session) {
    socket.emit('login_error', {'text':'Invalid credentials'});
    return;
  }
  // Maintenance mode
  switch (socket.handshake.query.mode) {
    case 'maintenance':
      if(!session.isSupervisor()) {
        logger.info('Entering maintenance mode...');
        if (session.isAdministrator()) {
          logger.debug('Registering admin maintenance services...');
          new behavior.AdminMaintenance(session).register(socket);
        } else {
          logger.debug('Registering user maintenance services...');
          new behavior.UserMaintenance(session).register(socket);
        }
      }
      break;
    case 'client':
      logger.info('Entering client mode...');
      logger.debug('Registering client services...');
      new behavior.Client(session).register(socket);
      break;
    default:
      // Configuration services
      logger.debug('Registering config services...');
      new behavior.Config(session).register(socket);
      // Behave as a normal user
      if(!session.isSupervisor()) {
        logger.info('Entering user mode...');
        logger.debug('Registering common services...');
        new behavior.Normal(session).register(socket);
      }
  }
});