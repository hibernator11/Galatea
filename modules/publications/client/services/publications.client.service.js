'use strict';

//Publications service used for communicating with the categories REST endpoints
angular.module('publications').factory('Publications', ['$resource',
  function ($resource) {
    return $resource('api/publications/:publicationId', {
      publicationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Publications service
angular.module('publications.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/admin/publications/:publicationId', {
      publicationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
