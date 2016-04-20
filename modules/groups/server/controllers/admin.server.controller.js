'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Group = mongoose.model('Group'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current group
 */
exports.read = function (req, res) {
  res.json(req.group);
};

/**
 * List of Booklists
 */
exports.list = function (req, res) {

    var page = 1;
    if(req.query.page){
        page = req.query.page;
    }
    var per_page = 15;
    if(req.query.itemsPerPage && req.query.itemsPerPage<=100){
        per_page = parseInt(req.query.itemsPerPage);
    }
    
    var query = {};
    
    if(req.query.text || req.query.status){
        query = {$and: []};
    }
    
    if(req.query.text){
        query.$and.push({
            $text : { $search : req.query.text }} 
        );
    }
    if(req.query.status){
        query.$and.push({
            status: req.query.status} 
        );
    }
    
    var order = '-created';
    if(req.query.order && req.query.order === 'asc'){
        order = '+created';
    }
    
    Group.find(query).sort(order).
            skip((page-1)*per_page).limit(per_page).
            populate('user', 'displayName profileImageURL').exec(function (err, groups) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
          Group.find(query)
            .distinct('_id')
            .count(function (err, count) {
              var result = {
                 total : count,
                 groups: groups
              };

              res.json(result);
        }); 
      }
    });
};

exports.removeComment = function(req, res){
 
    if(req.body.groupId && req.body.commentId){

        Group.update({ "_id": req.body.groupId },
                     {$pull: { "comments": {'_id': req.body.commentId} }}).exec(function(err, numAffected) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json({message: 'Comentario eliminado correctamente.'});
            }
        });
    }else{
        // if user is not logged in empty result
        res.json({});
    }
};

exports.updateComment = function(req, res){
 
    if(req.body.groupId && req.body.commentId){

        Group.update({ "_id": req.body.groupId, "comments._id": req.body.commentId },
                     {$set: { "comments.$.content": req.body.data }}).exec(function(err, numAffected) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json({message: 'Comentario modificado correctamente.'});
            }
        });
    }else{
        // if user is not logged in empty result
        res.json({});
    }
};

exports.setStatus = function(req, res){
 
    Group.update({ "_id": req.body.groupId },
                 {"status": req.body.status}).exec(function(err, numAffected) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json({message: 'Grupo modificado correctamente.'});
        }
    });
};

exports.setStatusMember = function(req, res){
 
    Group.update(
        {'_id': req.body.groupId, 'members.user': req.body.userId}, 
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
                        message: 'No se ha encontrado ningún grupo con el identificador recibido'
                      });
                    }
                    res.json(group);
                });
            }
        }
    );
};

// group admin add guest user
exports.removeMember = function(req, res){
 
    Group.update({ '_id': req.body.groupId , 'members.user': req.body.userId},
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
                    message: 'No se ha encontrado ningún grupo con el identificador recibido'
                  });
                }
                res.json(group);
            });
        }
    });
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

        Group.update({ "_id": groupId},
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

/**
 * Booklist middleware
 */
exports.groupByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'El grupo es incorreco'
    });
  }

  Group.findById(id).populate('user', 'displayName profileImageURL')
                     .populate('comments.user', 'displayName profileImageURL')
                     .populate('members.user', '_id displayName profileImageURL').exec(function (err, group) {
    if (err) {
      return next(err);
    } else if (!group) {
      return res.status(404).send({
        message: 'No se ha encontrado ningún grupo con el identificador recibido'
      });
    }

    req.group = group;
    next();
  });
};