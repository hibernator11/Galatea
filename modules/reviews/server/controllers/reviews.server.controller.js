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

  if(req.review.user.id === req.user.id || (req.user !== undefined && req.user !== null && req.user.roles.indexOf("admin") > 0)){
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

  if(review.user.id === req.user.id || (req.user !== undefined && req.user !== null && req.user.roles.indexOf("admin") > 0)){
    review.remove(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(review);
      }
    });
  }else{
      return res.status(403).send({
          message: 'No tiene permisos para borra la reseña'
      });
  }
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
    
    var query = {$and: []};
    
    query.$and.push({
        status: { $ne: "blocked" }}
    );
    
    if(req.query.text){
        query.$and.push({
            $text : { $search : req.query.text }} 
        );
    }
    if(req.query.status){
        query.$and.push({
            status: 'public'} // public/draft
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
* Paginate List reviews by user
**/
exports.listByUser = function(req, res){
 
var page = 1;
    if(req.query.page){
        page = req.query.page;
    }
    var per_page = 15;
    if(req.query.itemsPerPage && req.query.itemsPerPage<=100){
        per_page = parseInt(req.query.itemsPerPage);
    }
    
    var query = {$and: []};
    
    query.$and.push({
        user: req.user}
    );

    query.$and.push({
        status: { $ne: "blocked" }}
    );
    
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
* count new reviews
**/
exports.countNewReviews = function(req, res){
 
    var d = new Date();
    d.setDate(d.getDate()-7);

    Review.aggregate(
      { $match: {'created': {$gt: d}, 'status': 'public'}},
      { $group : {
          _id: null,
          total : { $sum : 1 }
      } })
    .exec(function(err, newReviews) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(newReviews);
        }
    });
};

/**
* count reviews
**/
exports.countReviews = function(req, res){
 
    Review.aggregate(
      { $group : {
          _id: null,
          total : { $sum : 1 }
      } })
    .exec(function(err, reviews) {
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
* count comments review
**/
exports.countComments = function(req, res){
 
    var d = new Date();
    d.setDate(d.getDate()-7);

    Review.aggregate(
      { $match: {'comments.created': {$gt: d}}},
      { $unwind : "$comments" },
      { $match: {'comments.created': {$gt: d}}},
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
};

/**
* comments review
**/
exports.getComments = function(req, res){
    var limit = 10;
    
    if(req.params.results){
        limit = req.params.results;
    }
    
    var d = new Date();
    d.setDate(d.getDate()-7);

    Review.aggregate(
      { $match: {'comments.created': {$gt: d}}},
      { $project : { _id: 1, title : 1 , comments : 1, user: 1 } },
      { $unwind : "$comments" },
      { $match: {'comments.created': {$gt: d}}},
      { $group : {
          _id: { comment: "$comments", title: "$title", reviewId: "$_id", user: "$user"}
      } },
      { $lookup: {from: 'users', localField: '_id.comment.user', foreignField: '_id', as: 'user_info'} } ,
      { $project : { _id: 1, title : 1 , comments : 1, user: 1, 'user_info.displayName':1, 'user_info.profileImageURL':1 } },
      { $sort : { '_id.comment.created' : -1 } },
      { $limit : limit*1 })
    .exec(function(err, comments) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(comments);
        }
    });
};

/**
* add comment group
**/
exports.addComment = function(req, res){
 
    if(req.user && req.body.message){

        var comment = {
            content: req.body.message,
            user: req.user,
            created: new Date()
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
 * Review middleware
 */
exports.reviewByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'La reseña no es correcta'
    });
  }

  Review.findById(id).populate('user', 'displayName profileImageURL')
                     .populate('comments.user', 'displayName profileImageURL').exec(function (err, review) {
    if (err) {
      return next(err);
    } else if (!review) {
      return res.status(404).send({
        message: 'No se ha encontrado ninguna reseña con el identificador recibido'
      });
    } else if (review.status === "blocked" && (req.user === undefined || req.user === null || req.user.roles.indexOf("admin") <= 0)) {
      return res.status(403).send({
        message: 'La reseña se encuentra bloqueada por el administrador'
      });
    }
    req.review = review;
    next();
  });
};
