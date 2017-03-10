'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db')




// a reusable function
function respondWithAllTweets (req, res, next){
  client.query('SELECT name,content,user_id FROM USERS JOIN TWEETS ON users.id = tweets.user_id;', function (err, result) {
    if (err) return next(err); // pass errors to Express
    var tweets = result.rows;
    res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
  });
  ////replaced var alltweets with above
  // var allTheTweets = tweetBank.list();
  // res.render('index', {
  //   title: 'Twitter.js',
  //   tweets: allTheTweets,
  //   showForm: true
  // });
}

// here we basically treet the root view and tweets view as identical
router.get('/', respondWithAllTweets);
router.get('/tweets', respondWithAllTweets);

// single-user page
router.get('/users/:username', function(req, res, next){
  // var tweetsForName = tweetBank.find({ name: req.params.username }); select uses $1 for first value in an array which is the next argument
  client.query('SELECT name,content,user_id FROM USERS JOIN TWEETS ON users.id = tweets.user_id WHERE NAME = $1', [req.params.username], function (err,result){
    if (err) return next(err); // pass errors to Express
    var tweetsForName = result.rows;
    res.render('index', {
      title: 'Twitter.js',
      tweets: tweetsForName,
      showForm: true,
      username: req.params.username
    });
  });
});

// single-tweet page
router.get('/tweets/:id', function(req, res, next){
  // var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
  client.query('SELECT name,content,user_id FROM USERS JOIN TWEETS ON users.id = tweets.user_id WHERE TWEETS.ID = $1;', [req.params.id], function (err, result) {
    if (err) return next(err); // pass errors to Express
    var tweetsWithThatId = result.rows;
    res.render('index', {
      title: 'Twitter.js',
      tweets: tweetsWithThatId // an array of only one element ;-)
    });
  });
});

// create a new tweet
router.post('/tweets', function(req, res, next){
  // tweetBank.add(req.body.name, req.body.text);
  // res.redirect('/');

  // client.query('SELECT * FROM USERS (NAME) VALUES ($1)', [req.body.name], function (err, result) {
  //   var name = result.rows;
  //   console.log(name)
  // });

  client.query('INSERT INTO USERS (NAME) VALUES ($1) returning *;', [req.body.name], function (err, result) {
    if (err) return next(err); // pass errors to Express
    client.query('INSERT INTO TWEETS (USER_ID, CONTENT) VALUES ($1, $2)', [result.rows[0].id, req.body.text], function (err, result) {
      if (err) return next(err);
    });
    res.redirect('/');
  });

  // client.query('INSERT INTO TWEETS (USER_ID, CONTENT) VALUES ($1, $2);', [, req.body.text], function (err, result) {
  //   if (err) return next(err); // pass errors to Express
  //   res.redirect('/');
  // });
});

// // replaced this hard-coded route with general static routing in app.js
// router.get('/stylesheets/style.css', function(req, res, next){
//   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
// });

module.exports = router;
