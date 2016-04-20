'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Booklist = mongoose.model('Booklist'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current booklist
 */
exports.read = function (req, res) {
  res.json(req.booklist);
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
    
    Booklist.find(query).sort(order).
            skip((page-1)*per_page).limit(per_page).
            populate('user', 'displayName profileImageURL').exec(function (err, booklists) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
          Booklist.find(query)
            .distinct('_id')
            .count(function (err, count) {
              var result = {
                 total : count,
                 booklists: booklists
              };

              res.json(result);
        }); 
      }
    });
};

exports.removeComment = function(req, res){
 
    if(req.body.booklistId && req.body.commentId){

        Booklist.update({ "_id": req.body.booklistId },
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
 
    if(req.body.booklistId && req.body.commentId){

        Booklist.update({ "_id": req.body.booklistId, "comments._id": req.body.commentId },
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
 
    Booklist.update({ "_id": req.body.booklistId },
                 {"status": req.body.status}).exec(function(err, numAffected) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json({message: 'Lista de obras modificada correctamente.'});
        }
    });
};

/**
 * Booklist middleware
 */
exports.booklistByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'La lista de obras es incorreca'
    });
  }

  Booklist.findById(id).populate('user', 'displayName profileImageURL')
                     .populate('comments.user', 'displayName profileImageURL').exec(function (err, booklist) {
    if (err) {
      return next(err);
    } else if (!booklist) {
      return res.status(404).send({
        message: 'No se ha encontrado ninguna lista con el identificador recibido'
      });
    }

    req.booklist = booklist;
    next();
  });
};