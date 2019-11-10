// Application Configuration
var Config = require('./AppConfig');

/*
 * Módulos necesarios guardados package.json.
 */
var behavior = require('./behavior');
var fs = require('fs');
var express = require('express');
var path = require('path');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
var login = require('connect-ensure-login');

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
  console.info('[INFO] Server started on http://%s:%s', host, port);
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

// TO DO: Find another place more appropriate for token
var token = 0;
app.get('/real',
  login.ensureLoggedIn('/'),
  function (req, res) {
    // If idle, start a new session
    if(session.idle) {
      token = Math.floor((Math.random() * 1000000) + 1);
      session.start(req.user.username, token);
    }
    if(session.isActiveUser(req.user.username)) {
      res.render(Config.Lab.GUI, {
        user: req.user,
        key: token,
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
    console.log('[DEBUG]' + req.params);
    // if (signals.o[req.params["signalName"]] != null) {
    //   res.json(signals.o[req.params["signalName"]]);
    // } else {
    //   res.json({ });
    // }
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
    console.log('[DEBUG]' + req.params);
    // if (signals.i[req.params["signalName"]] != null) {
    //   signals.i[req.params["signalName"]] = parseFloat(req.params["signalValue"]);
    //
    //   // Establecer la referencia externa en el controlador si está disponible
    //   // [TODO] Si el controlador no está arrancado no tendrá el valor establecido
    //   // [TODO] Siempre se pasa la variable SetPoint, modificar para cualquier variable que se quiera establecer
    //   if (child.stdin.writable) {
    //       // External reference
    //       child.stdin.write('extern' + ":" + signals.i.SetPoint);
    //   }
    //   res.json(signals.i[req.params["signalName"]]);
    // }
    // else {
    //   res.json({});
    // }
  }
);

app.get('/logout',
  function(req, res) {
    req.logOut();
    res.redirect('/');
  }
);

// JCS: -- This section enables communications using RIP --
var Session = require('./Session');
var SSE = require('express-sse');
var RIPBroker = require('./rip/RIPBroker');
var ripBroker = new RIPBroker(Config.RIP);

app.get('/RIP', (req, res) => {
  try {
    var expId = req.query.expId;
  } catch(e) {
    expId = null;
  }
  var info = ripBroker.info(expId);
  res.json(info);
});

app.get('/RIP/SSE', (req, res) => {
  session.start();
  res.setHeader('Access-Control-Allow-Origin', '*');
  ripBroker.open_channel(req, res);
});

app.post('/RIP/POST', (req, res) => {
  ripBroker.send();
});

/*
 * Inicialización del módulo socket empleado para la comunicación entre cliente y servidor.
 */
var io = require('socket.io').listen(server);
var logger = new Config.Hardware.Logger('start_server');
var session = new Session(Config);
session.hw.addListener(io);
session.hw.addListener(logger);

io.sockets.on('connection', function(socket) {
  //   /*
  //    * Comprueba si el usuario que se intenta conectar es el correcto
  //    * Aplicación de la encriptación.
  //    */
  //   if (socket.handshake.query.key) {
    //     /*Autenticación a través de la página de login*/
    //     if (socket.handshake.query.key != cryp_socket && socket.handshake.query.key != cryp_socket_supervisor) {
      //       socket.emit('disconnect_timeout', {text: 'Conexión fallida!'});
      //       socket.disconnect();
      //       return;
      //     }
      //     if (socket.handshake.query.key == cryp_socket_supervisor)
      //       isSupervisor = true;
      // console.log("OK -> User: " + JSON.stringify(socket.handshake.query));
      //   }
  // is the user allowed?
  var credentials = {
    'key': socket.handshake.query.key,
    'user': socket.handshake.query.user,
    'password': socket.handshake.query.password,
  }
  if (!session.validate(credentials)) {
    var ev = {};
    if(credentials['key']) {
      ev = {'id': 'disconnect_timeout', 'text': 'Connection failed!'};
    } else {
      var text;
      if(!credentials['user'] || !credentials['password']) {
        text = 'User not specified!';
      } else {
        text = 'Invalid username or password!';
      }
      ev = {'id': 'login_error', 'text': text};
    }
    socket.emit(ev.id, {text: ev.text});
    socket.disconnect();
    return;
  }
  var user = db.users.getUser(credentials['user']);
  var isSupervisor = db.users.isSupervisor(user);
  var isAdministrator = db.users.isAdministrator(user);

  session.connect('socket_' + socket.id, socket);

  // Maintenance mode
  switch (socket.handshake.query.mode) {
    case 'maintenance':
      if(!isSupervisor) {
        console.info('[INFO] Entering maintenance mode...');
        if(isAdministrator) {
          console.info("[INFO] Registering admin maintenance services...");
          new behavior.AdminMaintenance(session).register(socket);
        } else {
          console.info("[INFO] Registering user maintenance services...");
          new behavior.UserMaintenance(session).register(socket);
        }
      }
      break;
    case 'client':
      console.info("[INFO] Entering client mode...");
      console.info("[INFO] Registering client services...");
      new behavior.Client(session).register(socket);
    default:
    // Configuration
      console.info("[INFO] Registering config services...");
      new behavior.Config(session).register(socket);
      // Behave as a normal user
      if(!isSupervisor) {
        console.info("[INFO] Entering user mode...");
        console.info("[INFO] Registering config services...");
        new behavior.Normal(session).register(socket);
      }
  }

  socket.on('error', function(err) {
    console.error('[ERROR] Socket: ' + err);
  });
});
