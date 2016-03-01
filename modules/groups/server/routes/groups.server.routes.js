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

  // Groups paginate
  app.route('/api/groups/page/:page')
     .get(groups.groupPaginate);
     
  // Groups add comment
  app.route('/api/groups/addComment')
     .post(groups.addComment);
     
  // Groups activate member
  app.route('/api/groups/activatePublicMember')
     .post(groups.activatePublicMember);     
     
  // Groups setStatus member
  app.route('/api/groups/setStatusMember')
     .post(groups.setStatusMember);          
     
  // Groups remove member
  app.route('/api/groups/removeMember')
     .post(groups.removeMember);             
     
  // Groups add pending member
  app.route('/api/groups/addPendingMember')
     .post(groups.addPendingMember);
     
  // Groups add guest member
  app.route('/api/groups/addGuestMember')
     .post(groups.addGuestMember);

  // Groups public
  app.route('/api/groups/public')
     .get(groups.listPublic);

  // Single group routes
  app.route('/api/groups/:groupId').all(groupsPolicy.isAllowed)
    .get(groups.read)
    .put(groups.update)
    .delete(groups.delete);

  // Finish by binding the group middleware
  app.param('groupId', groups.groupByID);
};
