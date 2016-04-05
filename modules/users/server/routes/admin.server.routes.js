'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');

module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./users.server.routes.js')(app);
  
    // Users news count
  app.route('/api/users/news/count')
    .get(adminPolicy.isAllowed, admin.countNewUsers);

    // Users news count
  app.route('/api/users/count')
    .get(adminPolicy.isAllowed, admin.countUsers);

  // Users collection routes
  app.route('/api/users')
    .get(adminPolicy.isAllowed, admin.list);
    
    
  // Single user routes
  app.route('/api/users/:userId')
    .get(adminPolicy.isAllowed, admin.read)
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
