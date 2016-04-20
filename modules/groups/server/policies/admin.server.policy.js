'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Admin Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/admin/groups',
      permissions: '*'
    },{
      resources: '/api/admin/groups/:groupId',
      permissions: 'get'
    },{
      resources: '/api/admin/groups/setStatus',
      permissions: 'post'
    },{
      resources: '/api/admin/groups/removeComment',
      permissions: 'post'
    },{
      resources: '/api/admin/groups/updateComment',
      permissions: 'post'
    },{
      resources: '/api/admin/groups/setStatusMember',
      permissions: ['post']
    },{
      resources: '/api/admin/groups/addGuestMember',
      permissions: ['post']
    }, {
      resources: '/api/admin/groups/removeMember',
      permissions: ['post']
    }]
  }]);
};

/**
 * Check If Admin Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred.
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
