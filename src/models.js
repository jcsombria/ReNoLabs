const Settings = require('./settings');
const { Sequelize, DataTypes, Model, DATE, where } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: Settings.SQLITE_DB_FILE,
  logging: false, 
});
/*
const sequelize = new Sequelize(
  Settings.MARIADB_DATABASE,
  Settings.MARIADB_USER,
  Settings.MARIADB_PASSWORD, {
  dialect: 'mariadb',
  logging: false, 
});
*/
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
  },
  controllerName: {
    type: DataTypes.STRING, allowNull: false
  },
  viewName: {
    type: DataTypes.STRING, allowNull: false
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

class Course extends Model {}
Course.init({
  id: {
    type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true
  },
  name: {
    type: DataTypes.STRING, allowNull: false
  },
  year: {
    type: DataTypes.STRING
  },
}, {
  sequelize, modelName: 'Course'
});

Activity.belongsTo(View);
Activity.belongsTo(Controller);
View.hasMany(Activity);
Controller.hasMany(Activity);

User.belongsToMany(Activity, { through: 'UserActivities' });
Activity.belongsToMany(User, { through: 'UserActivities' });

User.belongsToMany(Course, { through: 'UserCourses' });

sequelize.sync();

module.exports = {
  sequelize: sequelize,
  User: User,
  View: View,
  Activity: Activity,
  Controller: Controller,
  Course: Course,
}
