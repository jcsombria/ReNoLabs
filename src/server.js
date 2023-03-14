global.__basedirname = __dirname;
const Settings = require('./settings');
const winston = require('./log/logger');
const logger = winston.loggers.get('log');
// Application Modules
const behavior = require('./behavior');
const Config = require('./config/AppConfig');
const { ActivityManager } = require('./sessions');
const views = require('./views');
// Express modules.
const jwt = require('jsonwebtoken');
const express = require('express');
const cookie_parser = require('cookie-parser');
const cors = require('cors');
const express_session = require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
});
const passport = require('./auth/passport');
// Init express app.
const app = express();
app.set('views', Settings.TEMPLATES);
app.set('view engine', 'ejs');
app.use(express.static(Settings.PUBLIC));
// app.use(cookie_parser());
app.use(cors());
app.use(express.json({ type: 'application/json', limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express_session);
app.use(passport.initialize());
app.use(passport.session());
// API {
app.post('/login', passport.authenticate('local', { session: false }), views.login);
app.post('/authenticate', passport.authenticate('jwt', { session: false }), views.authenticate);
app.get('/request_activity', passport.authenticate('jwt', { session: false }), views.request_activity);
app.get('/remotelab', passport.authenticate('jwt', { session: false }), views.connect_to_activity);
app.get('/help', passport.authenticate('jwt', { session: false }), views.help);
app.get('/download/*', passport.authenticate('jwt', { session: false }), views.download);
app.post('/data', passport.authenticate('jwt', { session: false }), views.data);
// }
// Admin API
function onlyAdmin(req, res, next) {
  if (!req.user.isAdmin) { return res.status(401); }
  next();
}
app.post('/admin/q/:model/:action/', passport.authenticate('jwt', { session: false }), views.api.query);

// URLs - legacy API (will be removed soon) {
app.get(
  '/api/users/get',
  passport.authenticate('basic', { session: false }),
  onlyAdmin,
  views.api.deprecated.users.get
);
// app.post('/api/users/set', passport.authenticate('basic', { session: false }), views.api.users.set);
app.post(
  '/api/controllers/get',
  passport.authenticate('basic', { session: false }),
  onlyAdmin,
  views.api.deprecated.controller.get
);
// app.post('/api/controllers/set', passport.authenticate('basic', { session: false }), views.api.controller.set);
app.post(
  '/api/config/get',
  passport.authenticate('basic', { session: false }),
  onlyAdmin,
  views.api.deprecated.config.get
);
// app.post(
//   '/api/config/set',
//   passport.authenticate('basic', { session: false }),
//   onlyAdmin,
//   views.api.deprecated.config.set
// );
app.post(
  '/api/view/set',
  passport.authenticate('basic', { session: false }),
  onlyAdmin,
  views.api.deprecated.view.set
);
app.post(
  '/api/q/:model/:action/',
  passport.authenticate('basic', { session: false }),
  onlyAdmin,
  views.api.query
);
// }
// Init HTTP Server
var httpServer = app.listen(
  Config.WebServer.port,
  Config.WebServer.ip,
  function () {
    var host = httpServer.address().address;
    var port = httpServer.address().port;
    logger.info(`Server started on http://${host}:${port}`);
  }
);
// Redirect undefined routes
//app.get('*', (req, res) => {
//  res.redirect('/');
//});
// This section enables socket.io communications
const { Server } = require('socket.io');
const models = require('./models');
const io = new Server(httpServer, { cors: { origin: '*' } });

io.on('connection', async (socket) => {
  logger.debug('New socket.io connection');
  try {
    const token = jwt.verify(
      socket.handshake.query.key,
      Settings.ACCESS_TOKEN_SECRET
    );
    const user = await models.User.findOne({
      where: { username: token.username },
    });
    const activity = await models.Activity.findOne({
      where: { name: token.activity },
      include: models.Controller,
    });
    ActivityManager.connect(activity, user, socket)
      .then((session) => {
        logger.debug('Entering user mode...');
        new behavior.Normal(session).register(socket);
      })
      .catch((e) => {
        logger.debug(e);
        socket.emit('login_error', { text: 'Invalid authentication token' });
        socket.disconnect();
      });
  } catch (e) {
    logger.debug(e);
    socket.disconnect();
    return e;
  }
});

// This section adds RIP support (if enabled in AppConfig.js)
// if (Config.RIP !== undefined) {
//   const RIPBroker = require('./rip/RIPBroker');
//   const ripBroker = new RIPBroker(Config.RIP);
//   ActivityManager.hardware.addListener(ripBroker);
//     var ripapp = app ;
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
//       if(ActivityManager.idle) {
//         ActivityManager.start(credentials);
//       }
//       var session = ActivityManager.connect(activity, credentials, ripBroker, id);
//       var expId = req.query['expId'];
//       if(session != undefined){
//         logger.info('new connection to SSE, user:' + username);
//         res.header('Access-Control-Allow-Origin', req.headers.origin);
//         if(ripBroker.connect(expId)) {
//           logger.debug(`RIP Broker: connected to ${expId}`);
//         } else {
//           logger.debug(`RIP Connection: User ${username} disconnected ${expId}`);
//           ActivityManager.disconnect(id);
//         }
//         ripBroker.handle(req, res);
//         logger.debug(`RIP Connection: User ${username} connected to ${expId}`);
//       }
//     }
//   );
// }
