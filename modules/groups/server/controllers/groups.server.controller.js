'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Group = mongoose.model('Group'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a group
 */
exports.create = function (req, res) {
  var group = new Group(req.body);
  group.user = req.user;

  group.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(group);
    }
  });
};

/**
 * Show the current group
 */
exports.read = function (req, res) {
  res.json(req.group);
};

/**
 * Update a group
 */
exports.update = function (req, res) {
  var group = req.group;

  if(req.group.user.id === req.user.id){
      group.title = req.body.title;//TODO revisarr
      group.content = req.body.content;
      group.status = req.body.status;
      group.comments = req.body.comments;
      group.ratings = req.body.ratings;
  }else{
      group.ratings = req.body.ratings;
      group.comments = req.body.comments;
      group.followers = req.body.followers;
  }

  group.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(group);
    }
  });
};

/**
 * Delete a group
 */
exports.delete = function (req, res) {
  var group = req.group;

  group.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(group);
    }
  });
};

/**
 * List of Groups
 */
exports.list = function (req, res) {

  var query = '';
  if(req.user){
    query = {user:req.user};

    Group.find(query).sort('-created').populate('user', 'displayName').exec(function (err, groups) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(groups);
      }
    });
  }else{
    // if user is not logged in empty result
    res.json({});
  }
};

/**
* Paginate List group status public
**/
exports.listPublic = function(req, res){
 
    var query = {status:'public', type:'obra'};

    Group.find(query).sort('-created').limit(10).populate('user', 'displayName').exec(function(err, groups) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(groups);
        }
    });
};


/**
* Paginate List group
**/
exports.groupPaginate = function(req, res){
 
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var per_page =10;

    var query = '';
    if(req.user){
        query = {user:req.user};

        Group.find(query).sort('-created').skip((page-1)*per_page).limit(per_page).populate('user', 'displayName').exec(function(err, groups) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(groups);
            }
        });
    }else{
        // if user is not logged in empty result
        res.json({});
    }
};


/**
 * Book middleware
 */
exports.groupByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Group is invalid'
    });
  }

  Group.findById(id).populate('user', 'displayName')
                     .populate('comments.user', 'displayName profileImageURL').exec(function (err, group) {
    if (err) {
      return next(err);
    } else if (!group) {
      return res.status(404).send({
        message: 'No book with that identifier has been found'
      });
    }
    req.group = group;
    next();
  });
};
