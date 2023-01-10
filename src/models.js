const Settings = require('./settings');
const fs = require('fs');
const { Sequelize, DataTypes, Model, DATE, where } = require('sequelize');
const sequelize = (Settings.DB_SERVER=='sqlite') ?
  new Sequelize({
    dialect: 'sqlite',
    storage: Settings.SQLITE_DB_FILE,
    logging: false,
  }) : 
  new Sequelize(
    Settings.MARIADB_DATABASE,
    Settings.MARIADB_USER,
    Settings.MARIADB_PASSWORD, {
      host: '127.0.0.1',
      dialect: 'mariadb',
      logging: false,
    }
);

class User extends Model {
  // Returns the last nExperiments of the user
  getExperiments(nExperiments) {
    var files = fs.readdirSync(Settings.DATA)
      .filter(e => { if (e.split('_')[0] == this.username) { return e; } })
      .sort((a, b) => {
        return fs.statSync(`${Settings.DATA}/${b}`).mtime.getTime() - fs.statSync(Settings.DATA + '/' + a).mtime.getTime();
      });
    if (nExperiments !== undefined) { files = files.slice(0, nExperiments); };
    let experiments = files.map(item => {
      var stats = fs.statSync(`${Settings.DATA}/${item}`);
      return {
        'name': item,
        'date': stats.atime,
        'size': stats.size
      }
    });
    return experiments;
  }
}
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
  },
  isAdmin: {
    type: DataTypes.BOOLEAN, defaultValue: false,
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
  extern: {
    type: DataTypes.BOOLEAN,
  },
  model: {
    type: DataTypes.JSON,
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
    type: DataTypes.DECIMAL, allowNull: false, defaultValue: 30
  },
  disconnectTimeout: {
    type: DataTypes.DECIMAL, allowNull: false, defaultValue: 10
  },
  controllerName: {
    type: DataTypes.STRING, allowNull: false
  },
  viewName: {
    type: DataTypes.STRING, allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
  },
  image: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.STRING,
  }
}, {
  sequelize, modelName: 'Activity'
});


class Controller extends Model {}
Controller.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    config: {
      type: DataTypes.STRING,
    },
    model: {
      type: DataTypes.JSON,
    },
  },
  {
    sequelize,
    modelName: 'Controller',
  }
);

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
