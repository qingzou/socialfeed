let passport = require('passport')
let nodeifyit = require('nodeifyit')
let FacebookStrategy = require('passport-facebook').Strategy
let TwitterStrategy  = require('passport-twitter').Strategy;
let LocalStrategy = require('passport-local').Strategy
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

require('songbird')

const CONFIG = {
    facebook: {
        clientID: '779718192162027',
        clientSecret: 'b20b6a3abcdd4f62fb2ea4bb0dc7f52f',
        callbackUrl: 'http://socialauthenticator.com:8000/auth/facebook/callback'
    },
     twitter : {
        consumerKey: 'UFkYa4ESoHPbAVEJvwtCErrIo',
        consumerSecret: 'slUR4kwmiWVobLzNQxti9nTcCE8caqBlPwCqf9hM6iBeuXaHCl',
        callbackURL: 'http://socialauthenticator.com:8000/auth/twitter/callback'
     }
}

/*function useExternalPassportStrategy(OauthStrategy, config, field) {
  console.log("inside facebook strategy authentication " + field);
  config.passReqToCallback = true;

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

}*/

function useExternalPassportStrategy(OauthStrategy, config, field) {
  console.log("inside facebook strategy authentication " + field);
  config.passReqToCallback = true;

  if (field === 'twitter') {
      passport.use('twitter', new TwitterStrategy({
            consumerKey        : config.consumerKey,
            consumerSecret    : config.consumerSecret,
            callbackURL     : config.callbackUrl,
            passReqToCallback : true
           },
           // twitter will send back the tokens and profile
           function(req, token, refresh_token, profile, done) {

             // asynchronous
             process.nextTick(function() {
                if (!req.user) {

                  User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
                     if (err)
                       return done(err);

                     if (user) {
                       // if there is a user id already but no token (user was linked at one point and then removed)
                       if (!user.twitter.token || !user.twitter.refresh_token) {
                           user.twitter.token = token;
                           user.twitter.refresh_token = refresh_token;
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
                        newUser.twitter.refresh_token = refresh_token;
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
                  user.twitter.refresh_token = refresh_token;
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
var isValidPassword = function(user, password){
        //console.log('user password' + user.passowrd + " password " + password)
        return user.password === password; //bCrypt.compareSync(password, user.password);
}

function configure(config) {
  // Required for session support / persistent login sessions
   passport.serializeUser(function(user, done) {
          //console.log('serializing user: ');console.log(user);
          done(null, user._id);
      });

   passport.deserializeUser(function(id, done) {
          User.findById(id, function(err, user) {
              //console.log('deserializing user:',user);
              done(err, user);
          });
      });

  /* useExternalPassportStrategy(FacebookStrategy, {
        clientID: CONFIG.facebook.clientID,
        clientSecret: CONFIG.facebook.clientSecret,
        callbackURL: CONFIG.facebook.callbackUrl
    }, 'facebook')*/

   useExternalPassportStrategy(TwitterStrategy, {
           consumerKey: CONFIG.twitter.consumerKey,
           consumerSecret: CONFIG.twitter.consumerSecret,
           callbackURL: CONFIG.twitter.callbackUrl
       }, 'twitter')
  // useExternalPassportStrategy(LinkedInStrategy, {...}, 'google')
  // useExternalPassportStrategy(LinkedInStrategy, {...}, 'twitter')
  // passport.use('local-login', new LocalStrategy({...}, (req, email, password, callback) => {...}))
  // passport.use('local-signup', new LocalStrategy({...}, (req, email, password, callback) => {...}))

  return passport
}

module.exports = {passport, configure}
