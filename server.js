var express  = require('express');
var app      = express();
var bodyParser   = require('body-parser');
const MongoClient = require('mongodb').MongoClient
var passport = require('passport');
var flash    = require('connect-flash');
const mongoose = require('mongoose')
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');

var db

var url = "mongodb+srv://jayden:april2017@cluster0-tcvtm.mongodb.net/test?retryWrites=true&w=majority"

require('./config/passport')(passport);
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(session({
    secret: 'rcbootcamp2019a', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());
app.listen(4000, () => {
  mongoose.connect(url, (err, database) => {
    if (err) return console.log(err)
    db = database
  });
    // MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
    //     if(error) {
    //         throw error;
    //     }
    //     db = client.db("test");
    //     console.log("Connected to `" + "test" + "`!");
    // });
});


app.get('/', function(req, res) {
    res.render('index.html');
});

// login
app.post('/login', (req, res, next) => {
  passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: 'error.html',
    failureFlash: true
  })(req, res, next);
});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

//signup
app.get('/signup', function(req, res) {
  res.render('signup.ejs', { message: req.flash('signupMessage') });
});

// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/profile', // redirect to the secure profile section
  failureRedirect : '/signup', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));


//casino owner login
app.get('/profile', isLoggedIn, function(req, res) {
    db.collection('users').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user : req.user,
        data: result
      })
    })
});

//game results
app.put('/game', (req, res) => {
  if ("winning" in req.body){db.collection('users').findOneAndUpdate({}, {
      $inc: {
        "local.lost" : 1,//number of times people lost
        "local.losses": req.body.bet
      }
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
  }else if ("losing" in req.body) {db.collection('users').findOneAndUpdate({}, {
      $inc: {
        "local.win" : 1,//number of times people lost
        "local.winnings": req.body.bet
      }
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
  }
})

console.log('The magic happens on port ' + 4000);
