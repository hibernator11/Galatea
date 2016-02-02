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
      review.comments = req.body.comments;
      review.ratings = req.body.ratings;
  }else{
      review.ratings = req.body.ratings;
      review.comments = req.body.comments;
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
  if(req.user){
    query = {user:req.user};

    Review.find(query).sort('-created').populate('user', 'displayName').exec(function (err, reviews) {
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
