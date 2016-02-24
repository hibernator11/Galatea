'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

/**
 * User like
 */
exports.like = function (req, res) {
      // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    var word = req.params.word;       
    User.find({'displayName' : new RegExp(word, 'i')}).limit(15).select('_id displayName profileImageURL').exec(function(err, words){
        if (err) {res.send(err);}
            res.json(words);
        });
  } else {
    res.status(400).send({
      message: 'El usuario no ha realizado login'
    });
  }
    
};


