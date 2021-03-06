'use strict';

/**
 * Module dependencies.
 */
var groupsPolicy = require('../policies/groups.server.policy'),
  groups = require('../controllers/groups.server.controller');

module.exports = function (app) {
  // Groups collection routes
  app.route('/api/groups').all(groupsPolicy.isAllowed)
    .get(groups.list)
    .post(groups.create);

  // Groups news count
  app.route('/api/groups/news/count').all(groupsPolicy.isAllowed)
     .get(groups.countNewGroups);   
     
  // Groups comments paginate
  app.route('/api/comments/groups/results/:results').all(groupsPolicy.isAllowed)
     .get(groups.getComments);
     
  // Groups comments total
  app.route('/api/comments/groups').all(groupsPolicy.isAllowed)
     .get(groups.countComments);
     
  // Groups add comment
  app.route('/api/groups/addComment').all(groupsPolicy.isAllowed)
     .post(groups.addComment);
  app.route('/api/groups/removeComment').all(groupsPolicy.isAllowed)
     .post(groups.removeComment);
     
  // Groups activate member
  app.route('/api/groups/activatePublicMember').all(groupsPolicy.isAllowed)
     .post(groups.activatePublicMember);     
     
  // Groups setStatus member
  app.route('/api/groups/setStatusMember').all(groupsPolicy.isAllowed)
     .post(groups.setStatusMember);          
     
  // Groups remove member
  app.route('/api/groups/removeMember').all(groupsPolicy.isAllowed)
     .post(groups.removeMember);
     
  // Groups add pending member
  app.route('/api/groups/addPendingMember').all(groupsPolicy.isAllowed)
     .post(groups.addPendingMember);
     
  // Groups add guest member
  app.route('/api/groups/addGuestMember').all(groupsPolicy.isAllowed)
     .post(groups.addGuestMember);

  // Groups by user paginate
  app.route('/api/groups/user').all(groupsPolicy.isAllowed)
     .get(groups.listByUser);     

  // Single group routes
  app.route('/api/groups/:groupId').all(groupsPolicy.isAllowed)
    .get(groups.read)
    .put(groups.update)
    .delete(groups.delete);

  // Finish by binding the group middleware
  app.param('groupId', groups.groupByID);
};
