'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.dashboard', {
      url: '/dashboard',
      templateUrl: 'modules/core/client/views/admin/dashboard.client.view.html',
      data: {
          roles: ['admin']
        }
      })
      .state('admin.comments', {
      url: '/comments',
      templateUrl: 'modules/core/client/views/admin/dashboard.comments.client.view.html',
      data: {
          roles: ['admin']
        }
      });
  }
]);
