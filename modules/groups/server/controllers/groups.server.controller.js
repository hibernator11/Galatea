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
        group.name = req.body.name;
        group.content = req.body.content;
        group.status = req.body.status;
      
        group.save(function (err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.json(group);
          }
        });
    }else{
        return res.status(400).send({
            message: 'El grupo no se puede modificar.'
        });
    }
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
    if(req.query.status){
        query = {status:'public'};
    }
    else if(req.user){
        query = {user:req.user};
    }
    
    var page = 1;
    if(req.query.page){
        page = req.query.page;
    }
    var per_page =10;
  
    Group.find(query).sort('-created').
            skip((page-1)*per_page).limit(per_page).
            populate('user', 'displayName').exec(function (err, groups) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
          
          Group.find(query)
            .distinct('_id')
            .count(function (err, count) {
              var result = [{
                 total : count,
                 groups: groups
              }];

          res.json(result);
        }); 
      }
    });
};

/**
* Paginate List group status public
**/
exports.listPublic = function(req, res){
 
    var query = {status:'public', type:'obra'};

    Group.find(query).sort('-created').limit(6).populate('user', 'displayName').exec(function(err, groups) {
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
* add comment group
**/
exports.addComment = function(req, res){
 
    if(req.user && req.body.message){

        var comment = {
            content: req.body.message,
            user: req.user
        };

        Group.update({ "_id": req.body.groupId },
                     {$push: { "comments": comment }}).exec(function(err, numAffected) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json({message: 'Comentario añadido correctamente. El administrador revisará el comentario y en breve estará visible.'});
            }
        });
    }else{
        // if user is not logged in empty result
        res.json({});
    }
};

// user try to join a group
exports.addPendingMember = function(req, res){
 
    var groupId = req.body.groupId;
    
    if(req.user && req.body.groupId){
        
        var member = {
                user: req.user._id,
                status: 'pendiente'
        }; 

        Group.update({ "_id": groupId },
                     {$push: { "members": member }}).exec(function(err, numAffected) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json({message: 'Solicitud enviada correctamente. El administrador debe aceptar la solicitud.'});
            }
        });
    }else{
        // if user is not logged in empty result
        res.json({});
    }
};

// group admin add guest user
exports.addGuestMember = function(req, res){
 
    var groupId = req.body.groupId;
    var userId = req.body.userId;
    
    if(req.user && req.body.groupId){
        
        var member = {
                user: userId,
                status: 'invitado'
        }; 

        Group.update({ "_id": groupId , "user":req.user},
                     {$push: { "members": member }}).exec(function(err, numAffected) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                Group.findById(groupId).populate('user', 'displayName')
                    .populate('comments.user', 'displayName profileImageURL')
                    .populate('members.user', '_id displayName profileImageURL').exec(function (err, group) {
                    if (err) {
                      return next(err);
                    } else if (!group) {
                      return res.status(404).send({
                        message: 'No group with that identifier has been found'
                      });
                    }
                    res.json(group);
                });
            }
        });
    }else{
        // if user is not logged in empty result
        res.json({});
    }
};

exports.activatePublicMember = function(req, res){
 
    if(req.user && req.body.groupId && req.body.userId){
        
        console.log('req.body.userId:' + req.body.userId);
        
        Group.update(
            {'_id': req.body.groupId, 'members.user': req.body.userId}, 
            {'$set': {
                'members.$.status': 'activo'
            }},
            function(err, numAffected) {
                if (err) {
                    return next(err);
                } else {
                     
                    Group.findById(req.body.groupId).populate('user', 'displayName')
                        .populate('comments.user', 'displayName profileImageURL')
                        .populate('members.user', '_id displayName profileImageURL').exec(function (err, group) {
                        if (err) {
                          return next(err);
                        } else if (!group) {
                          return res.status(404).send({
                            message: 'No group with that identifier has been found'
                          });
                        }
                        res.json(group);
                    });
                }
            }
        );
    }else{
        // if user is not logged in empty result
        res.json({});
    }
};

exports.setStatusMember = function(req, res){
 
    if(req.user && req.body.groupId && req.body.userId && req.body.status){
        
        console.log('req.body.userId:' + req.body.userId);
        
        Group.update(
            {'_id': req.body.groupId, 'members.user': req.body.userId, 'user':req.user}, 
            {'$set': {
                'members.$.status': req.body.status
            }},
            function(err, numAffected) {
                if (err) {
                    return next(err);
                } else {
                     
                    Group.findById(req.body.groupId).populate('user', 'displayName')
                        .populate('comments.user', 'displayName profileImageURL')
                        .populate('members.user', '_id displayName profileImageURL').exec(function (err, group) {
                        if (err) {
                          return next(err);
                        } else if (!group) {
                          return res.status(404).send({
                            message: 'No group with that identifier has been found'
                          });
                        }
                        res.json(group);
                    });
                }
            }
        );
    }else{
        // if user is not logged in empty result
        res.json({});
    }
};

// group admin add guest user
exports.removeMember = function(req, res){
 
    if(req.user && req.body.groupId){
        
        Group.update({ '_id': req.body.groupId , 'members.user': req.body.userId, 'user':req.user},
                     {$pull: { 'members': {'user': req.body.userId}}}).exec(function(err, numAffected) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                Group.findById(req.body.groupId).populate('user', 'displayName')
                    .populate('comments.user', 'displayName profileImageURL')
                    .populate('members.user', '_id displayName profileImageURL').exec(function (err, group) {
                    if (err) {
                      return next(err);
                    } else if (!group) {
                      return res.status(404).send({
                        message: 'No group with that identifier has been found'
                      });
                    }
                    res.json(group);
                });
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
                    .populate('comments.user', 'displayName profileImageURL')
                    .populate('members.user', '_id displayName profileImageURL').exec(function (err, group) {
    if (err) {
      return next(err);
    } else if (!group) {
      return res.status(404).send({
        message: 'No group with that identifier has been found'
      });
    }
    req.group = group;
    next();
  });
};
