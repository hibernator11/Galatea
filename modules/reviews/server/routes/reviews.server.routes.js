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

  // Reviews paginate
  app.route('/api/reviews/page/:page').all(reviewsPolicy.isAllowed)
     .get(reviews.reviewPaginate);

  // Reviews public
  app.route('/api/reviews/public').all(reviewsPolicy.isAllowed)
     .get(reviews.listPublic);
     
       // Reviews add comment
  app.route('/api/reviews/addComment').all(reviewsPolicy.isAllowed)
    .post(reviews.addComment);

  // Single review routes
  app.route('/api/reviews/:reviewId').all(reviewsPolicy.isAllowed)
    .get(reviews.read)
    .put(reviews.update)
    .delete(reviews.delete);
    
  // Finish by binding the review middleware
  app.param('reviewId', reviews.reviewByID);
};
