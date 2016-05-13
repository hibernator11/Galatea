'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Publication = mongoose.model('Publication'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current publication
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * List of Publications
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
            status: req.query.status} // public/draft
        );
    }
    
    var order = '-created';
    if(req.query.order && req.query.order === 'asc'){
        order = '+created';
    }
    
    Publication.find(query).sort(order).
            skip((page-1)*per_page).limit(per_page).
            populate('user', 'displayName profileImageURL').exec(function (err, publications) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
          Publication.find(query)
            .distinct('_id')
            .count(function (err, count) {
              var result = {
                 total : count,
                 publications: publications
              };

              res.json(result);
        }); 
      }
    });
};

exports.removeComment = function(req, res){
 
    if(req.body.publicationId && req.body.commentId){

        Publication.update({ "_id": req.body.publicationId },
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
 
    if(req.body.publicationId && req.body.commentId){

        Publication.update({ "_id": req.body.publicationId, "comments._id": req.body.commentId },
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
 
    Publication.update({ "_id": req.body.publicationId },
                 {"status": req.body.status}).exec(function(err, numAffected) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json({message: 'Publicación modificada correctamente.'});
        }
    });
};

/**
 * Publication middleware
 */
exports.publicationByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'La publicación es incorrecta'
    });
  }

  Publication.findById(id).populate('user', 'displayName profileImageURL')
                     .populate('comments.user', 'displayName profileImageURL').exec(function (err, publication) {
    if (err) {
      return next(err);
    } else if (!publication) {
      return res.status(404).send({
        message: 'No se ha encontrado ninguna publicación con el identificador recibido'
      });
    }
    req.publication = publication;
    next();
  });
};