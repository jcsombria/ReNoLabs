const models = require('../models');
const logger = require('winston').loggers.get('log');

(async () => {
  try {
    await models.sequelize.sync({ force: true });
    // await models.Controller.create({
    //   name: 'C Controller',
    //   path: 'controllers/C',
    //   type: 'C'
    // });
    // await models.Controller.create({
    //   name: 'Dobot Controller',
    //   path: 'controllers/Dobot',
    //   type: 'Python'
    // });
  } catch(e) {
    console.log(e)
  }
  
  //View.create({
  //  id: 'e79f0922-ca43-46de-aaa9-674a221c5008'
  //  name: 'Dobot Controller',
  //  path: '',
  //  description: '',
  //  type: 'Python'
  //})
  //  .then(activity => {
  //    logger.debug('Activity created');
  //  })
  //.catch(e => {})
  
  // models.Activity.create({
  //   name: 'Dobot Magician',
  //   sessionTimeout: 15,
  //   disconnectTimeout: 20,
  //   // ViewId: 'b590081c-1b6c-4dd0-8c3d-0dcc6d50e4aa',
  //   ControllerName: 'Dobot Controller',
  // })
  //   .then(activity => {
  //     logger.debug('Activity created');
  //   })
  //   .catch(error => {
  //     logger.debug(`model.js: Cannot create activity.`);
  //     logger.debug(`model.js: ${error.message}`);
  // });

  models.User.create({
    username: 'admin',
    displayName: 'Administrator',
    emails: 'jeschaco@ucm.es',
    password: 'admin_circuit',
    permissions: 'ADMIN;RO'
  }).then(u => {
    console.log(`User ${username} created.`)
  }).catch(e => {
    console.log('error');
  });

  models.User.create({
    username: 'dgoncalv@ucm.es',
    displayName: 'Daniela Alejandra Goncalves',
    emails: 'dgoncalv@ucm.es',
    password: 'Dobot',
    permissions: 'ADMIN'
  }).then(u => {
    console.log(`User ${username} created.`)
  }).catch(e => {
    console.log('error');
  });

  models.User.findAll()
  .then(users => {
    users.forEach(u => { console.log(`${u.username}:${u.password}`); })
  })
})();