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
      resources: '/api/publications',
      permissions: '*'
    }, {
      resources: '/api/publications/:publicationId',
      permissions: '*'
    }, {
      resources: '/api/publications/news/count',
      permissions: ['get']
    }, {
      resources: '/api/publications/count',
      permissions: ['get']
    }, {
      resources: '/api/comments/publications',
      permissions: ['get']
    }, {
      resources: '/api/comments/publications/results/:results',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/publications',
      permissions: ['get', 'post']
    }, {
      resources: '/api/publications/user',
      permissions: ['get']
    }, {
      resources: '/api/publications/:publicationId',
      permissions: ['get']
    }, {
      resources: '/api/publications/addComment',
      permissions: ['post']
    }, {
      resources: '/api/publications/removeComment',
      permissions: ['post']
    }, {
      resources: '/api/publications/addRating',
      permissions: ['post']
    }, {
      resources: '/api/comments/publications/results/:results',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/publications',
      permissions: ['get']
    }, {
      resources: '/api/publications/:publicationId',
      permissions: ['get']
    }, {
      resources: '/api/comments/publications/results/:results',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Categories Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If a publication is being processed and the current user created it then allow any manipulation
  if (req.publication && req.user /*&& req.publication.user.id === req.user.id*/) {
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
