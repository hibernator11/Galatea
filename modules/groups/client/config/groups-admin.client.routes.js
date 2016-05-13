'use strict';

// Setting up route
angular.module('groups.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.groups', {
        url: '/groups',
        templateUrl: 'modules/groups/client/views/admin/dashboard.list-groups.client.view.html',
        controller: 'GroupListController'
      })
      .state('admin.group', {
        url: '/groups/:groupId',
        templateUrl: 'modules/groups/client/views/admin/dashboard.view-group.client.view.html',
        controller: 'GroupAdminController',
        resolve: {
          groupResolve: ['$stateParams', 'Groups', function ($stateParams, Groups) {
            return Groups.get({
              groupId: $stateParams.groupId
            });
          }]
        }
      })
      .state('admin.group-edit', {
        url: '/groups/:groupId/edit',
        templateUrl: 'modules/groups/client/views/admin/dashboard.edit-group.client.view.html',
        controller: 'GroupAdminController',
        resolve: {
          groupResolve: ['$stateParams', 'Groups', function ($stateParams, Groups) {
            return Groups.get({
              groupId: $stateParams.groupId
            });
          }]
        }
      });
  }
]);
