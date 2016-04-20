'use strict';

/**
 * Module dependencies.
 */
var reviewsPolicy = require('../policies/reviews.server.policy'),
  reviews = require('../controllers/reviews.server.controller');

module.exports = function (app) {
  // Reviews collection routes
  app.route('/api/reviews').all(reviewsPolicy.isAllowed)
    .get(reviews.list)
    .post(reviews.create);
    
  // Reviews by uuid
  app.route('/api/reviews/uuid/:uuid').all(reviewsPolicy.isAllowed)
     .get(reviews.listUuid);
     
  // Reviews news count
  app.route('/api/reviews/news/count').all(reviewsPolicy.isAllowed)
     .get(reviews.countNewReviews);
     
  // Reviews count
  app.route('/api/reviews/count')
    .get(reviewsPolicy.isAllowed, reviews.countReviews);   
     
  // Reviews comments paginate
  app.route('/api/comments/reviews/results/:results').all(reviewsPolicy.isAllowed)
     .get(reviews.getComments);
     
  // Reviews comments total
  app.route('/api/comments/reviews').all(reviewsPolicy.isAllowed)
     .get(reviews.countComments);   

  // Reviews by user paginate
  app.route('/api/reviews/user').all(reviewsPolicy.isAllowed)
     .get(reviews.listByUser);
     
  // Reviews add comment
  app.route('/api/reviews/addRating').all(reviewsPolicy.isAllowed)
    .post(reviews.addRating);

  // Reviews add comment
  app.route('/api/reviews/addComment').all(reviewsPolicy.isAllowed)
    .post(reviews.addComment);
  app.route('/api/reviews/removeComment').all(reviewsPolicy.isAllowed)
     .post(reviews.removeComment);

  // Single review routes
  app.route('/api/reviews/:reviewId').all(reviewsPolicy.isAllowed)
    .get(reviews.read)
    .put(reviews.update)
    .delete(reviews.delete);
    
  // Finish by binding the review middleware
  app.param('reviewId', reviews.reviewByID);
};
