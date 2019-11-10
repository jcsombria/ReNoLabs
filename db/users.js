var records = require('./records');

exports.findById = function(id, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.id === id) {
        return cb(null, record);
      }
    }
    cb(new Error('User ' + id + ' does not exist'));
  });
}

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}

exports.getUser = function(username) {
  for (var i = 0, len = records.length; i < len; i++) {
    var record = records[i];
    if (record.username === username) {
      return record;
    }
  }
  return null;
}

exports.isAdministrator = function(user) {
  if (user && user.permissions) {
      for (i = 0; i < user.permissions.length; i++) {
          if (user.permissions[i] === "ADMIN")
              return true;
      }
  }
  return false;
}

exports.isSupervisor = function(user) {
  if (user && user.permissions) {
    for (i = 0; i < user.permissions.length; i++) {
      if (user.permissions[i] === "RO")
      return true;
    }
  }
  return false;
}
