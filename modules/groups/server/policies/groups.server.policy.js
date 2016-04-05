'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Categories Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/groups',
      permissions: '*'
    }, {
      resources: '/api/groups/:groupId',
      permissions: '*'
    }, {
      resources: '/api/groups/news/count',
      permissions: ['get']
    }, {
      resources: '/api/comments/groups',
      permissions: ['get']
    }, {
      resources: '/api/comments/groups/results/:results',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/groups',
      permissions: ['get', 'post']
    }, {
      resources: '/api/groups/:groupId',
      permissions: ['get']
    }, {
      resources: '/api/groups/addComment',
      permissions: ['post']
    }, {
      resources: '/api/groups/removeComment',
      permissions: ['post']
    }, {
      resources: '/api/groups/activatePublicMember',
      permissions: ['post']
    }, {
      resources: '/api/groups/setStatusMember',
      permissions: ['post']
    }, {
      resources: '/api/groups/removeMember',
      permissions: ['post']
    }, {
      resources: '/api/groups/addPendingMember',
      permissions: ['post']
    }, {
      resources: '/api/groups/addGuestMember',
      permissions: ['post']
    }, {
      resources: '/api/groups/public',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/groups',
      permissions: ['get']
    }, {
      resources: '/api/groups/:groupId',
      permissions: ['get']
    }, {
      resources: '/api/groups/public',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Categories Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If a group is being processed and the current user created it then allow any manipulation
  if (req.group && req.user /*&& req.group.user.id === req.user.id*/) {
    return next();
  }

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
