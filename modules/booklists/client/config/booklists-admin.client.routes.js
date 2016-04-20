'use strict';

// Setting up route
angular.module('booklists.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.booklists', {
        url: '/booklists',
        templateUrl: 'modules/core/client/views/admin/booklists/dashboard.booklists.client.view.html',
        controller: 'BooklistListController'
      })
      .state('admin.booklist', {
        url: '/booklists/:booklistId',
        templateUrl: 'modules/core/client/views/admin/booklists/dashboard.view-booklist.client.view.html',
        controller: 'BooklistAdminController',
        resolve: {
          booklistResolve: ['$stateParams', 'Booklists', function ($stateParams, Booklists) {
            return Booklists.get({
              booklistId: $stateParams.booklistId
            });
          }]
        }
      })
      .state('admin.booklist-edit', {
        url: '/booklists/:booklistId/edit',
        templateUrl: 'modules/core/client/views/admin/booklists/dashboard.edit-booklist.client.view.html',
        controller: 'BooklistAdminController',
        resolve: {
          booklistResolve: ['$stateParams', 'Booklists', function ($stateParams, Booklists) {
            return Booklists.get({
              booklistId: $stateParams.booklistId
            });
          }]
        }
      });
  }
]);
