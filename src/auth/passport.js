const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const { where } = require('sequelize');
const models = require('../models');

const validateUser = function(username, password, done) {
  models.User.findOne({ where: {username: username} })
    .catch(error => { return done(error); })
    .then(user => {
      if(!user) {
        return done(null, false, { message: 'Incorrect username.'});
      }
      if(user.password != password) {
        return done(null, false, { message: 'Incorrect password.'});
      };
      return done(null, user);
    });
};

passport.use(new LocalStrategy(validateUser));

passport.use(new BasicStrategy(validateUser));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  models.User.findOne({ where: {username: username} })
  .catch(error => { return done(error); })
  .then(user => { return done(null, user); });
});

module.exports = passport;