'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');
  
module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./booklists.server.routes.js')(app);
  
  // booklists collection routes
  app.route('/api/admin/booklists').all(adminPolicy.isAllowed)
    .get(admin.list);
  
  // Single user routes
  app.route('/api/admin/booklists/:booklistId')
    .get(adminPolicy.isAllowed, admin.read);
    
  app.route('/api/admin/booklists/setStatus').all(adminPolicy.isAllowed)
    .post(admin.setStatus);    
    
  app.route('/api/admin/booklists/removeComment').all(adminPolicy.isAllowed)
    .post(admin.removeComment);
    
  app.route('/api/admin/booklists/updateComment').all(adminPolicy.isAllowed)
    .post(admin.updateComment);

  // Finish by binding the booklist middleware
  app.param('booklistId', admin.booklistByID);
};
