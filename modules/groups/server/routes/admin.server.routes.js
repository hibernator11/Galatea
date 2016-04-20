'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');
  
module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./groups.server.routes.js')(app);
  
  // groups collection routes
  app.route('/api/admin/groups').all(adminPolicy.isAllowed)
    .get(admin.list);
  
  // Single user routes
  app.route('/api/admin/groups/:groupId')
    .get(adminPolicy.isAllowed, admin.read);
    
  app.route('/api/admin/groups/setStatus').all(adminPolicy.isAllowed)
    .post(admin.setStatus);    
    
  app.route('/api/admin/groups/removeComment').all(adminPolicy.isAllowed)
    .post(admin.removeComment);
    
  app.route('/api/admin/groups/updateComment').all(adminPolicy.isAllowed)
    .post(admin.updateComment);
    
  // Groups setStatus member
  app.route('/api/admin/groups/setStatusMember').all(adminPolicy.isAllowed)
     .post(admin.setStatusMember);          
     
  // Groups remove member
  app.route('/api/admin/groups/removeMember').all(adminPolicy.isAllowed)
     .post(admin.removeMember);
     
  // Groups add guest member
  app.route('/api/admin/groups/addGuestMember').all(adminPolicy.isAllowed)
     .post(admin.addGuestMember);     

  // Finish by binding the group middleware
  app.param('groupId', admin.groupByID);
};
