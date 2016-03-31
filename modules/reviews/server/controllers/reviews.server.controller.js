'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Review = mongoose.model('Review'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a review
 */
exports.create = function (req, res) {
  var review = new Review(req.body);
  review.user = req.user;

  review.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(review);
    }
  });
};

/**
 * Show the current review
 */
exports.read = function (req, res) {
  res.json(req.review);
};

/**
 * Update a review
 */
exports.update = function (req, res) {
  var review = req.review;

  if(req.review.user.id === req.user.id){
      review.title = req.body.title;
      review.content = req.body.content;
      review.status = req.body.status;
  }

  review.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(review);
    }
  });
};

/**
 * Delete a review
 */
exports.delete = function (req, res) {
  var review = req.review;

  review.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(review);
    }
  });
};

/**
 * List of Reviews
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
    var per_page = 10;
    if(req.query.itemsPerPage && req.query.itemsPerPage<=50){
        per_page = parseInt(req.query.itemsPerPage);
    }
  
    Review.find(query).sort('-created').
            skip((page-1)*per_page).limit(per_page).
            populate('user', 'displayName').exec(function (err, reviews) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
          Review.find(query)
            .distinct('_id')
            .count(function (err, count) {
              var result = [{
                 total : count,
                 reviews: reviews
              }];

              res.json(result);
        }); 
      }
    });
  
};

/**
* Paginate List review status public
**/
exports.listPublic = function(req, res){
 
    var query = {status:'public'};

    Review.find(query).sort('-created').limit(10).populate('user', 'displayName').exec(function(err, reviews) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(reviews);
        }
    });
};

/**
* Uuid List review
**/
exports.listUuid = function(req, res){
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var per_page =10;

    var query = '';
    query = {uuid: req.params.uuid, status: 'public'};

    Review.find(query).sort('-created').skip((page-1)*per_page).limit(per_page).populate('user', 'displayName').exec(function(err, reviews) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(reviews);
        }
    });
};

/**
* Paginate List review
**/
exports.reviewPaginate = function(req, res){
 
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var per_page =10;

    var query = '';
    if(req.user){
        query = {user:req.user};

        Review.find(query).sort('-created').skip((page-1)*per_page).limit(per_page).populate('user', 'displayName').exec(function(err, reviews) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(reviews);
            }
        });
    }else{
        // if user is not logged in empty result
        res.json({});
    }
};

/**
* count comments review
**/
exports.countComments = function(req, res){
 
    if(req.user){
        
        var d = new Date();
        d.setDate(d.getDate()-7);

        Review.aggregate(
          { $match: {'comments.created': {$gt: d}}},
          { $unwind : "$comments" },
          { $group : {
              _id: null,
              total : { $sum : 1 }
          } })
        .exec(function(err, totalComments) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(totalComments);
            }
        });

    }else{
        // if user is not logged in empty result
        res.json({});
    }
};

/**
* comments review
**/
exports.getComments = function(req, res){
 
    /*var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var per_page =10;*/

    if(req.user){
        
        var d = new Date();
        d.setDate(d.getDate()-7);

        Review.aggregate(
          { $match: {'comments.created': {$gt: d}}},
          { $project : { _id: 1, title : 1 , comments : 1 } },
          { $unwind : "$comments" },
          { $group : {
              _id: { comment: "$comments", title: "$title", reviewId: "$_id"}
          } },
          { $sort : { created : -1 } },
          { $limit : 10 })
        .exec(function(err, comments) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(comments);
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

        Review.update({ "_id": req.body.reviewId },
                     {$push: { "comments": comment }}).exec(function(err, numAffected) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json({message: 'Comentario añadido correctamente.'});
            }
        });
    }else{
        // if user is not logged in empty result
        res.json({});
    }
};

exports.removeComment = function(req, res){
 
    if(req.user && req.body.commentId){

        Review.update({ "_id": req.body.reviewId, "user":req.user },
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

exports.addRating = function(req, res){
 
    if(req.user && req.body.rate){

        var rating = {
            rate: req.body.rate,
            user: req.user
        };

        Review.update({ "_id": req.body.reviewId },
                     {$push: { "ratings": rating }}).exec(function(err, numAffected) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json({message: 'Valoración añadida correctamente.'});
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
exports.reviewByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Review is invalid'
    });
  }

  Review.findById(id).populate('user', 'displayName')
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
