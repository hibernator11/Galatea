'use strict';

// Setting up route
angular.module('groups').config(['$stateProvider',
  function ($stateProvider) {
    // groups state routing
    $stateProvider
      .state('groups', {
        abstract: true,
        url: '/groups',
        template: '<ui-view/>'
      })
      .state('groups.list', {
        url: '',
        templateUrl: 'modules/groups/client/views/list-groups.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('groups.search', {
        url: '/search',
        templateUrl: 'modules/groups/client/views/pagination-groups.client.view.html',
        /*data: {
          roles: ['user', 'admin']
        }*/
      })
      .state('groups.create', {
        url: '/create',
        templateUrl: 'modules/groups/client/views/create-group.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('groups.view', {
        url: '/:groupId',
        templateUrl: 'modules/groups/client/views/view-group.client.view.html',
        /*data: {
          roles: ['user', 'admin']
        }*/
      })
      .state('groups.edit', {
        url: '/:groupId/edit',
        templateUrl: 'modules/groups/client/views/edit-group.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
