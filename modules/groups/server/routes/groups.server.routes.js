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
     
  // Groups add pending member
  app.route('/api/groups/addPendingMember')
     .post(groups.addPendingMember);     

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
