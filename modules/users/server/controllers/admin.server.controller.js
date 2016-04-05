'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;

  //For security purposes only merge these parameters
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.displayName = user.firstName + ' ' + user.lastName;
  user.roles = req.body.roles;
  user.status = req.body.status;

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;

  user.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
  
    var query = '{}';
  
    var page = 1;
    if(req.query.page){
        page = req.query.page;
    }
    var per_page = 10;
    if(req.query.itemsPerPage && req.query.itemsPerPage<=50){
        per_page = parseInt(req.query.itemsPerPage);
    }
  
    User.find(query, '-salt -password')
        .skip((page-1)*per_page).limit(per_page)
        .sort('-created')
        .populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};

/**
* count new users
**/
exports.countNewUsers = function(req, res){
 
    var d = new Date();
    d.setDate(d.getDate()-7);

    User.aggregate(
      { $match: {'created': {$gt: d}, 'status': 'activo'}},
      { $group : {
          _id: null,
          total : { $sum : 1 }
      } })
    .exec(function(err, newUsers) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(newUsers);
        }
    });
};

/**
* count users
**/
exports.countUsers = function(req, res){
 
    var d = new Date();
    d.setDate(d.getDate()-7);

    User.aggregate(
      { $group : {
          _id: null,
          total : { $sum : 1 }
      } })
    .exec(function(err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(users);
        }
    });
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findById(id, '-salt -password').exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load user ' + id));
    }

    req.model = user;
    next();
  });
};
