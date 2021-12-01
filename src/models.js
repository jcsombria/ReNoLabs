const { Sequelize, DataTypes, Model, DATE, where } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.SQLITE_DB_FILE || 'db/database.sqlite',
  logging: false, 
});

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
  sessionTimeout: {
    type: DataTypes.DECIMAL, allowNull: false, default: 15
  },
  disconnectTimeout: {
    type: DataTypes.DECIMAL, allowNull: false, defaultValue: 5 
  }
}, {
  sequelize, modelName: 'Activity'
});


class Controller extends Model {}
Controller.init({
  id: {
    type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true
  },
  name: {
    type: DataTypes.STRING, allowNull: false
  },
  path: {
    type: DataTypes.STRING
  },
  date: {
    type: DataTypes.DATE, defaultValue: Sequelize.NOW
  },
  type: {
    type: DataTypes.STRING, allowNull: false,
  }
}, {
  sequelize, modelName: 'Controller'
});

Activity.belongsTo(View);
Activity.belongsTo(Controller);
View.hasMany(Activity);
Controller.hasMany(Activity);

User.belongsToMany(Activity, { through: 'UserActivities' });
Activity.belongsToMany(User, { through: 'UserActivities' });

sequelize.sync();

module.exports = {
  sequelize: sequelize,
  User: User,
  View: View,
  Activity: Activity,
  Controller: Controller,
}