// class Variable {
//   constructor(name, description='Variable', type_='float', min_=0, max_=1, precision=0) {
//     this.name = name;
//     this.description = description;
//     this.type = type_;
//     this.min = min_;
//     this.max = max_;
//     this.precision = precision;
//   }
// }

const { Sequelize, DataTypes, Model, DATE, where } = require('sequelize');
const { loggers } = require('winston');
const { controller } = require('./config/LabConfig');
const { password } = require('./hardware/env');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db/database.sqlite'
});
const logger = require('winston').loggers.get('log');

class User extends Model {}
User.init({
  username: {
    type: DataTypes.STRING, allowNull: false, primaryKey: true
  },
  displayName: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  },
  emails: {
    type: DataTypes.STRING
  },
  permissions: {
    type: DataTypes.TEXT
  }
}, {
  sequelize, modelName: 'User'
});

class View extends Model {}
View.init({
  id: {
    type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true
  },
  name: {
    type: DataTypes.STRING, allowNull: false
  },
  path: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.STRING
  },
  date: {
    type: DataTypes.DATE, defaultValue: Sequelize.NOW
  },
  comments: {
    type: DataTypes.TEXT
  }
}, {
  sequelize, modelName: 'View'
});

class Activity extends Model {}
Activity.init({
  name: {
    type: DataTypes.STRING, allowNull: false, primaryKey: true
  },
}, {
  sequelize, modelName: 'Activity'
});

// class ControllerTemplate extends Model {}
// ControllerTemplate.init({
//   id: {
//     type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true
//   },
//   name: {
//     type: DataTypes.STRING, allowNull: false
//   },
//   type: {
//     type: DataTypes.STRING, allowNull: false
//   },
// });

class Controller extends Model {}
Controller.init({
  name: {
    type: DataTypes.STRING, allowNull: false, primaryKey: true
  },
  type: {
    type: DataTypes.STRING, allowNull: false, primaryKey: true
  }
}, {
  sequelize, modelName: 'Controller'
});

Activity.belongsTo(View);
Activity.belongsTo(Controller);
View.hasMany(Activity);
Controller.hasMany(Activity);
// ControllerTemplate.hasMany(Activity);

// Controller.sync({ 'force': true });
// View.create({
//   name: 'Sistemas Lineales'
// })

// Controller.create({
//   name: 'C Controller'
// })

// Activity.create({
//   name: 'Sistemas Lineales: 1',
//   ViewId: '3c980a43-045c-4a84-8373-040dfe18d68d',
//   ControllerName: 'C Controller',
// })
//   .then(activity => {

// })
//   .catch(error => {
//     logger.debug(`model.js: ${error.message}`);
// });

// sequelize.sync({ force: true });
// User.create({
//   username: 'admin',
//   displayName: 'Administrator',
//   emails: 'jeschaco@ucm.es',
//   password: 'admin_circuit',
//   permissions: 'ADMIN;RO'
// });

User.findOne({ where: {username: 'admin'} })
.catch(error => { console.log(error); })
.then(user => {
  if(user) {
    console.log(`${user.username} exists with id: ${user.id}`);
  }
});

module.exports = {
  User: User,
  View: View,
  Activity: Activity,
  Controller: Controller,
}