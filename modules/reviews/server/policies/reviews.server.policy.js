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
      resources: '/api/reviews',
      permissions: '*'
    }, {
      resources: '/api/reviews/:reviewId',
      permissions: '*'
    }, {
      resources: '/api/reviews/news/count',
      permissions: ['get']
    }, {
      resources: '/api/reviews/count',
      permissions: ['get']
    }, {
      resources: '/api/comments/reviews',
      permissions: ['get']
    }, {
      resources: '/api/comments/reviews/results/:results',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/reviews',
      permissions: ['get', 'post']
    }, {
      resources: '/api/reviews/user',
      permissions: ['get']
    }, {
      resources: '/api/reviews/:reviewId',
      permissions: ['get']
    }, {
      resources: '/api/reviews/addComment',
      permissions: ['post']
    }, {
      resources: '/api/reviews/removeComment',
      permissions: ['post']
    }, {
      resources: '/api/reviews/addRating',
      permissions: ['post']
    }, {
      resources: '/api/reviews/uuid/:uuid',
      permissions: ['get']
    }, {
      resources: '/api/comments/reviews/results/:results',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/reviews',
      permissions: ['get']
    }, {
      resources: '/api/reviews/:reviewId',
      permissions: ['get']
    }, {
      resources: '/api/reviews/uuid/:uuid',
      permissions: ['get']
    }, {
      resources: '/api/comments/reviews/results/:results',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Categories Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If a review is being processed and the current user created it then allow any manipulation
  if (req.review && req.user /*&& req.review.user.id === req.user.id*/) {
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
