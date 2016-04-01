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
      resources: '/api/booklists',
      permissions: '*'
    }, {
      resources: '/api/booklists/:booklistId',
      permissions: '*'
    }, {
      resources: '/api/comments/booklists',
      permissions: ['get']
    }, {
      resources: '/api/comments/booklists/results/:results',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/booklists',
      permissions: ['get', 'post']
    }, {
      resources: '/api/booklists/:booklistId',
      permissions: ['get']
    }, {
      resources: '/api/booklists/addComment',
      permissions: ['post']
    }, {
      resources: '/api/booklists/removeComment',
      permissions: ['post']
    }, {
      resources: '/api/booklists/addRating',
      permissions: ['post']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/booklists',
      permissions: ['get']
    }, {
      resources: '/api/booklists/:booklistId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Categories Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If a booklist is being processed and the current user created it then allow any manipulation
  if (req.booklist && req.user /*&& req.booklist.user.id === req.user.id*/) {
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
