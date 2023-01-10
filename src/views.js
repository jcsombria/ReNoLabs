const logger = require('winston').loggers.get('log');
const { where, include } = require('sequelize');
const { Updater } = require('./updater');
const { ActivityManager } = require('./sessions');
const models = require('./models');
const Settings = require('./settings');
const jwt = require('jsonwebtoken');
const fs = require('fs');

function getView(activity) {
  if (activity.View) {
    return activity.View;
  }
  return models.View.findOne({
    where: { name: activity.viewName },
    order: [['createdAt', 'DESC']],
  });
}

function getToken(req) {
  return (
    req.query.accessToken ||
    req.params.accessToken ||
    req.headers.authorization.split(' ')[1]
  );
}

module.exports = {
  index: function (req, res) {
    res.render('home');
  },

  login: function (req, res) {
    const accessToken = jwt.sign(
      {
        username: req.user.username,
        displayName: req.user.displayName,
        role: req.user.isAdmin ? 'admin' : 'user',
      },
      Settings.ACCESS_TOKEN_SECRET,
      { expiresIn: '60m' }
    );
    res.json({ accessToken });
  },

  authenticate: function (req, res) {
    return res.json({ result: 'Authenticated' });
  },

  // activity: function (req, res) {
  //   try {
  //     res.render("activity", {
  //       user: req.user,
  //       activities: req.user.Activities,
  //       activity: req.query.name,
  //     });
  //   } catch (e) {
  //     logger.debug("Invalid Activity");
  //   }
  // },

  help: async function (req, res) {
    try {
      const theactivity = req.user.Activities.find(
        (a) => a.name == req.query.name
      );
      if (!theactivity) {
        throw new Error(
          'No tienes permiso para acceder a la actividad solicitada.'
        );
      }
      var activity = await models.Activity.findOne({
        where: { name: req.query.name },
        include: models.View,
      });
      var view = await getView(activity);
      const help = fs.readFileSync(
        `${Settings.VIEWS_SERVE}/${view.id}/${view.description}`,
        'utf8'
      );
      res.send(help);
    } catch (e) {
      logger.debug(e);
      res.send(e.message);
    }
  },

  // Read current user's files
  data: function (req, res) {
    res.json(req.user.getExperiments());
    // res.render("table/experiments", {
    //   user: req.user,
    //   files: req.user.getExperiments(),
    // });
  },

  request_activity: async function (req, res) {
    const activity = req.user.Activities.find((a) => a.name == req.query.name);
    if (!activity) {
      return res
        .status(401)
        .json({ error: 'No tienes permiso para acceder a la actividad.' });
    }
    ActivityManager.get_or_start(activity, req.user)
      .then(async (session) => {
        const controller = await models.Controller.findOne({
          where: { name: activity.controllerName },
          order: [['updatedAt', 'DESC']],
        });
        const view = await models.View.findOne({
          where: { name: activity.viewName },
          order: [['updatedAt', 'DESC']],
        });
        const accessToken = jwt.sign(
          {
            username: req.user.username,
            activity: activity.name,
            model: controller.model,
            viewmodel: view.model,
            role: 'controller',
          },
          Settings.ACCESS_TOKEN_SECRET,
          { expiresIn: `${session.expiresIn}s` }
        );
        return res.json({
          accessToken,
          message: 'La actividad ya ha sido iniciada.',
        });
      })
      .catch((e) => {
        logger.debug(e.message);
        return res
          .status(401)
          .json({ error: 'No se puede obtener acceso a la actividad.' });
      });
  },

  connect_to_activity: async function (req, res) {
    try {
      const activity = req.user.Activity;
      const user = req.user;
      const view = await getView(activity);
      ActivityManager.getSession(activity, user).connect(res.socket);
      return res.render('remote_lab.ejs', {
        user,
        key: getToken(req),
        ip: Config.WebServer.ip,
        port: Config.WebServer.port,
        view: `${view.id}/${view.path}`,
        activity: activity.name,
      });
    } catch (e) {
      logger.debug(e);
      res.send('No se puede acceder a la actividad solicitada.');
      return;
    }
  },

  download: function (req, res) {
    res.download(`${Settings.DATA}/${req.params[0]}`);
  },

  // logout: function (req, res) {
  //   req.logOut(req.user, (err) => {
  //     if (err) return next(err);
  //     res.redirect("/");
  //   });
  // },
};

// module.exports.admin = {
// home: function (req, res) {
//   try {
//     res.render("admin/home", {
//       user: req.user,
//       activities: req.user.Activities,
//     });
//   } catch (e) {
//     logger.debug("Invalid Activity");
//     res.send("Activity not correctly configured.");
//   }
// },
// getTable: async function (req, res) {
//   const table = req.params.table;
//   const QUERY = {
//     activities: {
//       include: [models.View, models.Controller],
//       order: [["createdAt", "DESC"]],
//     },
//     views: {
//       order: [["createdAt", "DESC"]],
//     },
//     controllers: {
//       order: [["createdAt", "DESC"]],
//     },
//     users: {
//       order: [["createdAt", "DESC"]],
//     },
//   };
//   try {
//     const result =
//       req.method == "POST"
//         ? req.body.data
//         : await MODELS[table].findAll(QUERY[table]);
//     res.render("admin/table/" + table, { result: result });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// },
// getActivity: async function (req, res) {
//   try {
//     var activity = await models.Activity.findOne({
//       where: { name: req.query.name },
//       include: [models.View, models.Controller],
//     });
//     var users = activity.getUsers();
//     if (users != undefined) {
//       users = [];
//     }
//     const allUsers = await models.User.findAll();
//     res.render("admin/edit/activity", {
//       activity: activity,
//       users: users,
//       allUsers: allUsers,
//     });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// },
// views: {
//   get: function (req, res) {
//     logger.info(
//       "Sending view...With great power comes great responsibility!"
//     );
//     const v = models.View.findAll()
//       .then((result) => {
//         res.render("admin/table/views", { result: result });
//       })
//       .catch((error) => {
//         res.status(400).send(error);
//       });
//   },
//   set: function (req, res) {
//     logger.info(
//       "Uploading view...With great power comes great responsibility!"
//     );
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).send("No files were uploaded.");
//     }
//     Updater.addView({
//       name: req.body.name,
//       comment: req.body.comment,
//       view: req.files.view.data,
//     });
//     res.redirect("/admin");
//   },
// },
// controller: {
//   set: function (req, res) {
//     logger.info(
//       "Uploading controller...With great power comes great responsibility!"
//     );
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).send("No files were uploaded.");
//     }
//     Updater.addController({
//       name: req.body.name,
//       comment: req.body.comment,
//       controller: req.files.controller.data,
//     })
//       .then(() => {
//         res.redirect("/admin");
//       })
//       .catch((error) => {
//         logger.debug(error);
//         res.redirect("/admin");
//       });
//   },
// },
// activity: {
//   add: function (req, res) {
//     logger.info(
//       "Uploading activity...With great power comes great responsibility!"
//     );
//     if (!req.body.name) {
//       return res.status(400).send("Invalid name");
//     }
//     if (req.files && !req.files.controller && !req.body.controllerName) {
//       return res.status(400).send("Invalid controller");
//     }
//     if (req.files && !req.files.view && !req.body.viewName) {
//       return res.status(400).send("Invalid view");
//     }
//     var activity = {
//       name: req.body.name,
//       viewName: req.body.viewName,
//       controllerName: req.body.controllerName,
//     };
//     if (req.files && req.files.view) {
//       activity["view"] = req.files.view.data;
//     }
//     if (req.files && req.files.controller) {
//       activity["controller"] = req.files.controller.data;
//     }
//     Updater.addActivity(activity)
//       .then(() => {
//         return res.redirect("/admin");
//       })
//       .catch((e) => {
//         logger.debug(e.message);
//         return res.status(500).send(e.message);
//       });
//   },
// },
// token: function (req, res) {
//   const token = jwt.sign(
//     {
//       username: req.user.username,
//     },
//     Settings.ACCESS_TOKEN_SECRET,
//     { expiresIn: `20m` }
//   );
//   res.json({ access_token: token });
// },
// };

module.exports.api = {
  query: function (req, res) {
    var q = req.body;
    q['action'] = req.params.action;
    q['model'] = req.params.model;
    Updater.query(q)
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },
};

module.exports.api.deprecated = {
  info: {
    get: function (req, res) {
      logger.info('Sending Lab Info.');
      var response;
      try {
        result = Updater.getInfo();
        response = { status: 'OK', data: result };
      } catch (e) {
        response = { status: 'ERROR', data: { reason: 'Server Error' } };
      }
      res.send(response);
    },
  },
  config: {
    get: function (req, res) {
      logger.info(
        'Sending config...With great power comes great responsibility!'
      );
      var response;
      try {
        result = Updater.getConfig();
        response = { status: 'OK', data: result };
      } catch (e) {
        response = { status: 'ERROR', data: { message: 'Server Error' } };
      }
      res.send(response);
    },
    // set: function (req, res) {
    //   logger.info(
    //     "Updating config...With great power comes great responsibility!"
    //   );
    //   let data = req.body;
    //   Updater.setConfig(data);
    //   res.send({ status: "OK", data: { DefaultConfig: Config } });
    // },
  },
  users: {
    get: async function (req, res) {
      logger.info(
        'Sending list of users...With great power comes great responsibility!'
      );
      Updater.query({ action: 'get', model: 'user' })
        .then((result) => {
          res.send(result);
        })
        .catch((error) => {
          res.status(400).send(error);
        });
    },
    //   set: function (req, res) {
    //     let data = JSON.stringify(req.body);
    //     Updater.setUsers(data);
    //     logger.info(
    //       "Updating list of users...With great power comes great responsibility!"
    //     );
    //     res.send(data);
    //   },
  },
  // view: {
  //   set: function (req, res) {
  //     var data = {
  //       name: req.body.name,
  //       comment: req.body.comment,
  //       view: Buffer.from(req.body.view, "base64"),
  //       activity: req.body.activity,
  //     };
  //     Updater.addView(data)
  //       .then((v) => {
  //         res.send({ status: "OK", data: {} });
  //       })
  //       .catch((e) => {
  //         res.send({ status: "ERROR", data: {} });
  //       });
  //   },
  // },
  controller: {
    get: async function (req, res) {
      logger.info('Maintenance - Sending code...');
      let data = {
        username: req.user.username,
        name: req.body.name,
        language: req.query.language || 'C',
        version: req.query.version || 'default',
      };
      var files = await Updater.getController(data);
      if (files) {
        logger.info('Maintenance - Code transferred.');
        response = { status: 'OK', data: files };
      } else {
        logger.info('Maintenance - Code not transferred.');
        response = { status: 'ERROR', data: 'Missing controller' };
      }
      res.json(response);
    },
    // set: function (req, res) {
    //   logger.info("Maintenance - Receiving code...");
    //   var zip = new AdmZip();
    //   req.body.files.forEach((f) => {
    //     zip.addFile(f.filename, Buffer.from(f.code, "utf8"));
    //   });
    //   Updater.addController({
    //     name: req.body.name,
    //     controller: zip.toBuffer(),
    //     callback: (result) => {
    //       var response;
    //       try {
    //         logger.info("Maintenance - Controller updated.");
    //         response = {
    //           status: "OK",
    //           data: {
    //             output: result.stdout,
    //             error: result.stderr,
    //           },
    //         };
    //       } catch (e) {
    //         logger.info("Maintenance - Controller updated with errors.");
    //         response = {
    //           status: "ERROR",
    //           data: "Server Error",
    //         };
    //       }
    //       res.send(response);
    //     },
    //   });
    // },
  },
};

const Config = require('./config/AppConfig');
const LabConfig = require('./config/LabConfig');
module.exports.test = {
  peggy: function (req, res) {
    res.render('test_peggy.ejs');
  },

  serve: function (req, res) {
    res.render(`tests/${req.params.page}.ejs`);
  },

  vue: function (req, res) {
    res.render(`tests/vue.ejs`, {
      model: LabConfig.model,
      viewmodel: LabConfig.view,
    });
  },
};
