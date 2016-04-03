let path = require('path')
let express = require('express')
let morgan = require('morgan')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
let session = require('express-session')
let mongoose = require('mongoose')
let requireDir = require('require-dir')
let flash = require('connect-flash')
let passportMiddleware = require('./app/middlewares/passport')
let passport = passportMiddleware.passport
let Twitter = require('twitter')
let then = require('express-then')
let isLoggedIn = require('./app/middlewares/isLoggedIn')
let posts = require('./data/posts')

let networks = {
   twitter: {
       network: {
        icon: 'twitter',
        name: 'twitter',
        class:'btn-primary'
       }
   }
}

let app = express(),
config = requireDir('./config', {recurse: true}),
port = process.env.PORT || 8000

passportMiddleware.configure(config)//config.auth[NODE_ENV]

mongoose.set("debug", true);
// connect to the database
mongoose.connect(config.database.url,function(err) {
    if (err) throw err;
   console.log('Successfully connected to MongoDB ' + config.database.url)

});

// set up our express middleware
app.use(morgan('dev')) // log every request to the console
app.use(cookieParser('ilovethenodejs')) // read cookies (needed for auth)
app.use(bodyParser.json()) // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }))

//app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs') // set up ejs for templating

// required for passport
app.use(session({
  secret: 'ilovethenodejs',
  resave: true,
  saveUninitialized: true
}))

// Setup passport authentication middleware
app.use(passport.initialize())
// persistent login sessions
app.use(passport.session())
// Flash messages stored in session
app.use(flash())

// configure routes
require('./app/routes')(app)

// start server
// Your routes here... e.g., app.get('*', handler)
  app.get('/', (req, res) => res.render('index.ejs', {}))
  app.get('/profile', isLoggedIn, (req, res) => {
      res.render('profile.ejs', {
          user: req.user
      })
  })

  app.get('/logout', (req, res) => {
      req.logout()
      res.redirect('/')
  })

  app.get('/login', (req, res) => {
      res.render('login.ejs')
  })

  app.post('/login', passport.authenticate('login', {
  		successRedirect: '/profile',
  		failureRedirect: '/',
  		failureFlash : true
  }));

  //// facebook --------------------------------
  /*
  app.get('/auth/facebook', passport.authenticate('facebook',  { scope : 'email' }))

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/profile',
      failureFlash: true
  }))
  */

  // twitter --------------------------------


  // send to twitter to do the authentication
  app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

  // handle the callback after twitter has authenticated the user
  app.get('/auth/twitter/callback',
      passport.authenticate('twitter', {
          successRedirect : '/profile',
          failureRedirect : '/'
      }));


  app.get('/timeline', isLoggedIn, then(async (req, res) => {

     let twitterClient = new Twitter({
        consumer_key: config.auth.twitter.consumerKey,
        consumer_secret: config.auth.twitter.consumerSecret,
        access_token_key: req.user.twitter.token,
        access_token_secret: req.user.twitter.refresh_token
     })
     let tweets = await twitterClient.promise.get('statuses/home_timeline')
     tweets = tweets[0]

     var newtweets = tweets.map(tweet => {
       return {
            id:tweet.id_str,
            text: tweet.text,
            image:tweet.user.profile_image_url,
            name:tweet.user.name,
            username:'@'+tweet.user.screen_name,
            liked:tweet.favorited,
            network: {
                 icon: 'twitter',
                 name: 'twitter',
                 class:'btn-primary'
            }
        }
     })
     res.render('timeline.ejs', {
         posts: newtweets
     })

  }))


  app.get('/compose', isLoggedIn,  (req, res) => {
     res.render('compose.ejs')

  })

  app.post('/compose', isLoggedIn, then(async (req, res) => {
    let status = req.body.test
     console.log('in compose, post text is ' + status)
      // console.log(req)
     /* if (status.length > 140) {
       req.flash('error', 'status is over 140 characters!')
      }
      if (!status) {
             req.flash('error', 'text can not be empty!')
      }*/
     let twitterClient = new Twitter({
              consumer_key: config.auth.twitter.consumerKey,
              consumer_secret: config.auth.twitter.consumerSecret,
              access_token_key: req.user.twitter.token,
              access_token_secret: req.user.twitter.refresh_token
      })

      await twitterClient.promise.post('statuses/update', {status})
      res.redirect('/timeline')
  }))


  app.post('/like/:id', isLoggedIn, then(async (req, res) => {
      let twitterClient = new Twitter({
          consumer_key: config.auth.twitter.consumerKey,
          consumer_secret: config.auth.twitter.consumerSecret,
          access_token_key: req.user.twitter.token,
          access_token_secret: req.user.twitter.refresh_token
       })
       let id = req.params.id
       console.log('id' + id)
       await twitterClient.promise.post('favorites/create', {id})
       res.end()
  }))

  app.post('/unlike/:id', isLoggedIn, then(async (req, res) => {

     let twitterClient = new Twitter({
            consumer_key: config.auth.twitter.consumerKey,
            consumer_secret: config.auth.twitter.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.refresh_token
     })

      let id = req.params.id
      console.log('id ' + id)
      await twitterClient.promise.post('favorites/destroy', {id})
      res.end()

  }))


app.listen(port, ()=> console.log(`Listening @ http://127.0.0.1:${port}`))