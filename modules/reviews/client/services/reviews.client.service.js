'use strict';

//Booklists service used for communicating with the categories REST endpoints
angular.module('reviews').factory('Reviews', ['$resource',
  function ($resource) {
    return $resource('api/reviews/:reviewId', {
      reviewId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Reviews service
angular.module('reviews.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/admin/reviews/:reviewId', {
      reviewId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
