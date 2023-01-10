const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

const { where } = require('sequelize');
const models = require('../models');
const Settings = require('../settings');

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromExtractors([
  ExtractJwt.fromUrlQueryParameter('accessToken'),
  ExtractJwt.fromAuthHeaderAsBearerToken(),
  ExtractJwt.fromBodyField('accessToken'),
]);
opts.secretOrKey = Settings.ACCESS_TOKEN_SECRET;
// opts.issuer = "vrlabs.dacya.ucm.es";
// opts.audience = "vrlabs.dacya.ucm.es";
passport.use(
  new JwtStrategy(opts, function (payload, done) {
    models.User.findOne({
      where: { username: payload.username },
      include: models.Activity,
    })
      .catch((error) => {
        return done(error);
      })
      .then((user) => {
        if (!user) {
          return done(null, false);
        }
        user.token = payload;
        if ('activity' in payload) {
          user.Activity = user.Activities.find(
            (a) => a.name == payload.activity
          );
        }
        if ('role' in payload) {
          user.role = payload.role;
        }
        return done(null, user);
      });
  })
);

const validateUser = function (username, password, done) {
  models.User.findOne({
    where: { username: username },
    include: models.Activity,
  })
    .catch((error) => {
      return done(error);
    })
    .then((user) => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password != password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
};

passport.use(new LocalStrategy(validateUser));
passport.use(new BasicStrategy(validateUser));

passport.serializeUser(function (user, done) {
  console.log('serialize');
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
  console.log('deserialize');
  models.User.findOne({
    where: { username: username },
    include: models.Activity,
  })
    .catch((error) => {
      return done(error);
    })
    .then((user) => {
      return done(null, user);
    });
});

module.exports = passport;
