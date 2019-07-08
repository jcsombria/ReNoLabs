// Application Configuration
var Config = require('./AppConfig');

/*
 * Módulos necesarios guardados package.json.
 */
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
var user_connected = {};
var flag_timeout = true;
var cryp_socket = Math.floor((Math.random() * 1000000) + 1);
var files = {name: 0, date: [], size: []};
var sessionTimer, disconnectTimer;

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
 * Inicialización de la aplicación express empleaso para las rutas del servidor.
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
			if (element.split('_')[0] == req.user.username)
				return element;
		});
		/*
		 * Devuelve la hora de creación y el tamaño de cada fichero
		 */
		for (i = 0; i < files.name.length; i++) {
			files.date[i] = fs.statSync('./data/'+files.name[i]).atime;
			files.size[i] = fs.statSync('./data/'+files.name[i]).size;
		}
		res.render('experiments', {user: req.user, names: files.name, dates: files.date, sizes: files.size});
});

app.get('/download/*',
	login.ensureLoggedIn('/'),
	function (req, res) {
		res.download('./data/' + req.params[0]);
});

app.get('/real',
	login.ensureLoggedIn('/'),
	function (req, res) {
		/*
		 * Si no hay nadie conectado toma guarda el usuario que se conecta
		 * guarda el nombre del usuario conectado para permitirle conectarse desde otro dispositivo
		 * encripta el socket para que sólo pueda acceder el usuario conectado.
		 */
		var clients = Object.keys(io.sockets.sockets);
		if (clients.length == 0 && flag_timeout) {
			user_connected = req.user;
			cryp_socket = Math.floor((Math.random() * 1000000) + 1);
			res.render('motor_practice', {
				user: req.user,
				key: cryp_socket,
				ip: Config.WebServer.ip,
				port: Config.WebServer.port,
			});
		/*
		 * Cuando el usuario que hay conectado intenta acceder desde otro dispositivo
		 * permite su entrada, de esta forma lo puede hacer sumultaneamente desde el
		 * ordenador y la tablets o smartphone.
		 */
		} else if (req.user.username == user_connected.username) {
			res.render('motor_practice', {
				user: req.user, key: cryp_socket,
				ip: Config.WebServer.ip,
				port: Config.WebServer.port
			});
		/*
		 * En el caso de que la práctica está ocupada muestra una alerta
		 * y devuelve al usuario a la página principal.
		 */
		} else {
			res.render('select', { user: req.user, state: true });
		}
	}
);

app.get('/logout',
	function(req, res) {
		req.logOut();
		res.redirect('/');
	}
);

/*
 * Inicialización del módulo socket empleado para la comunicación entre cliente y servidor.
 */
var io = require('socket.io').listen(server);
var adapter = new Config.Hardware.Adapter();
var logger = new Config.Hardware.Logger('start_server');
adapter.addListener(io);
adapter.addListener(logger);

io.sockets.on('connection', function(socket) {
	/*
	 * Comprueba si el usuario que se intenta conectar es el correcto
	 * Aplicación de la encriptación.
	 */
	if (socket.handshake.query.key != cryp_socket) {
		socket.emit('disconnect_timeout', {text: 'Conexión fallida!'});
		socket.disconnect();
		return;
	}

	/*
	 * Comprueba el número de conexiones socket entre cliente y servidor
	 */
	var clients = Object.keys(io.sockets.sockets); //JULIAN PONER

	/*
	 * En caso de ser la primera conexión y que el timeout no haya terminado
	 * Lanza una nueva sesión de la práctica con un nuevo Timeout.
	 */
	if (clients.length == 1 && flag_timeout) {
		console.info('[INFO] PRÁCTICA INICIADA');
		console.info('[INFO] Usuario: ' + user_connected.username);
		console.info('[INFO] ' + new Date());
		flag_timeout = false;
		/*
		 * El Timeout desconecta todos los clientes sockets
		 * y cierra el controlador.
		 */
 	 	connectionTimeout = function() {
 			io.emit('disconnect_timeout', { text: 'Timeout: Sesión terminada!' });
      var clients = Object.keys(io.sockets.sockets); //JULI
 			for (i = 0; i < clients.length; i++) {
 				io.sockets.sockets[clients[i]].disconnect(); //JULI: poner
 			}
 			flag_timeout = true;
 			if (adapter.connected) {
        adapter.stop();
 			}
 			clients = Object.keys(io.sockets.sockets); //JULI pongo
 			console.info('[INFO] PRÁCTICA FINALIZADA POR TIMEOUT');
 			console.info('[INFO] ' + new Date());
 		};

		sessionTimer = setTimeout(connectionTimeout, Config.Session.timeout*60*1000);
	}

	console.log('[DEBUG] ' + socket.handshake.headers['user-agent']);

	/*
	 * Rutina de recepción de sockets por parte del cliente
	 */
	socket.on('clientOut_serverIn', function(data) {
			console.log('[DEBUG] ' + data.variable + ' = ' + data.value);
			if (adapter.connected) {
				adapter.write(data.variable, data.value);
			} else if (data.variable == 'config' && data.value == 1) {
				logger.end();
				logger.start(user_connected.username);
				adapter.start();
			}
	});

	socket.on('disconnect', function () {
		clearTimeout(disconnectTimer);
    var clients = Object.keys(io.sockets.sockets); //JULI
		if (clients.length == 0) {
			disconnectTimer = setTimeout(function() {
				var clients = Object.keys(io.sockets.sockets); //JULI
				if (clients.length == 0 && !flag_timeout) {
					clearTimeout(sessionTimer);
					flag_timeout = true;
          adapter.stop();
					console.info('[INFO] PRÁCTICA FINALIZADA POR DESCONEXIÓN');
					console.info('[INFO] ' + new Date());
				}
			}, 5000);
		}
	});

  socket.on('error', function(err) {
    console.error('[ERROR] Socket: ' + err);
  });
});
