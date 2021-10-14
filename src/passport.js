/*
* Protocolo de autentificación (passport module).
*/
passport.use(new Strategy(
  function(username, password, done) {
    UserMaintenance.
    db.users.findByUsername(username, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.'});
      }
      if (user.password != password) {
        return done(null, false, { message: 'Incorrect password.'}); 
      }
      return done(null, user);
    });
  })
);
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});
passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});
