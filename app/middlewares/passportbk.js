let passport = require('passport')
let FacebookStrategy = require('passport-facebook').Strategy
let TwitterStrategy = require('passport-twitter').Strategy
let LocalStrategy = require('passport-local').Strategy
let nodeifyit = require('nodeifyit')
let User = require('../models/user')


function usePassportStrategy(OauthStrategy, config, field) {
  console.log('field ' + field)
  if (field === 'facebook') {
    console.log('inside facebook authentication'  )
    console.log('client id ' + config.clientID)
    passport.use('facebook', new FacebookStrategy({
          clientID        : config.clientID,
          clientSecret    : config.clientSecret,
          callbackURL     : config.callbackUrl,
          passReqToCallback : true
         },
         // facebook will send back the tokens and profile
         function(req, token, refresh_token, profile, done) {
           console.log("inside facebook strategy authentication callback function ");
           // asynchronous
           process.nextTick(function() {
              if (!req.user) {
                console.log(profile)
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                   if (err)
                     return done(err);

                   if (user) {
                     // if there is a user id already but no token (user was linked at one point and then removed)
                     if (!user.facebook.token) {
                         user.facebook.token = token;
                         user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                         user.facebook.email = 'test1@test.com'

                         user.save(function(err) {
                             if (err)
                                 return done(err);

                             return done(null, user);
                         });
                     }
                     return done(null, user); // user found, return that user
                   } else {
                      // if there is no user, create them
                      var newUser            = new User();

                      newUser.facebook.id    = profile.id;
                      newUser.facebook.token = token;
                      newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                      newUser.facebook.email = 'test1@test.com'

                      newUser.save(function(err) {
                         if (err)
                             return done(err);

                         return done(null, newUser);
                      });  //end of save
                  }//end of else
               }); //end of find one
             }  //end of req.user
             else {
             // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session
                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                user.save(function(err) {
                   if (err)
                      return done(err);
                   return done(null, user);
                });
              }//end of else of req.user
          }); //end of nexttrick
      } //end of function
      ))
  }

  if (field === 'twitter') {
      passport.use('twitter', new TwitterStrategy({
            consumerKey:  config.consumerKey,
            consumerSecret: config.consumerSecret,
            callbackURL: config.callbackUrl,
            passReqToCallback : true
           },
           // facebook will send back the tokens and profile
           function(req, token, refresh_token, profile, done) {
             console.log("inside twitter strategy authentication callback function ");
             console.log(profile)
             // asynchronous
             process.nextTick(function() {
                if (!req.user) {
                  console.log(profile)
                  User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                     if (err)
                       return done(err);

                     if (user) {
                       // if there is a user id already but no token (user was linked at one point and then removed)
                       if (!user.twitter.token) {
                           user.twitter.token = token;
                           user.twitter.name  = profile.username;
                           user.twitter.displayName = profile.displayName;

                           user.save(function(err) {
                               if (err)
                                   return done(err);

                               return done(null, user);
                           });
                       }
                       return done(null, user); // user found, return that user
                     } else {
                        // if there is no user, create them
                        var newUser            = new User();

                        newUser.twitter.id    = profile.id;
                        newUser.twitter.token = token;
                        newUser.twitter.name  = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save(function(err) {
                           if (err)
                               return done(err);

                           return done(null, newUser);
                        });  //end of save
                    }//end of else
                 }); //end of find one
               }  //end of req.user
               else {
               // user already exists and is logged in, we have to link accounts
                  var user            = req.user; // pull the user out of the session
                  user.twitter.id    = profile.id;
                  user.twitter.token = token;
                  user.twitter.name  = profile.username;
                  user.twitter.displayName = profile.displayName;

                  user.save(function(err) {
                     if (err)
                        return done(err);
                     return done(null, user);
                  });
                }//end of else of req.user
            }); //end of nexttrick
        } //end of function
        ))
    }

}

function configure(config) {
  console.log(config)
  // Required for session support / persistent login sessions
  passport.serializeUser(nodeifyit(async (user) => {
    return user.id
  }))

  passport.deserializeUser(nodeifyit(async (id) => {
    return await User.promise.findById(id)
  }))

  usePassportStrategy(FacebookStrategy, {
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackUrl,
  }, 'facebook')

  usePassportStrategy(TwitterStrategy, {
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: config.twitter.callbackUrl,
  }, 'twitter')

  return passport
}

module.exports = {passport, configure}