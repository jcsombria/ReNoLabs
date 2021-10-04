var records = require('./records');
const fs = require('fs');
const models = require('../models');
const { where } = require('sequelize');
const { User } = require('../models');
const { type } = require('os');

exports.getUser = async function(username) {
  var user = await models.User.findOne({
    where: { username: username }
  });
  var record = null;
  if(user) {
    var record = user.dataValues;
    record.isAdmin = exports.isAdministrator(record);
  }
  return record;
}

exports.isAdministrator = function(user) {
  if (user && user.permissions) {
    var perms = user.permissions.split(';');
    for (var i in perms) {
      if (perms[i] === "ADMIN") return true;
    }
  }
  return false;
}

exports.isSupervisor = function(user) {
  if (user && user.permissions) {
    var perms = user.permissions.split(';');
    for (var i in perms) {
      if (perms[i] === "ADMIN") return true;
    }
  }
  return false;
}

exports.getUsers = async function() {
  var userList = [];
  try {
    var users = await models.User.findAll();
    for (var u in users) {
      userList.push(users[u].dataValues);
    }
    console.log(typeof userList);
  } catch(error) {
    console.error('Cannot read users database.');
  }
  return Promise.resolve(userList);
}

exports.reload = function() {
  var path = require.resolve('./records');
  delete require.cache[path];
  records = require('./records');
}
