'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');
  
module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./reviews.server.routes.js')(app);
  
  // Reviews collection routes
  app.route('/api/admin/reviews').all(adminPolicy.isAllowed)
    .get(admin.list);
  
  // Single user routes
  app.route('/api/admin/reviews/:reviewId')
    .get(adminPolicy.isAllowed, admin.read);
    
  app.route('/api/admin/reviews/setStatus').all(adminPolicy.isAllowed)
    .post(admin.setStatus);
    
  app.route('/api/admin/reviews/removeComment').all(adminPolicy.isAllowed)
    .post(admin.removeComment);
    
  app.route('/api/admin/reviews/updateComment').all(adminPolicy.isAllowed)
    .post(admin.updateComment);

  // Finish by binding the review middleware
  app.param('reviewId', admin.reviewByID);
};
