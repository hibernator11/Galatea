'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');
  
module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./publications.server.routes.js')(app);
  
  // Publications collection routes
  app.route('/api/admin/publications').all(adminPolicy.isAllowed)
    .get(admin.list);
  
  // Single user routes
  app.route('/api/admin/publications/:publicationId')
    .get(adminPolicy.isAllowed, admin.read);
    
  app.route('/api/admin/publications/setStatus').all(adminPolicy.isAllowed)
    .post(admin.setStatus);
    
  app.route('/api/admin/publications/removeComment').all(adminPolicy.isAllowed)
    .post(admin.removeComment);
    
  app.route('/api/admin/publications/updateComment').all(adminPolicy.isAllowed)
    .post(admin.updateComment);

  // Finish by binding the publication middleware
  app.param('publicationId', admin.publicationByID);
};
