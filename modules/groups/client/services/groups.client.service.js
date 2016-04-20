'use strict';

//Groups service used for communicating with the categories REST endpoints
angular.module('groups').factory('Groups', ['$resource',
  function ($resource) {
    return $resource('api/groups/:groupId', {
      groupId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Groups service
angular.module('groups.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/admin/groups/:groupId', {
      groupId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
