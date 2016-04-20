'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Review = mongoose.model('Review'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current review
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * List of Reviews
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
    
    Review.find(query).sort(order).
            skip((page-1)*per_page).limit(per_page).
            populate('user', 'displayName profileImageURL').exec(function (err, reviews) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
          Review.find(query)
            .distinct('_id')
            .count(function (err, count) {
              var result = {
                 total : count,
                 reviews: reviews
              };

              res.json(result);
        }); 
      }
    });
};

exports.removeComment = function(req, res){
 
    if(req.body.reviewId && req.body.commentId){

        Review.update({ "_id": req.body.reviewId },
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
 
    if(req.body.reviewId && req.body.commentId){

        Review.update({ "_id": req.body.reviewId, "comments._id": req.body.commentId },
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
 
    Review.update({ "_id": req.body.reviewId },
                 {"status": req.body.status}).exec(function(err, numAffected) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json({message: 'Reseña modificada correctamente.'});
        }
    });
};

/**
 * Review middleware
 */
exports.reviewByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Review is invalid'
    });
  }

  Review.findById(id).populate('user', 'displayName profileImageURL')
                     .populate('comments.user', 'displayName profileImageURL').exec(function (err, review) {
    if (err) {
      return next(err);
    } else if (!review) {
      return res.status(404).send({
        message: 'No book with that identifier has been found'
      });
    }
    req.review = review;
    next();
  });
};